import type { LoopPattern, StepEvent } from '@/lib/generator/createLoopPattern';

function createNoiseBuffer(context: AudioContext): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate * 0.2, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function totalSteps(pattern: LoopPattern): number {
  return Math.max(1, pattern.bars * pattern.stepsPerBar);
}

function stepDurationSeconds(bpm: number): number {
  const safeBpm = Number.isFinite(bpm) && bpm > 1 ? bpm : 120;
  return (60 / safeBpm) / 4;
}

function emptyEvent(): StepEvent {
  return { freq: null, velocity: 0 };
}

function normalizeEvents(events: StepEvent[] | undefined, length: number): StepEvent[] {
  return Array.from({ length }, (_, i) => events?.[i] ?? emptyEvent());
}

function normalizePattern(pattern: LoopPattern): LoopPattern {
  const length = totalSteps(pattern);
  return {
    ...pattern,
    lead: normalizeEvents(pattern.lead, length),
    harmony: normalizeEvents(pattern.harmony, length),
    bass: normalizeEvents(pattern.bass, length),
    noise: normalizeEvents(pattern.noise, length),
  };
}

export class SimpleAudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private pattern: LoopPattern | null = null;
  private pendingPattern: LoopPattern | null = null;
  private isRunning = false;
  private nextNoteTime = 0;
  private stepCursor = 0;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.context) {
      this.context = new window.AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.7;
      this.masterGain.connect(this.context.destination);
      this.noiseBuffer = createNoiseBuffer(this.context);
    }
    return this.context;
  }

  private resetTransport(now: number) {
    this.stepCursor = 0;
    this.nextNoteTime = now + 0.05;
  }

  async start(pattern: LoopPattern) {
    const context = this.ensureContext();
    if (!context || !this.masterGain) return;
    await context.resume();

    this.pattern = normalizePattern(pattern);
    this.pendingPattern = null;
    this.resetTransport(context.currentTime);

    this.masterGain.gain.cancelScheduledValues(context.currentTime);
    this.masterGain.gain.setValueAtTime(this.pattern.palette.masterGain, context.currentTime);

    if (this.timerId === null) {
      this.timerId = window.setInterval(() => this.scheduler(), 25);
    }

    this.isRunning = true;
  }

  updatePattern(pattern: LoopPattern) {
    const safePattern = normalizePattern(pattern);

    if (!this.isRunning || !this.context || !this.masterGain || !this.pattern) {
      this.pattern = safePattern;
      this.pendingPattern = null;
      return;
    }

    this.pendingPattern = safePattern;
  }

  stop() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    this.isRunning = false;
    this.pendingPattern = null;

    if (this.context && this.masterGain) {
      const now = this.context.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.04);
    }
  }

  private applyPendingPattern(atTime: number) {
    if (!this.pendingPattern || !this.masterGain) return;

    this.pattern = this.pendingPattern;
    this.pendingPattern = null;
    this.stepCursor = 0;
    this.nextNoteTime = atTime;

    this.masterGain.gain.cancelScheduledValues(atTime);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, atTime);
    this.masterGain.gain.linearRampToValueAtTime(this.pattern.palette.masterGain, atTime + 0.03);
  }

  private scheduler() {
    const context = this.context;
    if (!context || !this.masterGain || !this.pattern) return;

    if (!Number.isFinite(this.nextNoteTime) || this.nextNoteTime < context.currentTime - 0.2 || this.nextNoteTime > context.currentTime + 0.5) {
      this.resetTransport(context.currentTime);
    }

    while (this.nextNoteTime < context.currentTime + 0.15) {
      let activePattern = this.pattern;
      const currentLoopLength = totalSteps(activePattern);
      const stepInLoop = ((this.stepCursor % currentLoopLength) + currentLoopLength) % currentLoopLength;

      // パターン差し替えは小節頭だけで行う。長さやBPMが変わっても崩れにくい。
      if (this.pendingPattern && stepInLoop % activePattern.stepsPerBar === 0) {
        this.applyPendingPattern(this.nextNoteTime);
        if (!this.pattern) return;
        activePattern = this.pattern;
      }

      const loopLength = totalSteps(activePattern);
      const step = ((this.stepCursor % loopLength) + loopLength) % loopLength;
      this.scheduleStep(activePattern, step, this.nextNoteTime);

      this.stepCursor += 1;
      this.nextNoteTime += stepDurationSeconds(activePattern.bpm);
    }
  }

  private scheduleStep(pattern: LoopPattern, step: number, time: number) {
    const leadEvent = pattern.lead[step] ?? emptyEvent();
    const harmonyEvent = pattern.harmony[step] ?? emptyEvent();
    const bassEvent = pattern.bass[step] ?? emptyEvent();
    const noiseEvent = pattern.noise[step] ?? emptyEvent();

    this.playTone(leadEvent, time, pattern.palette.leadType, pattern.palette.leadDuration, pattern.palette.leadAttack, pattern.palette.leadRelease, pattern.palette.toneCutoff);
    this.playTone(harmonyEvent, time, pattern.palette.harmonyType, pattern.palette.harmonyDuration, pattern.palette.harmonyAttack, pattern.palette.harmonyRelease, pattern.palette.toneCutoff * 0.9);
    this.playTone(bassEvent, time, pattern.palette.bassType, pattern.palette.bassDuration, pattern.palette.bassAttack, pattern.palette.bassRelease, Math.max(700, pattern.palette.toneCutoff * 0.55));
    this.playNoise(noiseEvent, time, 0.05, pattern.palette.noiseCutoff);
  }

  private playTone(event: StepEvent, time: number, type: OscillatorType, duration: number, attack: number, release: number, cutoff: number) {
    if (!this.context || !this.masterGain || event.freq === null || event.velocity <= 0) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    filter.type = type === 'sawtooth' ? 'lowpass' : 'bandpass';
    filter.frequency.value = cutoff;

    osc.type = type;
    osc.frequency.value = event.freq;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(event.velocity, time + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(duration, release));
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private playNoise(event: StepEvent, time: number, duration: number, cutoff: number) {
    if (!this.context || !this.masterGain || !this.noiseBuffer || event.velocity <= 0) return;
    const source = this.context.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = cutoff;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(event.velocity, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(time);
    source.stop(time + duration + 0.02);
  }
}
