'use client';

type KnobCardProps = {
  label: string;
  value: string;
  onClick?: () => void;
  compact?: boolean;
};

export function KnobCard({ label, value, onClick, compact = false }: KnobCardProps) {
  return (
    <>
      <button type="button" onClick={onClick} className={`knobCardButton${compact ? ' compact' : ''}`}>
        <div className="knobFace">
          <div className="knobInnerRing" />
          <div className="knobPointer" />
          <div className="knobLabel">{label}</div>
        </div>
        <div className="knobValue">{value}</div>
      </button>

      <style jsx>{`
        .knobCardButton {
          border: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(255, 255, 255, 0.02);
          border-radius: 14px;
          padding: 8px 4px 6px;
          text-align: center;
          cursor: pointer;
          width: 100%;
          min-width: 0;
          color: #f5f5f5;
          transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .knobCardButton:hover {
          border-color: rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.035);
        }

        .knobCardButton:active {
          transform: translateY(1px);
        }

        .knobFace {
          position: relative;
          width: 62px;
          height: 62px;
          margin: 0 auto;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: radial-gradient(circle at 50% 40%, #141414, #0a0a0a 72%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .knobInnerRing {
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .knobPointer {
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 13px;
          border-radius: 999px;
          background: #e8e8e8;
        }

        .knobLabel {
          font-size: 10px;
          letter-spacing: 0.24em;
          color: #d8d8d8;
          margin-left: 0.24em;
          white-space: nowrap;
        }

        .knobValue {
          margin-top: 7px;
          font-size: 13px;
          font-weight: 700;
          word-break: break-word;
          line-height: 1.1;
          color: #f3f3f3;
        }

        .compact .knobFace {
          width: 56px;
          height: 56px;
        }

        .compact .knobInnerRing {
          inset: 7px;
        }

        .compact .knobPointer {
          top: 7px;
          height: 11px;
        }

        .compact .knobLabel {
          font-size: 9px;
          letter-spacing: 0.2em;
        }

        .compact .knobValue {
          margin-top: 6px;
          font-size: 12px;
        }

        @media (max-width: 860px) {
          .knobCardButton {
            border-radius: 12px;
            padding: 6px 2px 5px;
          }

          .knobFace,
          .compact .knobFace {
            width: 52px;
            height: 52px;
          }

          .knobInnerRing,
          .compact .knobInnerRing {
            inset: 7px;
          }

          .knobPointer,
          .compact .knobPointer {
            top: 7px;
            width: 2px;
            height: 10px;
          }

          .knobLabel,
          .compact .knobLabel {
            font-size: 8px;
            letter-spacing: 0.16em;
          }

          .knobValue,
          .compact .knobValue {
            margin-top: 5px;
            font-size: 11px;
          }
        }
      `}</style>
    </>
  );
}
