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
  private isRunning = false;

  private nextNoteTime = 0;
  private stepCursor = 0;
  private transportAnchorTime = 0;

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

  private setAnchorFromNow(now: number, bpm: number) {
    const stepDuration = stepDurationSeconds(bpm);
    this.nextNoteTime = now + 0.05;
    this.transportAnchorTime = this.nextNoteTime - this.stepCursor * stepDuration;
  }

  async start(pattern: LoopPattern) {
    const context = this.ensureContext();
    if (!context || !this.masterGain) return;
    await context.resume();

    const safePattern = normalizePattern(pattern);
    this.pattern = safePattern;

    if (!this.isRunning) {
      this.stepCursor = 0;
      this.setAnchorFromNow(context.currentTime, safePattern.bpm);
    }

    this.masterGain.gain.cancelScheduledValues(context.currentTime);
    this.masterGain.gain.setValueAtTime(safePattern.palette.masterGain, context.currentTime);

    if (this.timerId === null) {
      this.timerId = window.setInterval(() => this.scheduler(), 25);
    }

    this.isRunning = true;
  }

  updatePattern(pattern: LoopPattern) {
    const safePattern = normalizePattern(pattern);
    this.pattern = safePattern;

    const context = this.context;
    if (!context || !this.masterGain) return;

    this.masterGain.gain.cancelScheduledValues(context.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(safePattern.palette.masterGain, context.currentTime + 0.04);

    const stepDuration = stepDurationSeconds(safePattern.bpm);
    const skew = this.nextNoteTime - context.currentTime;

    if (!Number.isFinite(this.nextNoteTime) || !Number.isFinite(this.transportAnchorTime) || skew < -0.12 || skew > 0.3) {
      this.setAnchorFromNow(context.currentTime, safePattern.bpm);
      return;
    }

    this.transportAnchorTime = this.nextNoteTime - this.stepCursor * stepDuration;
  }

  stop() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    this.isRunning = false;

    if (this.context && this.masterGain) {
      const now = this.context.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.04);
    }
  }

  private scheduler() {
    const context = this.context;
    const pattern = this.pattern;
    if (!context || !this.masterGain || !pattern) return;

    if (!Number.isFinite(this.nextNoteTime) || !Number.isFinite(this.transportAnchorTime)) {
      this.setAnchorFromNow(context.currentTime, pattern.bpm);
    }

    const stepDuration = stepDurationSeconds(pattern.bpm);
    if (this.nextNoteTime < context.currentTime - 0.12 || this.nextNoteTime > context.currentTime + 0.5) {
      this.setAnchorFromNow(context.currentTime, pattern.bpm);
    }

    while (this.nextNoteTime < context.currentTime + 0.15) {
      const loopLength = totalSteps(pattern);
      const step = ((this.stepCursor % loopLength) + loopLength) % loopLength;
      this.scheduleStep(pattern, step, this.nextNoteTime);
      this.stepCursor += 1;
      this.nextNoteTime = this.transportAnchorTime + this.stepCursor * stepDuration;
    }
  }

  private scheduleStep(pattern: LoopPattern, step: number, time: number) {
    const leadEvent = pattern.lead[step] ?? emptyEvent();
    const harmonyEvent = pattern.harmony[step] ?? emptyEvent();
    const bassEvent = pattern.bass[step] ?? emptyEvent();
    const noiseEvent = pattern.noise[step] ?? emptyEvent();

    this.playTone(leadEvent, time, pattern.palette.leadType, pattern.palette.leadDuration);
    this.playTone(harmonyEvent, time, pattern.palette.harmonyType, pattern.palette.harmonyDuration);
    this.playTone(bassEvent, time, pattern.palette.bassType, pattern.palette.bassDuration);
    this.playNoise(noiseEvent, time, 0.05, pattern.palette.noiseCutoff);
  }

  private playTone(event: StepEvent, time: number, type: OscillatorType, duration: number) {
    if (!this.context || !this.masterGain || event.freq === null || event.velocity <= 0) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    filter.type = type === 'sawtooth' ? 'lowpass' : 'bandpass';
    filter.frequency.value = type === 'triangle' ? 2200 : type === 'sine' ? 1600 : 2800;

    osc.type = type;
    osc.frequency.value = event.freq;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(event.velocity, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
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
