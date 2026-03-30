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

export type BfhaParams = {
  tane: number;
  oora: number;
  ikioi: number;
  tenpo: number;
  meguri: number;
  nori: number;
  kazari: number;
  kizami: number;
  iro: number;
};

export type BfhaRenderNote = {
  step: number;
  length: number;
  velocity: number;
  note?: string;
  type?: string;
};

export type BfhaRender = {
  bpm: number;
  bars: number;
  leadPattern: BfhaRenderNote[];
  bassPattern: BfhaRenderNote[];
  noisePattern: BfhaRenderNote[];
};

export type BfhaTokenData = {
  version: 1;
  app: 'BFHA';
  tokenType: 'music-loop';
  params: BfhaParams;
  render: BfhaRender;
  meta?: {
    title?: string;
    createdAt?: string;
  };
};
