import type { CSSProperties } from 'react';
import { KnobCard } from '@/components/KnobCard';

const knobs = [
  { label: 'OORA', value: 'BRIGHT' },
  { label: 'IKIOI', value: 'MID' },
  { label: 'TENPO', value: 'MID' },
  { label: 'MEGURI', value: 'SHORT' },
];

const stateRows = [
  ['OORA', 'BRIGHT'],
  ['IKIOI', 'MID'],
  ['TENPO', 'MID'],
  ['MEGURI', 'SHORT'],
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fafafa',
        padding: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1200,
          borderRadius: 32,
          border: '1px solid rgba(255,255,255,0.10)',
          background: '#121212',
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0,0,0,0.45)',
        }}
      >
        <div
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.10)',
            padding: '20px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.35em', color: '#737373' }}>
              MUSIC NFT TOOL
            </div>
            <h1 style={{ margin: '10px 0 0', fontSize: 32 }}>Beat Fader Hook Audio</h1>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 14, color: '#a3a3a3' }}>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              TANE: AUTO
            </div>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              PLAYING
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.2fr) minmax(320px,0.8fr)',
          }}
        >
          <section style={{ padding: 32, borderRight: '1px solid rgba(255,255,255,0.10)' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 560,
                aspectRatio: '1 / 1',
                margin: '0 auto',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.10)',
                background:
                  'radial-gradient(circle at 50% 48%, #171717 0%, #0f0f0f 35%, #090909 70%, #050505 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ position: 'absolute', inset: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.10)' }} />
              <div style={{ position: 'absolute', inset: 80, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.10)' }} />
              <div style={{ position: 'absolute', inset: 112, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
              <div
                style={{
                  position: 'absolute',
                  top: 24,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 12,
                  letterSpacing: '0.35em',
                  color: '#737373',
                }}
              >
                DEMO PLAYER
              </div>
              <div
                style={{
                  position: 'absolute',
                  inset: '50% auto auto 50%',
                  transform: 'translate(-50%, -50%)',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#ececec',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '72%',
                  height: 8,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ width: '50%', height: '100%', background: 'rgba(236,236,236,0.85)' }} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: 50,
                  top: 100,
                  width: 170,
                  height: 4,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #a3a3a3 0%, #efefef 100%)',
                  transform: 'rotate(18deg)',
                  transformOrigin: 'left center',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.3)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: -4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#f5f5f5',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                marginTop: 32,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 16,
              }}
            >
              {knobs.map((knob) => (
                <KnobCard key={knob.label} label={knob.label} value={knob.value} />
              ))}
            </div>
          </section>

          <aside style={{ padding: 32, background: 'rgba(0,0,0,0.15)' }}>
            <section
              style={{
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.03)',
                padding: 20,
              }}
            >
              <div style={{ fontSize: 12, letterSpacing: '0.3em', color: '#737373' }}>CURRENT STATE</div>
              <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
                {stateRows.map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 18,
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: '12px 16px',
                    }}
                  >
                    <span style={{ fontSize: 14, letterSpacing: '0.2em', color: '#a3a3a3' }}>{key}</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section
              style={{
                marginTop: 24,
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.03)',
                padding: 20,
              }}
            >
              <div style={{ fontSize: 12, letterSpacing: '0.3em', color: '#737373' }}>ACTIONS</div>
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button style={primaryButtonStyle}>PLAY</button>
                <button style={secondaryButtonStyle}>STOP</button>
                <button style={{ ...secondaryButtonStyle, gridColumn: '1 / -1' }}>NEW TANE</button>
                <button style={{ ...secondaryButtonStyle, gridColumn: '1 / -1' }}>MINT NFT</button>
              </div>
            </section>

            <section
              style={{
                marginTop: 24,
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.03)',
                padding: 20,
              }}
            >
              <div style={{ fontSize: 12, letterSpacing: '0.3em', color: '#737373' }}>NOTES</div>
              <p style={{ marginTop: 12, color: '#a3a3a3', fontSize: 14, lineHeight: 1.7 }}>
                初期状態は BRIGHT / MID / MID / SHORT。1段階目では型・初期値・対応表・種生成の土台までを入れています。
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

const primaryButtonStyle: CSSProperties = {
  border: 'none',
  borderRadius: 18,
  background: '#f5f5f5',
  color: '#0a0a0a',
  padding: '14px 16px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryButtonStyle: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 18,
  background: 'rgba(255,255,255,0.05)',
  color: '#f5f5f5',
  padding: '14px 16px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};
