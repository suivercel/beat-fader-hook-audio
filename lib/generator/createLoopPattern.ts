import type {
  BfhaParams,
  BfhaRender,
  BfhaRenderNote,
  BfhaTokenData,
  InternalParams,
  PublicParams,
} from '@/lib/types/music';
import { MEGURI_TO_BARS, TENPO_TO_BPM } from '@/lib/constants/mappings';

export type StepEvent = {
  freq: number | null;
  velocity: number;
  kind?: 'tone' | 'noise';
};

export type TonePalette = {
  leadType: OscillatorType;
  harmonyType: OscillatorType;
  bassType: OscillatorType;
  leadDuration: number;
  harmonyDuration: number;
  bassDuration: number;
  masterGain: number;
  noiseCutoff: number;
  leadAttack: number;
  leadRelease: number;
  bassAttack: number;
  bassRelease: number;
  harmonyAttack: number;
  harmonyRelease: number;
};

export type LoopPattern = {
  bpm: number;
  bars: number;
  stepsPerBar: number;
  lead: StepEvent[];
  harmony: StepEvent[];
  bass: StepEvent[];
  noise: StepEvent[];
  palette: TonePalette;
};

const NOTE_TO_FREQ: Record<string, number> = {
  C3: 130.81,
  D3: 146.83,
  'D#3': 155.56,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  'A#3': 233.08,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  'D#4': 311.13,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  'A#4': 466.16,
  B4: 493.88,
  C5: 523.25,
};

const FREQ_TO_NOTE = Object.entries(NOTE_TO_FREQ).reduce<Record<number, string>>((acc, [note, freq]) => {
  acc[freq] = note;
  return acc;
}, {});

function scaleFromParams(publicParams: PublicParams, internalParams: InternalParams): string[] {
  if (internalParams.iro === 'FLOAT') return ['C4', 'D4', 'F4', 'G4', 'A#4', 'C5'];
  if (publicParams.oora === 'BRIGHT') return ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'];
  if (publicParams.oora === 'CALM') return ['C4', 'D4', 'E4', 'G4', 'B4', 'C5'];
  if (publicParams.oora === 'DARK') return ['C4', 'D4', 'D#4', 'G4', 'A#4', 'C5'];
  if (internalParams.iro === 'HEAVY') return ['C4', 'D4', 'D#4', 'F4', 'G4', 'A#4'];
  if (internalParams.iro === 'CRISP') return ['C4', 'E4', 'G4', 'A4', 'B4', 'C5'];
  return ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'];
}

function motifIndexes(kuse: InternalParams['kuse']): number[] {
  switch (kuse) {
    case 'JUMP':
      return [0, 3, 5, 2, 4, 1, 5, 3];
    case 'WAVE':
      return [0, 1, 2, 3, 2, 1, 4, 2];
    case 'SHARP':
      return [4, 3, 1, 0, 5, 3, 2, 0];
    case 'STRAIGHT':
    default:
      return [0, 2, 4, 2, 1, 2, 4, 5];
  }
}

function rhythmSteps(nori: InternalParams['nori'], totalSteps: number): number[] {
  const steps: number[] = [];
  for (let i = 0; i < totalSteps; i += 1) {
    const inBar = i % 16;
    const mask =
      nori === 'PUSH'
        ? [0, 3, 6, 7, 10, 12, 14]
        : nori === 'SWING'
          ? [0, 5, 8, 11, 13]
          : nori === 'BREAK'
            ? [0, 8, 12]
            : [0, 4, 8, 12];
    if (mask.includes(inBar)) steps.push(i);
  }
  return steps;
}

function bassRoots(scale: string[], bars: number): string[] {
  const base = [scale[0], scale[0], scale[3] ?? scale[0], scale[4] ?? scale[0]];
  return Array.from({ length: bars }, (_, i) => base[i % base.length].replace('4', '3'));
}

