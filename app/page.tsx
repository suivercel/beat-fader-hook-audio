'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { KnobCard } from '@/components/KnobCard';
import { SimpleAudioEngine } from '@/lib/audio/simpleEngine';
import { DEFAULT_PUBLIC_PARAMS } from '@/lib/constants/defaults';
import { createLoopPattern } from '@/lib/generator/createLoopPattern';
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
const IRO_VALUES: Iro[] = ['CLEAR', 'COOL', 'HEAVY', 'MIST'];

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

  useEffect(() => {
    setNori(baseInternalParams.nori);
    setKazari(baseInternalParams.kazari);
    setKizami(baseInternalParams.kizami);
    setIro(baseInternalParams.iro);
  }, [baseInternalParams]);

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
    if (!isPlaying) return;
    void engineRef.current?.start(pattern);
  }, [isPlaying, pattern]);

  const handlePlay = async () => {
    setIsPlaying(true);
    await engineRef.current?.start(pattern);
  };

  const handleStop = () => {
    engineRef.current?.stop();
    setIsPlaying(false);
  };

  const handleNewTane = () => {
    setTane(createSeed());
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
            <div className="turntableWrap">
              <div className="ring ring1" />
              <div className="ring ring2" />
              <div className="ring ring3" />
              <div className="playerLabel">DEMO PLAYER</div>
              <div className="centerHub" />
              <div className="progressTrack">
                <div className="progressFill" style={{ width: isPlaying ? '72%' : '28%' }} />
              </div>
              <div className="tonearm">
                <div className="tonearmNeedle" />
              </div>
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
              <button type="button" className="buttonPrimary" onClick={handlePlay}>PLAY</button>
              <button type="button" className="buttonSecondary" onClick={handleStop}>STOP</button>
              <button type="button" className="buttonSecondary buttonWide" onClick={handleNewTane}>NEW TANE</button>
              <button type="button" className="buttonSecondary buttonWide">MINT NFT</button>
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
        .playerLabel,
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
        }

        .ring1 { inset: 8%; }
        .ring2 { inset: 20%; }
        .ring3 { inset: 31%; border-color: rgba(180, 194, 255, 0.1); }

        .playerLabel {
          position: absolute;
          top: 9%;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
        }

        .centerHub {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: radial-gradient(circle at 40% 35%, #fafafa 0%, #d8d8d8 40%, #8c8c8c 100%);
          box-shadow: 0 0 18px rgba(255,255,255,0.08);
        }

        .progressTrack {
          position: absolute;
          left: 50%;
          bottom: 10%;
          transform: translateX(-50%);
          width: 70%;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
        }

        .progressFill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(113, 141, 255, 0.35), rgba(123, 166, 255, 0.95));
        }

        .tonearm {
          position: absolute;
          right: 16%;
          top: 21%;
          width: 132px;
          height: 2px;
          background: linear-gradient(90deg, rgba(240,240,240,0.92), rgba(160,160,160,0.75));
          transform: rotate(18deg);
          transform-origin: left center;
          border-radius: 999px;
        }

        .tonearmNeedle {
          position: absolute;
          right: -2px;
          top: -4px;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #e8e8e8;
          box-shadow: 0 0 12px rgba(255,255,255,0.08);
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
          font-size: 10px;
          line-height: 1.1;
          letter-spacing: 0.14em;
          color: #88a8ff;
          white-space: nowrap;
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
          transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
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
          .playerLabel,
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

          .tonearm {
            width: 84px;
            right: 15%;
            top: 22%;
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
            font-size: 9px;
            letter-spacing: 0.1em;
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
