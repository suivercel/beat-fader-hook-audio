'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { KnobCard } from '@/components/KnobCard';
import { SimpleAudioEngine } from '@/lib/audio/simpleEngine';
import { DEFAULT_PUBLIC_PARAMS } from '@/lib/constants/defaults';
import { createLoopPattern } from '@/lib/generator/createLoopPattern';
import { createSeed } from '@/lib/generator/createSeed';
import { deriveInternalParams } from '@/lib/generator/deriveInternalParams';
import type { Ikioi, Meguri, Oora, PublicParams, Tenpo } from '@/lib/types/music';

const OORA_VALUES: Oora[] = ['CALM', 'BRIGHT', 'DARK', 'HARD'];
const IKIOI_VALUES: Ikioi[] = ['LOW', 'MID', 'HIGH', 'MAX'];
const TENPO_VALUES: Tenpo[] = ['SLOW', 'MID-SLOW', 'MID', 'MID-FAST', 'FAST'];
const MEGURI_VALUES: Meguri[] = ['SHORT', 'MID', 'LONG'];

function nextValue<T extends string>(current: T, values: readonly T[]): T {
  const index = values.indexOf(current);
  return values[(index + 1) % values.length];
}

const panelStyle: React.CSSProperties = {
  borderRadius: 24,
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.03)',
  padding: 20,
};

const pillStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
};

const primaryButtonStyle: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#f5f5f5',
  color: '#111111',
  fontSize: 15,
  fontWeight: 700,
  padding: '13px 14px',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fafafa',
  fontSize: 15,
  fontWeight: 700,
  padding: '13px 14px',
  cursor: 'pointer',
};