function paletteFromInternal(internalParams: InternalParams): TonePalette {
  const toneCutoff =
    internalParams.tone === 'WARM'
      ? 1500
      : internalParams.tone === 'OPEN'
        ? 2200
        : internalParams.tone === 'BRIGHT'
          ? 3400
          : 1100;

  const noiseCutoff =
    internalParams.tone === 'WARM'
      ? 1200
      : internalParams.tone === 'OPEN'
        ? 1900
        : internalParams.tone === 'BRIGHT'
          ? 3000
          : 900;

  const shape =
    internalParams.shape === 'SOFT'
      ? { attack: 0.016, release: 0.22, bassAttack: 0.018, bassRelease: 0.26 }
      : internalParams.shape === 'ROUND'
        ? { attack: 0.01, release: 0.18, bassAttack: 0.014, bassRelease: 0.22 }
        : internalParams.shape === 'TIGHT'
          ? { attack: 0.006, release: 0.12, bassAttack: 0.01, bassRelease: 0.18 }
          : { attack: 0.004, release: 0.09, bassAttack: 0.008, bassRelease: 0.16 };

  const base = internalParams.iro === 'HEAVY'
    ? { leadType: 'sawtooth' as OscillatorType, harmonyType: 'square' as OscillatorType, bassType: 'triangle' as OscillatorType, leadDuration: 0.14, harmonyDuration: 0.09, bassDuration: 0.22, masterGain: 0.74 }
    : internalParams.iro === 'CRISP'
      ? { leadType: 'sawtooth' as OscillatorType, harmonyType: 'square' as OscillatorType, bassType: 'triangle' as OscillatorType, leadDuration: 0.08, harmonyDuration: 0.06, bassDuration: 0.16, masterGain: 0.74 }
      : internalParams.iro === 'FLOAT'
        ? { leadType: 'sine' as OscillatorType, harmonyType: 'triangle' as OscillatorType, bassType: 'triangle' as OscillatorType, leadDuration: 0.22, harmonyDuration: 0.16, bassDuration: 0.24, masterGain: 0.72 }
        : { leadType: 'square' as OscillatorType, harmonyType: 'square' as OscillatorType, bassType: 'triangle' as OscillatorType, leadDuration: 0.12, harmonyDuration: 0.08, bassDuration: 0.18, masterGain: 0.7 };

  return {
    ...base,
    toneCutoff,
    noiseCutoff,
    leadAttack: shape.attack,
    leadRelease: shape.release,
    harmonyAttack: Math.max(0.004, shape.attack * 0.8),
    harmonyRelease: Math.max(0.08, shape.release * 0.9),
    bassAttack: shape.bassAttack,
    bassRelease: shape.bassRelease,
  };
}

