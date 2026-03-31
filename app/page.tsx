'use client';

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { KnobCard } from '@/components/KnobCard';
import { SimpleAudioEngine } from '@/lib/audio/simpleEngine';
import { DEFAULT_PUBLIC_PARAMS } from '@/lib/constants/defaults';
import { publicParamsToUi, uiToBfhaParams } from '@/lib/constants/mappings';
import { buildBfhaTokenData, createLoopPattern } from '@/lib/generator/createLoopPattern';
import { createSeed } from '@/lib/generator/createSeed';
import { deriveInternalParams } from '@/lib/generator/deriveInternalParams';
import type {
  Ikioi,
  Iro,
  Shape,
  Tone,
  Kazari,
  Kizami,
  Meguri,
  Nori,
  Oora,
  PublicParams,
  Tenpo,
} from '@/lib/types/music';

const OORA_VALUES: Oora[] = ['CALM', 'BRIGHT', 'DARK', 'HARD'];
const IKIOI_VALUES: Ikioi[] = ['LOW', 'MID', 'HIGH', 'MAX'];
const TENPO_VALUES: Tenpo[] = ['SLOW', 'MID-SLOW', 'MID', 'MID-FAST', 'FAST'];
const MEGURI_VALUES: Meguri[] = ['SHORT', 'MID', 'LONG'];

const NORI_VALUES: Nori[] = ['STEP', 'PUSH', 'SWING', 'BREAK'];
const KAZARI_VALUES: Kazari[] = ['NONE', 'LIGHT', 'MID', 'RICH'];
const KIZAMI_VALUES: Kizami[] = ['LOW', 'MID', 'HIGH', 'PEAK'];
const IRO_VALUES: Iro[] = ['CLEAR', 'CRISP', 'HEAVY', 'FLOAT'];
const TONE_VALUES: Tone[] = ['WARM', 'OPEN', 'BRIGHT', 'DUSK'];
const SHAPE_VALUES: Shape[] = ['SOFT', 'ROUND', 'TIGHT', 'SHARP'];

const BPM_BY_TENPO: Record<Tenpo, number> = {
  SLOW: 96,
  'MID-SLOW': 112,
  MID: 128,
  'MID-FAST': 144,
  FAST: 160,
};

function nextValue<T extends string>(current: T, values: readonly T[]): T {
  const index = values.indexOf(current);
  return values[(index + 1) % values.length];
}

type MiniToggleGroupProps<T extends string> = {
  label: string;
  values: readonly T[];
  activeValue: T;
  onSelect: (value: T) => void;
};

