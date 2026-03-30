'use client';

type KnobCardProps = {
  label: string;
  value: string;
  onClick?: () => void;
};

export function KnobCard({ label, value, onClick }: KnobCardProps) {
  return (
    <>
      <button type="button" onClick={onClick} className="knobCardButton">
        <div className="knobFace">
          <div className="knobInnerRing" />
          <div className="knobPointer" />
          <div className="knobLabel">{label}</div>
        </div>
        <div className="knobValue">{value}</div>
      </button>

      <style jsx>{`
        .knobCardButton {
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.02);
          border-radius: 18px;
          padding: 10px 6px 8px;
          text-align: center;
          cursor: pointer;
          width: 100%;
          min-width: 0;
        }

        .knobFace {
          position: relative;
          width: 68px;
          height: 68px;
          margin: 0 auto;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .knobInnerRing {
          position: absolute;
          inset: 9px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .knobPointer {
          position: absolute;
          top: 9px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 15px;
          border-radius: 999px;
          background: #e5e5e5;
        }

        .knobLabel {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: #d4d4d4;
          margin-left: 0.22em;
          white-space: nowrap;
        }

        .knobValue {
          margin-top: 8px;
          font-size: 14px;
          font-weight: 700;
          word-break: break-word;
          line-height: 1.15;
        }

        @media (max-width: 860px) {
          .knobCardButton {
            border-radius: 14px;
            padding: 8px 4px 6px;
          }

          .knobFace {
            width: 56px;
            height: 56px;
          }

          .knobInnerRing {
            inset: 8px;
          }

          .knobPointer {
            top: 8px;
            width: 3px;
            height: 12px;
          }

          .knobLabel {
            font-size: 8px;
            letter-spacing: 0.18em;
          }

          .knobValue {
            margin-top: 6px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
}
