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
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.025)',
  padding: 16,
};

const pillStyle: React.CSSProperties = {
  padding: '7px 11px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};

const primaryButtonStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.08)',
  background: '#f3f3f3',
  color: '#111111',
  fontSize: 14,
  fontWeight: 700,
  padding: '12px 12px',
  cursor: 'pointer',
  width: '100%',
};

const secondaryButtonStyle: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.04)',
  color: '#fafafa',
  fontSize: 14,
  fontWeight: 700,
  padding: '12px 12px',
  cursor: 'pointer',
  width: '100%',
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
                <KnobCard key={knob.label} label={knob.label} value={knob.value} onClick={knob.onClick} compact />
              ))}
            </div>
          </section>

          <aside className="sidePanel">
            <section style={panelStyle}>
              <div className="panelEyebrow">ACTIONS</div>
              <div className="actionsGrid actionsTopRow">
                <button type="button" style={primaryButtonStyle} onClick={handlePlay}>PLAY</button>
                <button type="button" style={secondaryButtonStyle} onClick={handleStop}>STOP</button>
              </div>
              <div className="actionsStack">
                <button type="button" style={secondaryButtonStyle} onClick={handleNewTane}>NEW TANE</button>
                <button type="button" style={secondaryButtonStyle}>MINT NFT</button>
              </div>
            </section>
          </aside>
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
          max-width: 1180px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #111111;
          overflow: hidden;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42);
        }

        .headerRow {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .eyebrow,
        .panelEyebrow,
        .playerLabel {
          font-size: 11px;
          letter-spacing: 0.28em;
          color: #8b8b8b;
          text-transform: uppercase;
        }

        .title {
          margin: 8px 0 0;
          font-size: 32px;
          line-height: 1.05;
          font-weight: 600;
        }

        .pillRow {
          display: flex;
          gap: 10px;
          font-size: 13px;
          color: #b0b0b0;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .contentGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(300px, 0.92fr);
        }

        .mainPanel {
          padding: 20px 22px 18px;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .sidePanel {
          padding: 20px;
          background: rgba(0, 0, 0, 0.18);
        }

        .turntableWrap {
          position: relative;
          width: min(100%, 440px);
          aspect-ratio: 1 / 1;
          margin: 0 auto;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: radial-gradient(circle at center, #141414 0%, #0d0d0d 56%, #090909 100%);
          box-shadow: inset 0 0 44px rgba(255, 255, 255, 0.04);
        }

        .ring {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
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
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: #e8e8e8;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 18px rgba(255, 255, 255, 0.14);
        }

        .progressTrack {
          position: absolute;
          left: 18%;
          right: 18%;
          bottom: 7%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          overflow: hidden;
        }

        .progressFill {
          height: 100%;
          background: rgba(255, 255, 255, 0.92);
          border-radius: 999px;
        }

        .tonearm {
          position: absolute;
          right: 10%;
          top: 24%;
          width: 31%;
          height: 6px;
          background: linear-gradient(90deg, rgba(214,214,214,0.72), rgba(245,245,245,0.94));
          border-radius: 999px;
          transform: rotate(19deg);
          transform-origin: right center;
          box-shadow: 0 1px 10px rgba(0,0,0,0.28);
        }

        .tonearm::before {
          content: '';
          position: absolute;
          left: -2px;
          top: 50%;
          width: 14%;
          height: 2px;
          border-radius: 999px;
          background: rgba(255,255,255,0.84);
          transform: translateY(-50%);
        }

        .tonearm::after {
          content: '';
          position: absolute;
          right: -4px;
          top: 50%;
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: #f0f0f0;
          transform: translateY(-50%);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.06);
        }

        .tonearmNeedle {
          display: none;
        }

        .knobGrid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .actionsGrid {
          display: grid;
          gap: 10px;
          margin-top: 12px;
        }

        .actionsTopRow {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .actionsStack {
          display: grid;
          gap: 10px;
          margin-top: 10px;
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

          .title {
            font-size: 24px;
          }

          .eyebrow,
          .panelEyebrow,
          .playerLabel {
            font-size: 10px;
            letter-spacing: 0.24em;
          }

          .contentGrid {
            display: flex;
            flex-direction: column;
          }

          .mainPanel {
            order: 1;
            padding: 14px;
            border-right: none;
          }

          .sidePanel {
            order: 2;
            padding: 0 14px 14px;
            background: transparent;
          }

          .turntableWrap {
            width: min(100%, 210px);
          }

          .knobGrid {
            margin-top: 12px;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 6px;
          }

          .actionsTopRow {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }

          .actionsStack {
            gap: 8px;
            margin-top: 8px;
          }
        }
      `}</style>
    </main>
  );
}
