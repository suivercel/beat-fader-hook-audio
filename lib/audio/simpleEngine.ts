import type { LoopPattern, StepEvent } from '@/lib/generator/createLoopPattern';

function createNoiseBuffer(context: AudioContext): AudioBuffer {
  const buffer = context.createBuffer(1, context.sampleRate * 0.2, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export class SimpleAudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private nextNoteTime = 0;
  private currentStep = 0;
  private timerId: number | null = null;
  private pattern: LoopPattern | null = null;
  private noiseBuffer: AudioBuffer | null = null;

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

  async start(pattern: LoopPattern) {
    const context = this.ensureContext();
    if (!context || !this.masterGain) return;
    await context.resume();
    this.stop();
    this.pattern = pattern;
    this.masterGain.gain.value = pattern.palette.masterGain;
    this.currentStep = 0;
    this.nextNoteTime = context.currentTime + 0.05;
    this.timerId = window.setInterval(() => this.scheduler(), 25);
  }

  stop() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private scheduler() {
    const context = this.context;
    const pattern = this.pattern;
    if (!context || !this.masterGain || !pattern) return;

    while (this.nextNoteTime < context.currentTime + 0.15) {
      this.scheduleStep(pattern, this.currentStep, this.nextNoteTime);
      this.advanceStep(pattern);
    }
  }

  private advanceStep(pattern: LoopPattern) {
    const secondsPerStep = (60 / pattern.bpm) / 4;
    this.nextNoteTime += secondsPerStep;
    this.currentStep = (this.currentStep + 1) % (pattern.bars * pattern.stepsPerBar);
  }

  private scheduleStep(pattern: LoopPattern, step: number, time: number) {
    this.playTone(pattern.lead[step], time, pattern.palette.leadType, pattern.palette.leadDuration);
    this.playTone(pattern.harmony[step], time, pattern.palette.harmonyType, pattern.palette.harmonyDuration);
    this.playTone(pattern.bass[step], time, pattern.palette.bassType, pattern.palette.bassDuration);
    this.playNoise(pattern.noise[step], time, 0.05, pattern.palette.noiseCutoff);
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