export default function HomePage() {
  const [publicParams, setPublicParams] = useState<PublicParams>(DEFAULT_PUBLIC_PARAMS);
  const [tane, setTane] = useState<number>(createSeed());
  const [isPlaying, setIsPlaying] = useState(false);
  const engineRef = useRef<SimpleAudioEngine | null>(null);

  const internalParams = useMemo(() => deriveInternalParams(publicParams, tane), [publicParams, tane]);
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

  const stateRows = [
    ['OORA', publicParams.oora],
    ['IKIOI', publicParams.ikioi],
    ['TENPO', publicParams.tenpo],
    ['MEGURI', publicParams.meguri],
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
            <div style={pillStyle}>TANE: {tane}</div>
            <div style={pillStyle}>{isPlaying ? 'PLAYING' : 'STOPPED'}</div>
          </div>
        </div>

        <div className="contentGrid">
          <aside className="sidePanel sidePanelTop">
            <section style={panelStyle}>
              <div className="panelEyebrow">ACTIONS</div>
              <div className="actionsGrid">
                <button type="button" style={primaryButtonStyle} onClick={handlePlay}>PLAY</button>
                <button type="button" style={secondaryButtonStyle} onClick={handleStop}>STOP</button>
                <button type="button" style={{ ...secondaryButtonStyle, gridColumn: '1 / -1' }} onClick={handleNewTane}>
                  NEW TANE
                </button>
                <button type="button" style={{ ...secondaryButtonStyle, gridColumn: '1 / -1' }}>
                  MINT NFT
                </button>
              </div>
            </section>

            <section className="stateSection" style={{ ...panelStyle, marginTop: 20 }}>
              <div className="panelEyebrow">CURRENT STATE</div>
              <div className="stateList compactStateList">
                {stateRows.map(([key, value]) => (
                  <div key={key} className="stateRow compactStateRow">
                    <span className="stateKey">{key}</span>
                    <span className="stateValue">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="notesSection" style={{ ...panelStyle, marginTop: 20 }}>
              <div className="panelEyebrow">NOTES</div>
              <p className="notesText">
                初期状態は BRIGHT / MID / MID / SHORT。1段階目では型・初期値・対応表・種生成の土台までを入れています。
              </p>
            </section>
          </aside>

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
          </section>
        </div>
      </div>

      <style jsx>{`
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
          max-width: 1200px;
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #121212;
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.45);
        }

        .headerRow {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 18px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .eyebrow,
        .panelEyebrow,
        .playerLabel,
        .stateKey {
          font-size: 12px;
          letter-spacing: 0.3em;
          color: #737373;
        }

        .title {
          margin: 8px 0 0;
          font-size: 32px;
          line-height: 1.1;
        }

        .pillRow {
          display: flex;
          gap: 12px;
          font-size: 14px;
          color: #a3a3a3;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .contentGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
        }

        .mainPanel {
          padding: 24px 26px 22px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .sidePanel {
          padding: 24px;
          background: rgba(0, 0, 0, 0.22);
        }

        .turntableWrap {
          position: relative;
          width: min(100%, 500px);
          aspect-ratio: 1 / 1;
          margin: 0 auto;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: radial-gradient(circle at center, #111111 0%, #0b0b0b 55%, #080808 100%);
          box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.03);
        }

        .ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .ring1 { inset: 8%; }
        .ring2 { inset: 17%; }
        .ring3 { inset: 31%; }

        .playerLabel {
          position: absolute;
          top: 5%;
          left: 50%;
          transform: translateX(-50%);
        }

        .centerHub {
          position: absolute;
          width: 34px;
          height: 34px;
          border-radius: 9999px;
          background: #e5e5e5;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
        }

        .progressTrack {
          position: absolute;
          left: 18%;
          right: 18%;
          bottom: 7%;
          height: 8px;
          background: rgba(255, 255, 255, 0.07);
          border-radius: 999px;
          overflow: hidden;
        }

        .progressFill {
          height: 100%;
          background: rgba(255, 255, 255, 0.85);
          border-radius: 999px;
        }

        .tonearm {
          position: absolute;
          right: 11%;
          top: 24%;
          width: 34%;
          height: 10px;
          background: linear-gradient(90deg, rgba(255,255,255,0.75), rgba(255,255,255,0.95));
          border-radius: 999px;
          transform: rotate(18deg);
          transform-origin: right center;
        }

        .tonearm::after {
          content: '';
          position: absolute;
          right: -5px;
          top: 50%;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: #f0f0f0;
          transform: translateY(-50%);
        }

        .tonearmNeedle {
          position: absolute;
          left: -2px;
          top: 50%;
          width: 14%;
          height: 3px;
          border-radius: 999px;
          background: rgba(255,255,255,0.72);
          transform: translateY(-50%);
        }

        .knobGrid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .stateList {
          margin-top: 14px;
          display: grid;
          gap: 12px;
        }

        .stateRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 12px 14px;
        }

        .stateValue {
          font-size: 14px;
          font-weight: 700;
        }

        .actionsGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 14px;
        }

        .notesText {
          margin: 14px 0 0;
          color: #bfbfbf;
          line-height: 1.6;
          font-size: 14px;
        }

        @media (max-width: 860px) {
          .pageRoot {
            padding: 10px;
            align-items: flex-start;
          }

          .headerRow {
            padding: 14px 16px;
          }

          .title {
            font-size: 24px;
          }

          .eyebrow,
          .panelEyebrow,
          .playerLabel,
          .stateKey {
            font-size: 10px;
            letter-spacing: 0.25em;
          }

          .contentGrid {
            display: flex;
            flex-direction: column;
          }

          .sidePanelTop {
            order: 1;
            padding: 14px 14px 0;
          }

          .mainPanel {
            order: 2;
            padding: 14px;
            border-right: none;
          }

          .turntableWrap {
            width: min(100%, 250px);
          }

          .knobGrid {
            margin-top: 12px;
            gap: 8px;
          }

          .actionsGrid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
          }

          .actionsGrid :global(button:nth-child(3)),
          .actionsGrid :global(button:nth-child(4)) {
            grid-column: span 2;
          }

          .compactStateList {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .compactStateRow {
            padding: 10px 12px;
            border-radius: 14px;
          }

          .notesSection {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
