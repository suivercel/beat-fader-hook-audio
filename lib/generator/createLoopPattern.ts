import type { InternalParams, PublicParams } from '@/lib/types/music';
import { MEGURI_TO_BARS, TENPO_TO_BPM } from '@/lib/constants/mappings';

export type StepEvent = {
  freq: number | null;
  velocity: number;
  kind?: 'tone' | 'noise';
};

export type LoopPattern = {
  bpm: number;
  bars: number;
  stepsPerBar: number;
  lead: StepEvent[];
  harmony: StepEvent[];
  bass: StepEvent[];
  noise: StepEvent[];
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

function scaleFromParams(publicParams: PublicParams, internalParams: InternalParams): string[] {
  if (publicParams.oora === 'BRIGHT') return ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'];
  if (publicParams.oora === 'CALM') return ['C4', 'D4', 'E4', 'G4', 'B4', 'C5'];
  if (publicParams.oora === 'DARK') return ['C4', 'D4', 'D#4', 'G4', 'A#4', 'C5'];
  if (internalParams.iro === 'HEAVY') return ['C4', 'D4', 'D#4', 'F4', 'G4', 'A#4'];
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
        ? [0, 3, 7, 10, 12]
        : nori === 'SWING'
          ? [0, 5, 8, 13]
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

export function createLoopPattern(
  publicParams: PublicParams,
  internalParams: InternalParams,
): LoopPattern {
  const bars = MEGURI_TO_BARS[publicParams.meguri];
  const bpm = TENPO_TO_BPM[publicParams.tenpo];
  const stepsPerBar = 16;
  const totalSteps = bars * stepsPerBar;
  const scale = scaleFromParams(publicParams, internalParams);
  const motif = motifIndexes(internalParams.kuse);
  const activeLeadSteps = rhythmSteps(internalParams.nori, totalSteps);

  const lead: StepEvent[] = Array.from({ length: totalSteps }, () => ({ freq: null, velocity: 0 }));
  const harmony: StepEvent[] = Array.from({ length: totalSteps }, () => ({ freq: null, velocity: 0 }));
  const bass: StepEvent[] = Array.from({ length: totalSteps }, () => ({ freq: null, velocity: 0 }));
  const noise: StepEvent[] = Array.from({ length: totalSteps }, () => ({ freq: null, velocity: 0, kind: 'noise' }));

  let leadIndex = Math.abs(internalParams.tane) % motif.length;
  for (const step of activeLeadSteps) {
    const noteName = scale[motif[leadIndex % motif.length] % scale.length];
    lead[step] = { freq: NOTE_TO_FREQ[noteName], velocity: 0.16 };

    if (internalParams.kazari !== 'NONE' && step + 1 < totalSteps && step % 8 === 0) {
      const nextName = scale[(motif[(leadIndex + 1) % motif.length] + 1) % scale.length];
      harmony[step + 1] = {
        freq: NOTE_TO_FREQ[nextName],
        velocity: internalParams.kazari === 'MID' ? 0.08 : 0.05,
      };
    }
    leadIndex += 1;
  }

  const bassLine = bassRoots(scale, bars);
  for (let bar = 0; bar < bars; bar += 1) {
    const baseStep = bar * stepsPerBar;
    const bassFreq = NOTE_TO_FREQ[bassLine[bar]];
    bass[baseStep] = { freq: bassFreq, velocity: 0.14 };
    bass[baseStep + 8] = { freq: bassFreq, velocity: 0.1 };
  }

  for (let i = 0; i < totalSteps; i += 1) {
    const inBar = i % 16;
    const strong = inBar === 0 || inBar === 8;
    const medium = inBar === 4 || inBar === 12;
    if (strong) {
      noise[i] = { freq: 1, velocity: 0.22, kind: 'noise' };
    } else if (medium || (internalParams.kizami !== 'LOW' && inBar % 4 === 2)) {
      noise[i] = {
        freq: 1,
        velocity: internalParams.kizami === 'HIGH' ? 0.14 : 0.09,
        kind: 'noise',
      };
    }
  }

  if (publicParams.ikioi === 'LOW') {
    for (let i = 0; i < totalSteps; i += 1) {
      if (i % 8 === 4) lead[i] = { freq: null, velocity: 0 };
    }
  }

  if (publicParams.ikioi === 'MAX') {
    for (let i = 2; i < totalSteps; i += 8) {
      if (lead[i].freq === null) {
        lead[i] = { freq: NOTE_TO_FREQ[scale[(i / 2) % scale.length]], velocity: 0.1 };
      }
    }
  }

  return { bpm, bars, stepsPerBar, lead, harmony, bass, noise };
}
