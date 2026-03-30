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
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          border-radius: 24px;
          padding: 16px 12px;
          text-align: center;
          cursor: pointer;
          width: 100%;
        }

        .knobFace {
          position: relative;
          width: 96px;
          height: 96px;
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
          inset: 12px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .knobPointer {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 22px;
          border-radius: 999px;
          background: #e5e5e5;
        }

        .knobLabel {
          font-size: 11px;
          letter-spacing: 0.3em;
          color: #d4d4d4;
          margin-left: 0.3em;
        }

        .knobValue {
          margin-top: 16px;
          font-size: 18px;
          font-weight: 600;
          word-break: break-word;
        }

        @media (max-width: 640px) {
          .knobCardButton {
            border-radius: 18px;
            padding: 12px 8px;
          }

          .knobFace {
            width: 72px;
            height: 72px;
          }

          .knobInnerRing {
            inset: 10px;
          }

          .knobPointer {
            top: 10px;
            width: 3px;
            height: 16px;
          }

          .knobLabel {
            font-size: 9px;
            letter-spacing: 0.22em;
          }

          .knobValue {
            margin-top: 12px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}
