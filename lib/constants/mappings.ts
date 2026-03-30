import type { Meguri, Tenpo } from '@/lib/types/music';

export const TENPO_TO_BPM: Record<Tenpo, number> = {
  SLOW: 96,
  'MID-SLOW': 112,
  MID: 128,
  'MID-FAST': 144,
  FAST: 160,
};

export const MEGURI_TO_BARS: Record<Meguri, number> = {
  SHORT: 2,
  MID: 4,
  LONG: 8,
};
