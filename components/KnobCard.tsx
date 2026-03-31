'use client';

type KnobCardProps = {
  label: string;
  value: string;
  onClick?: () => void;
};

export function KnobCard({ label, value, onClick }: KnobCardProps) {
  return (
    <button type="button" onClick={onClick} className="knobCardButton">
      <div className="knobFace">
        <div className="knobInnerRing" />
        <div className="knobPointer" />
        <div className="knobLabel">{label}</div>
      </div>
      <div className="knobValue">{value}</div>
    </button>
  );
}
