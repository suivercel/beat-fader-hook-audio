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
  borderRadius: 18,
  border: '1px solid rgba(255,255,255,0.10)',
  background: '#f5f5f5',
  color: '#111111',
  fontSize: 16,
  fontWeight: 700,
  padding: '14px 16px',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  borderRadius: 18,
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fafafa',
  fontSize: 16,
  fontWeight: 700,
  padding: '14px 16px',
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
            <div className="eyebrow">MUSIC NFT TOOL</div>
            <h1 className="title">Beat Fader Hook Audio</h1>
          </div>
          <div className="pillRow">
            <div style={pillStyle}>TANE: {tane}</div>
            <div style={pillStyle}>{isPlaying ? 'PLAYING' : 'STOPPED'}</div>
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
          </section>

          <aside className="sidePanel">
            <section style={panelStyle}>
              <div className="panelEyebrow">CURRENT STATE</div>
              <div className="stateList">
                {stateRows.map(([key, value]) => (
                  <div key={key} className="stateRow">
                    <span className="stateKey">{key}</span>
                    <span className="stateValue">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ ...panelStyle, marginTop: 24 }}>
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

            <section style={{ ...panelStyle, marginTop: 24 }}>
              <div className="panelEyebrow">NOTES</div>
              <p className="notesText">
                初期状態は BRIGHT / MID / MID / SHORT。1段階目では型・初期値・対応表・種生成の土台までを入れています。
              </p>
            </section>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .pageRoot {
          min-height: 100vh;
          background: #0a0a0a;
          color: #fafafa;
          padding: 24px;
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
          padding: 20px 32px;
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
          margin: 10px 0 0;
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
          grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
        }

        .mainPanel {
          padding: 32px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .turntableWrap {
          position: relative;
          width: min(100%, 560px);
          aspect-ratio: 1 / 1;
          margin: 0 auto;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: radial-gradient(circle at 50% 48%, #171717 0%, #0f0f0f 35%, #090909 70%, #050505 100%);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
        }

        .ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ring1 { inset: 40px; }
        .ring2 { inset: 80px; }
        .ring3 {
          inset: 112px;
          border-color: rgba(255, 255, 255, 0.06);
        }

        .playerLabel {
          position: absolute;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
        }

        .centerHub {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ececec;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          transform: translate(-50%, -50%);
        }

        .progressTrack {
          position: absolute;
          bottom: 40px;
          left: 50%;
          width: 72%;
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          overflow: hidden;
          transform: translateX(-50%);
        }

        .progressFill {
          height: 100%;
          background: rgba(236, 236, 236, 0.85);
        }

        .tonearm {
          position: absolute;
          right: 50px;
          top: 100px;
          width: 170px;
          height: 4px;
          border-radius: 999px;
          background: linear-gradient(90deg, #a3a3a3 0%, #efefef 100%);
          transform: rotate(18deg);
          transform-origin: left center;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.3);
        }

        .tonearmNeedle {
          position: absolute;
          right: -4px;
          top: 50%;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #f5f5f5;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
          transform: translateY(-50%);
        }

        .knobGrid {
          margin-top: 32px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .sidePanel {
          padding: 32px;
          background: rgba(0, 0, 0, 0.15);
        }

        .stateList {
          margin-top: 16px;
          display: grid;
          gap: 12px;
        }

        .stateRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 12px 16px;
        }

        .stateValue {
          font-size: 14px;
          font-weight: 600;
        }

        .actionsGrid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .notesText {
          margin: 16px 0 0;
          color: #d4d4d4;
          line-height: 1.8;
          font-size: 14px;
        }

        @media (max-width: 980px) {
          .contentGrid {
            grid-template-columns: 1fr;
          }

          .mainPanel {
            border-right: 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
        }

        @media (max-width: 640px) {
          .pageRoot {
            padding: 12px;
            align-items: stretch;
          }

          .shell {
            border-radius: 24px;
          }

          .headerRow,
          .mainPanel,
          .sidePanel {
            padding: 18px;
          }

          .title {
            font-size: 22px;
          }

          .pillRow {
            width: 100%;
            justify-content: flex-start;
          }

          .knobGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .actionsGrid {
            grid-template-columns: 1fr;
          }

          .actionsGrid :global(button) {
            grid-column: auto !important;
          }

          .turntableWrap {
            width: 100%;
          }

          .ring1 { inset: 24px; }
          .ring2 { inset: 52px; }
          .ring3 { inset: 78px; }

          .playerLabel {
            top: 16px;
            font-size: 10px;
          }

          .centerHub {
            width: 24px;
            height: 24px;
          }

          .progressTrack {
            bottom: 22px;
            width: 64%;
            height: 6px;
          }

          .tonearm {
            right: 24px;
            top: 72px;
            width: 104px;
            height: 3px;
          }

          .tonearmNeedle {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>
    </main>
  );
}
