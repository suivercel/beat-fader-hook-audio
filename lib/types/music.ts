export type Oora = 'CALM' | 'BRIGHT' | 'DARK' | 'HARD';
export type Ikioi = 'LOW' | 'MID' | 'HIGH' | 'MAX';
export type Tenpo = 'SLOW' | 'MID-SLOW' | 'MID' | 'MID-FAST' | 'FAST';
export type Meguri = 'SHORT' | 'MID' | 'LONG';

export type Iro = 'CLEAR' | 'COOL' | 'HEAVY' | 'MIST';
export type Kuse = 'STRAIGHT' | 'JUMP' | 'WAVE' | 'SHARP';
export type Nori = 'STEP' | 'PUSH' | 'SWING' | 'BREAK';
export type Kazari = 'NONE' | 'LIGHT' | 'MID' | 'RICH';
export type Kizami = 'LOW' | 'MID' | 'HIGH' | 'PEAK';
export type Yuragi = 'TIGHT' | 'NATURAL' | 'LOOSE';

export type PublicParams = {
  oora: Oora;
  ikioi: Ikioi;
  tenpo: Tenpo;
  meguri: Meguri;
};

export type InternalParams = {
  tane: number;
  iro: Iro;
  kuse: Kuse;
  nori: Nori;
  kazari: Kazari;
  kizami: Kizami;
  yuragi: Yuragi;
};

export type LoopState = {
  publicParams: PublicParams;
  internalParams: InternalParams;
};

export type PlaybackStatus = 'idle' | 'playing' | 'stopped';

export type ScheduledChange = Partial<PublicParams> | null;

export type PlayerState = {
  status: PlaybackStatus;
  currentBar: number;
  currentStep: number;
  pendingChange: ScheduledChange;
};

export type SavedLoop = {
  version: 1;
  publicParams: PublicParams;
  tane: number;
};
