'use client';

type KnobCardProps = {
  label: string;
  value: string;
};

export function KnobCard({ label, value }: KnobCardProps) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: 24,
        padding: 16,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 96,
          height: 96,
          margin: '0 auto',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.10)',
          background: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 12,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 22,
            borderRadius: 999,
            background: '#e5e5e5',
          }}
        />
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.3em',
            color: '#d4d4d4',
            marginLeft: '0.3em',
          }}
        >
          {label}
        </div>
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}