function MiniToggleGroup<T extends string>({ label, values, activeValue, onSelect }: MiniToggleGroupProps<T>) {
  return (
    <section className="miniGroup">
      <div className="miniLabel">{label}</div>
      <div className="miniOptions" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}>
        {values.map((value) => {
          const active = value === activeValue;
          return (
            <button
              key={value}
              type="button"
              className={`miniOption ${active ? 'miniOptionActive' : ''}`}
              onClick={() => onSelect(value)}
            >
              <span className="miniPad" />
              <span className="miniOptionText">{value}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [publicParams, setPublicParams] = useState<PublicParams>(DEFAULT_PUBLIC_PARAMS);
  const [tane, setTane] = useState<number>(createSeed());
  const [isPlaying, setIsPlaying] = useState(false);
  const [nori, setNori] = useState<Nori>('STEP');
  const [kazari, setKazari] = useState<Kazari>('LIGHT');
  const [kizami, setKizami] = useState<Kizami>('MID');
  const [iro, setIro] = useState<Iro>('CLEAR');
  const [tone, setTone] = useState<Tone>('OPEN');
  const [shape, setShape] = useState<Shape>('ROUND');
  const engineRef = useRef<SimpleAudioEngine | null>(null);

  const baseInternalParams = useMemo(() => deriveInternalParams(publicParams, tane), [publicParams, tane]);
  const beatSeconds = 60 / BPM_BY_TENPO[publicParams.tenpo];

  const uiState = useMemo(
    () =>
      publicParamsToUi(publicParams, {
        nori,
        kazari,
        kizami,
        iro,
        tone,
        shape,
      }),
    [publicParams, nori, kazari, kizami, iro, tone, shape],
  );

  const internalParams = useMemo(
    () => ({
      ...baseInternalParams,
      nori,
      kazari,
      kizami,
      iro,
      tone,
      shape,
    }),
    [baseInternalParams, nori, kazari, kizami, iro, tone, shape],
  );

  const pattern = useMemo(() => createLoopPattern(publicParams, internalParams), [publicParams, internalParams]);

  useEffect(() => {
    engineRef.current = new SimpleAudioEngine();
    return () => {
      engineRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (!isPlaying) {
      engine.stop();
      return;
    }

    void engine.start(pattern);
  }, [isPlaying, pattern]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const handleNewTane = () => {
    setTane(createSeed());
  };

  const handleExportJson = () => {
    const params = uiToBfhaParams(uiState, tane);
    const tokenData = buildBfhaTokenData({
      params,
      pattern,
      title: `Bit8 Fader Hook Audio Loop ${tane}`,
      createdAt: new Date().toISOString(),
    });

    const blob = new Blob([JSON.stringify(tokenData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `bit8-fader-hook-audio-${tane}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const knobs = [
    {
      label: 'OORA',
      value: publicParams.oora,
      onClick: () => setPublicParams((prev) => ({ ...prev, oora: nextValue(prev.oora, OORA_VALUES) })),
    },
    {
      label: 'IKIOI',
      value: publicParams.ikioi,
      onClick: () => setPublicParams((prev) => ({ ...prev, ikioi: nextValue(prev.ikioi, IKIOI_VALUES) })),
    },
    {
      label: 'TENPO',
      value: publicParams.tenpo,
      onClick: () => setPublicParams((prev) => ({ ...prev, tenpo: nextValue(prev.tenpo, TENPO_VALUES) })),
    },
    {
      label: 'MEGURI',
      value: publicParams.meguri,
      onClick: () => setPublicParams((prev) => ({ ...prev, meguri: nextValue(prev.meguri, MEGURI_VALUES) })),
    },
  ];

  const turntableStyle = {
    '--bfha-beat': `${beatSeconds}s`,
    '--bfha-beat-double': `${beatSeconds * 2}s`,
    '--bfha-beat-half': `${Math.max(beatSeconds * 0.5, 0.18)}s`,
  } as CSSProperties;

  return (
    <main className="pageRoot">
      <div className="shell">
        <div className="headerRow">
          <div>
            <div className="eyebrow">Mix Bits. Mint Sound.</div>
            <h1 className="title">Bit8 Fader Hook Audio</h1>
          </div>
          <div className="pillRow">
            <div className="pill">TANE: {tane}</div>
            <div className="pill">{isPlaying ? 'PLAYING' : 'STOPPED'}</div>
          </div>
        </div>

        <div className="contentGrid">
          <section className="mainPanel" style={turntableStyle}>
            <div className={`turntableWrap ${isPlaying ? 'turntableActive' : ''}`}>
              <div className="ring ring0" />
              <div className="ring ring1" />
              <div className="ring ring2" />
              <div className="ring ring3" />
              <div className="centerGlow" />
              <div className="centerHub" />
            </div>

            <div className={`knobGrid ${isPlaying ? 'knobGridActive' : ''}`}>
              {knobs.map((knob) => (
                <KnobCard key={knob.label} label={knob.label} value={knob.value} onClick={knob.onClick} />
              ))}
            </div>

            <div className="miniGrid">
              <MiniToggleGroup label="NORI" values={NORI_VALUES} activeValue={nori} onSelect={setNori} />
              <MiniToggleGroup label="KAZARI" values={KAZARI_VALUES} activeValue={kazari} onSelect={setKazari} />
              <MiniToggleGroup label="KIZAMI" values={KIZAMI_VALUES} activeValue={kizami} onSelect={setKizami} />
              <MiniToggleGroup label="IRO" values={IRO_VALUES} activeValue={iro} onSelect={setIro} />
              <MiniToggleGroup label="TONE" values={TONE_VALUES} activeValue={tone} onSelect={setTone} />
              <MiniToggleGroup label="SHAPE" values={SHAPE_VALUES} activeValue={shape} onSelect={setShape} />
            </div>

            <section className="actionsPanel">
              <button type="button" className={isPlaying ? 'buttonSecondary' : 'buttonPrimary'} onClick={handlePlay}>PLAY</button>
              <button type="button" className={isPlaying ? 'buttonPrimary' : 'buttonSecondary'} onClick={handleStop}>STOP</button>
              <button type="button" className="buttonSecondary buttonWide" onClick={handleNewTane}>NEW TANE</button>
              <button type="button" className="buttonSecondary buttonWide" onClick={handleExportJson}>EXPORT JSON</button>
            </section>
          </section>
        </div>
      </div>

      
    </main>
  );
}
