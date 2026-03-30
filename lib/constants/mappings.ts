import type {
  BfhaParams,
  Ikioi,
  Iro,
  Kazari,
  Kizami,
  Meguri,
  Nori,
  Oora,
  PublicParams,
  Tenpo,
} from '@/lib/types/music';

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

export const UI_TO_PARAMS = {
  oora: {
    CALM: 10,
    BRIGHT: 35,
    DARK: 65,
    HARD: 90,
  } satisfies Record<Oora, number>,
  ikioi: {
    LOW: 15,
    MID: 45,
    HIGH: 70,
    MAX: 95,
  } satisfies Record<Ikioi, number>,
  tenpo: {
    SLOW: 10,
    'MID-SLOW': 30,
    MID: 50,
    'MID-FAST': 70,
    FAST: 90,
  } satisfies Record<Tenpo, number>,
  meguri: {
    SHORT: 15,
    MID: 50,
    LONG: 85,
  } satisfies Record<Meguri, number>,
  nori: {
    STEP: 15,
    PUSH: 40,
    SWING: 65,
    BREAK: 90,
  } satisfies Record<Nori, number>,
  kazari: {
    NONE: 5,
    LIGHT: 30,
    MID: 60,
    RICH: 90,
  } satisfies Record<Kazari, number>,
  kizami: {
    LOW: 15,
    MID: 45,
    HIGH: 70,
    PEAK: 95,
  } satisfies Record<Kizami, number>,
  iro: {
    CLEAR: 10,
    COOL: 35,
    HEAVY: 65,
    MIST: 90,
  } satisfies Record<Iro, number>,
} as const;

export type UiState = {
  oora: Oora;
  ikioi: Ikioi;
  tenpo: Tenpo;
  meguri: Meguri;
  nori: Nori;
  kazari: Kazari;
  kizami: Kizami;
  iro: Iro;
};

export function nearestLabel<T extends string>(value: number, table: Record<T, number>): T {
  const entries = Object.entries(table) as [T, number][];
  return entries.reduce((best, current) => {
    return Math.abs(current[1] - value) < Math.abs(best[1] - value) ? current : best;
  })[0];
}

export function uiToBfhaParams(ui: UiState, tane: number): BfhaParams {
  return {
    tane,
    oora: UI_TO_PARAMS.oora[ui.oora],
    ikioi: UI_TO_PARAMS.ikioi[ui.ikioi],
    tenpo: UI_TO_PARAMS.tenpo[ui.tenpo],
    meguri: UI_TO_PARAMS.meguri[ui.meguri],
    nori: UI_TO_PARAMS.nori[ui.nori],
    kazari: UI_TO_PARAMS.kazari[ui.kazari],
    kizami: UI_TO_PARAMS.kizami[ui.kizami],
    iro: UI_TO_PARAMS.iro[ui.iro],
  };
}

export function paramsToUi(params: BfhaParams): UiState {
  return {
    oora: nearestLabel(params.oora, UI_TO_PARAMS.oora),
    ikioi: nearestLabel(params.ikioi, UI_TO_PARAMS.ikioi),
    tenpo: nearestLabel(params.tenpo, UI_TO_PARAMS.tenpo),
    meguri: nearestLabel(params.meguri, UI_TO_PARAMS.meguri),
    nori: nearestLabel(params.nori, UI_TO_PARAMS.nori),
    kazari: nearestLabel(params.kazari, UI_TO_PARAMS.kazari),
    kizami: nearestLabel(params.kizami, UI_TO_PARAMS.kizami),
    iro: nearestLabel(params.iro, UI_TO_PARAMS.iro),
  };
}

export function paramToBpm(value: number): number {
  const min = 90;
  const max = 160;
  return Math.round(min + (max - min) * (Math.max(0, Math.min(100, value)) / 100));
}

export function paramToBars(value: number): number {
  const v = Math.max(0, Math.min(100, value));
  if (v < 34) return 2;
  if (v < 67) return 4;
  return 8;
}

export function publicParamsToUi(
  publicParams: PublicParams,
  extras: Pick<UiState, 'nori' | 'kazari' | 'kizami' | 'iro'>,
): UiState {
  return {
    ...publicParams,
    ...extras,
  };
}
