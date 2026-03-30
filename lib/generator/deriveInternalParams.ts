import type { InternalParams, PublicParams } from '@/lib/types/music';

function chooseBySeed<T>(seed: number, items: T[]): T {
  return items[Math.abs(seed) % items.length];
}

export function deriveInternalParams(
  publicParams: PublicParams,
  tane: number,
): InternalParams {
  const { oora, ikioi, tenpo, meguri } = publicParams;

  const iro =
    oora === 'CALM'
      ? 'CLEAR'
      : oora === 'BRIGHT'
        ? 'CLEAR'
        : oora === 'DARK'
          ? chooseBySeed(tane, ['COOL', 'HEAVY'])
          : 'HEAVY';

  const kuse =
    meguri === 'SHORT'
      ? chooseBySeed(tane, ['STRAIGHT', 'JUMP'])
      : meguri === 'MID'
        ? chooseBySeed(tane, ['STRAIGHT', 'WAVE'])
        : chooseBySeed(tane, ['WAVE', 'SHARP']);

  const nori =
    oora === 'CALM'
      ? chooseBySeed(tane, ['STEP', 'BREAK'])
      : oora === 'BRIGHT'
        ? chooseBySeed(tane, ['STEP', 'SWING'])
        : oora === 'DARK'
          ? chooseBySeed(tane, ['PUSH', 'STEP'])
          : 'PUSH';

  const kazari =
    ikioi === 'LOW'
      ? 'NONE'
      : ikioi === 'MID'
        ? 'LIGHT'
        : 'MID';

  const kizami =
    ikioi === 'LOW'
      ? 'LOW'
      : ikioi === 'MID'
        ? 'MID'
        : ikioi === 'HIGH'
          ? 'MID'
          : 'HIGH';

  const yuragi =
    tenpo === 'FAST' || oora === 'HARD'
      ? 'TIGHT'
      : tenpo === 'SLOW'
        ? 'LOOSE'
        : 'NATURAL';

  return {
    tane,
    iro,
    kuse,
    nori,
    kazari,
    kizami,
    yuragi,
  };
}