export function createLoopPattern(publicParams: PublicParams, internalParams: InternalParams): LoopPattern {
  const bars = MEGURI_TO_BARS[publicParams.meguri];
  const bpm = TENPO_TO_BPM[publicParams.tenpo];
  const stepsPerBar = 16;
  const totalSteps = bars * stepsPerBar;
  const scale = scaleFromParams(publicParams, internalParams);
  const motif = motifIndexes(internalParams.kuse);
  const activeLeadSteps = rhythmSteps(internalParams.nori, totalSteps);
  const palette = paletteFromInternal(internalParams);
  const crispAccent = internalParams.iro === 'CRISP';
  const floatMode = internalParams.iro === 'FLOAT';

  const lead: StepEvent[] = Array.from({ length: totalSteps }, () => ({ freq: null, velocity: 0 }));
  const harmony: StepEvent[] = Array.from({ length: totalSteps }, () => ({ freq: null, velocity: 0 }));
  const bass: StepEvent[] = Array.from({ length: totalSteps }, () => ({ freq: null, velocity: 0 }));
  const noise: StepEvent[] = Array.from({ length: totalSteps }, () => ({ freq: null, velocity: 0, kind: 'noise' }));

  let leadIndex = Math.abs(internalParams.tane) % motif.length;
  for (const step of activeLeadSteps) {
    const noteName = scale[motif[leadIndex % motif.length] % scale.length];
    const leadVelocityBase =
      publicParams.ikioi === 'LOW' ? 0.13 : publicParams.ikioi === 'MID' ? 0.16 : publicParams.ikioi === 'HIGH' ? 0.18 : 0.2;
    const leadVelocity = floatMode ? leadVelocityBase * 0.92 : crispAccent ? leadVelocityBase * 1.08 : leadVelocityBase;

    lead[step] = { freq: NOTE_TO_FREQ[noteName], velocity: leadVelocity };

    if (internalParams.kazari !== 'NONE') {
      const ornamentOffset = internalParams.kazari === 'RICH' ? 1 : floatMode ? 3 : 2;
      if (step + ornamentOffset < totalSteps && step % 8 === 0) {
        const nextName = scale[(motif[(leadIndex + 1) % motif.length] + 1) % scale.length];
        harmony[step + ornamentOffset] = {
          freq: NOTE_TO_FREQ[nextName],
          velocity: internalParams.kazari === 'RICH' ? 0.1 : internalParams.kazari === 'MID' ? 0.08 : 0.05,
        };
      }
    }

    if (crispAccent && step + 1 < totalSteps && step % 4 === 0 && harmony[step + 1].freq === null) {
      harmony[step + 1] = {
        freq: NOTE_TO_FREQ[scale[(motif[leadIndex % motif.length] + 2) % scale.length]],
        velocity: 0.045,
      };
    }
    leadIndex += 1;
  }

  const bassLine = bassRoots(scale, bars);
  for (let bar = 0; bar < bars; bar += 1) {
    const baseStep = bar * stepsPerBar;
    const bassFreq = NOTE_TO_FREQ[bassLine[bar]];
    bass[baseStep] = { freq: bassFreq, velocity: floatMode ? 0.1 : 0.14 };
    bass[baseStep + 8] = { freq: bassFreq, velocity: internalParams.iro === 'HEAVY' ? 0.13 : floatMode ? 0.08 : 0.1 };
    if ((internalParams.kizami === 'HIGH' || internalParams.kizami === 'PEAK') && baseStep + 12 < totalSteps) {
      bass[baseStep + 12] = {
        freq: bassFreq,
        velocity: internalParams.kizami === 'PEAK' ? 0.09 : 0.07,
      };
    }
  }

  for (let i = 0; i < totalSteps; i += 1) {
    const inBar = i % 16;
    const strong = inBar === 0 || inBar === 8;
    const medium = inBar === 4 || inBar === 12;
    const highExtra = internalParams.kizami === 'HIGH' && (inBar === 2 || inBar === 6 || inBar === 10 || inBar === 14);
    const peakExtra = internalParams.kizami === 'PEAK' && (inBar === 1 || inBar === 2 || inBar === 6 || inBar === 10 || inBar === 14);

    if (strong) {
      noise[i] = { freq: 1, velocity: floatMode ? 0.16 : 0.22, kind: 'noise' };
    } else if (medium || (internalParams.kizami !== 'LOW' && inBar % 4 === 2) || highExtra || peakExtra) {
      noise[i] = {
        freq: 1,
        velocity: floatMode ? 0.08 : internalParams.kizami === 'PEAK' ? 0.17 : internalParams.kizami === 'HIGH' ? 0.16 : 0.1,
        kind: 'noise',
      };
    }
  }

  if (publicParams.ikioi === 'LOW') {
    for (let i = 0; i < totalSteps; i += 1) {
      if (i % 8 === 4) lead[i] = { freq: null, velocity: 0 };
    }
  }

  if (floatMode) {
    for (let i = 0; i < totalSteps; i += 1) {
      if (i % 8 !== 0 && i % 16 !== 4) {
        noise[i] = { freq: null, velocity: 0, kind: 'noise' };
      }
    }
    for (let bar = 0; bar < bars; bar += 1) {
      const padStep = bar * stepsPerBar + 4;
      const padNote = scale[(bar + 2) % scale.length];
      if (padStep < totalSteps) {
        harmony[padStep] = { freq: NOTE_TO_FREQ[padNote], velocity: 0.06 };
      }
    }
  }

  if (publicParams.ikioi === 'MAX') {
    for (let i = 2; i < totalSteps; i += 8) {
      if (lead[i].freq === null) {
        lead[i] = { freq: NOTE_TO_FREQ[scale[(i / 2) % scale.length]], velocity: 0.12 };
      }
    }
  }

  return { bpm, bars, stepsPerBar, lead, harmony, bass, noise, palette };
}

function eventArrayToRender(events: StepEvent[], kind: 'tone' | 'noise'): BfhaRenderNote[] {
  const result: BfhaRenderNote[] = [];
  for (let step = 0; step < events.length; step += 1) {
    const event = events[step];
    if (event.freq === null || event.velocity <= 0) continue;
    const nextSilent = events[step + 1]?.freq === null || step === events.length - 1;
    const length = nextSilent ? 1 : 2;

    if (kind === 'noise') {
      result.push({ step, type: event.velocity >= 0.18 ? 'accent' : 'hit', length, velocity: Number(event.velocity.toFixed(3)) });
    } else {
      result.push({
        step,
        note: FREQ_TO_NOTE[event.freq] ?? `FREQ_${event.freq.toFixed(2)}`,
        length,
        velocity: Number(event.velocity.toFixed(3)),
      });
    }
  }
  return result;
}

export function buildBfhaRender(pattern: LoopPattern): BfhaRender {
  return {
    bpm: pattern.bpm,
    bars: pattern.bars,
    leadPattern: eventArrayToRender(pattern.lead, 'tone'),
    bassPattern: eventArrayToRender(pattern.bass, 'tone'),
    noisePattern: eventArrayToRender(pattern.noise, 'noise'),
  };
}

export function buildBfhaTokenData(args: {
  params: BfhaParams;
  pattern: LoopPattern;
  title?: string;
  createdAt?: string;
}): BfhaTokenData {
  const { params, pattern, title, createdAt } = args;
  return {
    version: 1,
    app: 'BFHA',
    tokenType: 'music-loop',
    params,
    render: buildBfhaRender(pattern),
    meta: {
      title,
      createdAt,
    },
  };
}
