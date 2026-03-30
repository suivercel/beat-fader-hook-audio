import type { InternalParams, PlayerState, PublicParams } from '@/lib/types/music';

export const DEFAULT_PUBLIC_PARAMS: PublicParams = {
  oora: 'BRIGHT',
  ikioi: 'MID',
  tenpo: 'MID',
  meguri: 'SHORT',
};

export const DEFAULT_INTERNAL_PARAMS: InternalParams = {
  tane: 100001,
  iro: 'CLEAR',
  kuse: 'STRAIGHT',
  nori: 'STEP',
  kazari: 'LIGHT',
  kizami: 'MID',
  yuragi: 'NATURAL',
};

export const DEFAULT_PLAYER_STATE: PlayerState = {
  status: 'idle',
  currentBar: 0,
  currentStep: 0,
  pendingChange: null,
};
