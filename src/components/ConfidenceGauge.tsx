interface Props {
  value: number; // 0-100
  size?: number;
  label?: string;
  color?: string;
}

export default function ConfidenceGauge({ value, size = 120, label = 'Confidence', color }: Props) {
  const v = Math.max(0, Math.min(100, value));
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (v / 100) * circumference;
  const stroke = color ?? (v >= 70 ? '#16a34a' : v >= 45 ? '#f59e0b' : '#ef4444');

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e0e7ff" strokeWidth="10" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{v}%</span>
        </div>
      </div>
      <span className="mt-1 text-xs font-medium text-slate-500">{label}</span>
    </div>
  );
}
