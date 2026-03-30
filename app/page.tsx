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
      }),
    [publicParams, nori, kazari, kizami, iro],
  );

  const internalParams = useMemo(
    () => ({
      ...baseInternalParams,
      nori,
      kazari,
      kizami,
      iro,
    }),
    [baseInternalParams, nori, kazari, kizami, iro],
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
      title: `BFHA Loop ${tane}`,
      createdAt: new Date().toISOString(),
    });

    const blob = new Blob([JSON.stringify(tokenData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `bfha-loop-${tane}.json`;
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
            <div className="eyebrow">Mix Beats. Mint Sound.</div>
            <h1 className="title">Beat Fader Hook Audio</h1>
          </div>
          <div className="pillRow">
            <div className="pill">TANE: {tane}</div>
            <div className="pill">{isPlaying ? 'PLAYING' : 'STOPPED'}</div>
          </div>
        </div>

        <div className="contentGrid">
          <section className="mainPanel">
            <div className={`turntableWrap ${isPlaying ? 'turntableActive' : ''}`} style={turntableStyle}>
              <div className="ring ring0" />
              <div className="ring ring1" />
              <div className="ring ring2" />
              <div className="ring ring3" />
              <div className="centerGlow" />
              <div className="centerHub" />
            </div>

            <div className="knobGrid">
              {knobs.map((knob) => (
                <KnobCard key={knob.label} label={knob.label} value={knob.value} onClick={knob.onClick} />
              ))}
            </div>

            <div className="miniGrid">
              <MiniToggleGroup label="NORI" values={NORI_VALUES} activeValue={nori} onSelect={setNori} />
              <MiniToggleGroup label="KAZARI" values={KAZARI_VALUES} activeValue={kazari} onSelect={setKazari} />
              <MiniToggleGroup label="KIZAMI" values={KIZAMI_VALUES} activeValue={kizami} onSelect={setKizami} />
              <MiniToggleGroup label="IRO" values={IRO_VALUES} activeValue={iro} onSelect={setIro} />
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

      <style jsx global>{`
        .pageRoot {
          min-height: 100vh;
          background: #0a0a0a;
          color: #fafafa;
          padding: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .shell {
          width: 100%;
          max-width: 1180px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(180deg, #121212 0%, #101010 100%);
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.46);
        }

        .headerRow {
          border-bottom: 1px solid rgba(255, 255, 255, 0.09);
          padding: 18px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .eyebrow,
        .miniLabel {
          font-size: 12px;
          letter-spacing: 0.28em;
          color: #6f7786;
        }

        .title {
          margin: 8px 0 0;
          font-size: 32px;
          line-height: 1.1;
          font-weight: 650;
        }

        .pillRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pill {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cfd5e3;
          font-size: 13px;
        }

        .contentGrid {
          padding: 22px 24px 24px;
        }

        .mainPanel {
          display: grid;
          gap: 16px;
        }

        .turntableWrap {
          position: relative;
          width: min(100%, 520px);
          aspect-ratio: 1 / 1;
          margin: 0 auto;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: radial-gradient(circle at 50% 48%, #181818 0%, #101010 65%, #0b0b0b 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -24px 50px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .ring {
          position: absolute;
          border-radius: 999px;
          border: 1px solid rgba(180, 194, 255, 0.14);
          transition: transform 0.14s ease, opacity 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease;
          will-change: transform, box-shadow, opacity;
        }

        .ring0 { inset: 2.5%; border-color: rgba(180, 194, 255, 0.10); }
        .ring1 { inset: 8%; }
        .ring2 { inset: 20%; border-color: rgba(180, 194, 255, 0.12); }
        .ring3 { inset: 31%; border-color: rgba(180, 194, 255, 0.10); }

        .centerGlow {
          position: absolute;
          inset: 36%;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(113,141,255,0.10) 0%, rgba(113,141,255,0.04) 42%, rgba(113,141,255,0.0) 72%);
          opacity: 0.48;
          transform: scale(1);
          transition: opacity 0.14s ease, transform 0.14s ease;
          will-change: transform, opacity;
        }

        .turntableActive .ring0 { animation: bfhaPulseOuter var(--bfha-beat-double) ease-in-out infinite; }
        .turntableActive .ring1 { animation: bfhaPulseA var(--bfha-beat) ease-in-out infinite; }
        .turntableActive .ring2 { animation: bfhaPulseB var(--bfha-beat) ease-in-out infinite; animation-delay: calc(var(--bfha-beat) * -0.12); }
        .turntableActive .ring3 { animation: bfhaPulseC var(--bfha-beat) ease-in-out infinite; animation-delay: calc(var(--bfha-beat) * -0.2); }
        .turntableActive .centerGlow { animation: bfhaGlow var(--bfha-beat) ease-in-out infinite; }

        .centerHub {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: radial-gradient(circle at 40% 35%, #fafafa 0%, #d8d8d8 40%, #8c8c8c 100%);
          box-shadow: 0 0 18px rgba(255,255,255,0.08);
          position: relative;
          z-index: 2;
        }

        .knobGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .miniGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .miniGroup {
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          border-radius: 14px;
          padding: 12px;
        }

        .miniOptions {
          margin-top: 10px;
          display: grid;
          gap: 8px;
        }

        .miniOption {
          border: 0;
          background: transparent;
          color: #cfd3dc;
          padding: 0;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 6px;
          transition: transform 0.15s ease;
        }

        .miniPad {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.018));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -16px 24px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.02);
          transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        }

        .miniOptionText {
          display: block;
          width: 100%;
          text-align: center;
          font-size: 7px;
          line-height: 1.05;
          letter-spacing: 0.04em;
          color: #88a8ff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .miniOptionActive .miniPad {
          border-color: rgba(113, 141, 255, 0.48);
          background: linear-gradient(180deg, rgba(113, 141, 255, 0.22), rgba(113, 141, 255, 0.10));
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(113,141,255,0.10), 0 10px 24px rgba(15, 23, 42, 0.30), 0 0 18px rgba(113,141,255,0.08);
        }

        .miniOptionActive .miniOptionText {
          color: #9ab7ff;
        }

        .actionsPanel {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .buttonPrimary,
        .buttonSecondary {
          min-height: 46px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
        }

        .buttonPrimary:hover,
        .buttonSecondary:hover,
        .miniOption:hover {
          transform: translateY(-1px);
        }

        .buttonPrimary {
          background: #f2f3f5;
          color: #111111;
        }

        .buttonSecondary {
          background: rgba(255,255,255,0.04);
          color: #fafafa;
        }

        .buttonWide {
          grid-column: 1 / -1;
        }

        @keyframes bfhaPulseOuter {
          0%, 100% { transform: scale(1); opacity: 0.66; box-shadow: 0 0 0 rgba(113,141,255,0); }
          50% { transform: scale(1.004); opacity: 0.88; box-shadow: 0 0 18px rgba(113,141,255,0.08); }
        }

        @keyframes bfhaPulseA {
          0%, 100% { transform: scale(1); opacity: 0.72; box-shadow: 0 0 0 rgba(113,141,255,0); border-color: rgba(180,194,255,0.14); }
          50% { transform: scale(1.012); opacity: 1; box-shadow: 0 0 28px rgba(113,141,255,0.14); border-color: rgba(150,173,255,0.42); }
        }

        @keyframes bfhaPulseB {
          0%, 100% { transform: scale(1); opacity: 0.72; box-shadow: 0 0 0 rgba(113,141,255,0); border-color: rgba(180,194,255,0.12); }
          50% { transform: scale(1.016); opacity: 1; box-shadow: 0 0 20px rgba(113,141,255,0.11); border-color: rgba(150,173,255,0.34); }
        }

        @keyframes bfhaPulseC {
          0%, 100% { transform: scale(1); opacity: 0.7; box-shadow: 0 0 0 rgba(113,141,255,0); border-color: rgba(180,194,255,0.10); }
          50% { transform: scale(1.02); opacity: 0.96; box-shadow: 0 0 14px rgba(113,141,255,0.08); border-color: rgba(150,173,255,0.28); }
        }

        @keyframes bfhaGlow {
          0%, 100% { transform: scale(1); opacity: 0.42; }
          50% { transform: scale(1.055); opacity: 0.66; }
        }

        @media (max-width: 860px) {
          .pageRoot {
            padding: 10px;
            align-items: flex-start;
          }

          .shell {
            border-radius: 18px;
          }

          .headerRow {
            padding: 14px 16px;
          }

          .eyebrow,
          .miniLabel {
            font-size: 10px;
            letter-spacing: 0.22em;
          }

          .title {
            font-size: 24px;
          }

          .pill {
            font-size: 11px;
            padding: 6px 10px;
          }

          .contentGrid {
            padding: 14px;
          }

          .turntableWrap {
            width: min(100%, 320px);
          }

          .knobGrid {
            gap: 8px;
          }

          .miniGrid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .miniGroup {
            padding: 10px;
            border-radius: 12px;
          }

          .miniOptions {
            gap: 6px;
          }

          .miniPad {
            border-radius: 10px;
          }

          .miniOptionText {
            font-size: 6px;
            letter-spacing: 0.01em;
          }

          .actionsPanel {
            gap: 8px;
          }

          .buttonPrimary,
          .buttonSecondary {
            min-height: 42px;
            border-radius: 10px;
            font-size: 13px;
          }
        }
      `}</style>
    </main>
  );
}
