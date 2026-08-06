interface Props {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ current, total, label }: Props) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">{label}</span>
          <span className="font-semibold text-blue-600">{pct}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
