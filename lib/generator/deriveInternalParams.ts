import type {
  InternalParams,
  PublicParams,
  Iro,
  Kuse,
  Nori,
  Kazari,
  Kizami,
  Tone,
  Shape,
  Yuragi,
} from '@/lib/types/music';

function chooseBySeed<T>(seed: number, items: readonly T[]): T {
  return items[Math.abs(seed) % items.length];
}

export function deriveInternalParams(
  publicParams: PublicParams,
  tane: number,
): InternalParams {
  const { oora, ikioi, tenpo, meguri } = publicParams;

  const iro: Iro =
    oora === 'CALM'
      ? 'CLEAR'
      : oora === 'BRIGHT'
        ? 'CLEAR'
        : oora === 'DARK'
          ? chooseBySeed(tane, ['CRISP', 'HEAVY'] as const)
          : 'HEAVY';

  const tone: Tone =
    oora === 'CALM'
      ? 'WARM'
      : oora === 'BRIGHT'
        ? 'OPEN'
        : oora === 'DARK'
          ? 'DUSK'
          : 'BRIGHT';

  const shape: Shape =
    ikioi === 'LOW'
      ? 'SOFT'
      : ikioi === 'MID'
        ? 'ROUND'
        : ikioi === 'HIGH'
          ? 'TIGHT'
          : 'SHARP';

  const kuse: Kuse =
    meguri === 'SHORT'
      ? chooseBySeed(tane, ['STRAIGHT', 'JUMP'] as const)
      : meguri === 'MID'
        ? chooseBySeed(tane, ['STRAIGHT', 'WAVE'] as const)
        : chooseBySeed(tane, ['WAVE', 'SHARP'] as const);

  const nori: Nori =
    oora === 'CALM'
      ? chooseBySeed(tane, ['STEP', 'BREAK'] as const)
      : oora === 'BRIGHT'
        ? chooseBySeed(tane, ['STEP', 'SWING'] as const)
        : oora === 'DARK'
          ? chooseBySeed(tane, ['PUSH', 'STEP'] as const)
          : 'PUSH';

  const kazari: Kazari =
    ikioi === 'LOW'
      ? 'NONE'
      : ikioi === 'MID'
        ? 'LIGHT'
        : 'MID';

  const kizami: Kizami =
    ikioi === 'LOW'
      ? 'LOW'
      : ikioi === 'MID'
        ? 'MID'
        : ikioi === 'HIGH'
          ? 'MID'
          : 'HIGH';

  const yuragi: Yuragi =
    tenpo === 'FAST' || oora === 'HARD'
      ? 'TIGHT'
      : tenpo === 'SLOW'
        ? 'LOOSE'
        : 'NATURAL';

  return {
    tane,
    iro,
    tone,
    shape,
    kuse,
    nori,
    kazari,
    kizami,
    yuragi,
  };
}
