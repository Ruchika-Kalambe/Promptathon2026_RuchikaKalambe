import type { RiskLevel } from '@/lib/types';

const CONFIG: Record<RiskLevel, { label: string; emoji: string; classes: string; dot: string; desc: string }> = {
  low: {
    label: 'Low',
    emoji: '🟢',
    classes: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800',
    dot: 'bg-emerald-500',
    desc: 'Self-care and monitoring are appropriate',
  },
  moderate: {
    label: 'Moderate',
    emoji: '🟡',
    classes: 'from-amber-50 to-amber-100 border-amber-200 text-amber-800',
    dot: 'bg-amber-500',
    desc: 'Schedule a medical appointment soon',
  },
  high: {
    label: 'High',
    emoji: '🟠',
    classes: 'from-orange-50 to-orange-100 border-orange-200 text-orange-800',
    dot: 'bg-orange-500',
    desc: 'Seek medical care within 24 hours',
  },
  emergency: {
    label: 'Emergency',
    emoji: '🔴',
    classes: 'from-red-50 to-red-100 border-red-300 text-red-800',
    dot: 'bg-red-500',
    desc: 'Seek emergency care immediately',
  },
};

interface Props {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskBadge({ level, score, size = 'md' }: Props) {
  const c = CONFIG[level];
  const pad = size === 'lg' ? 'px-5 py-3' : size === 'sm' ? 'px-2.5 py-1' : 'px-3.5 py-2';
  const text = size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <div className={`inline-flex items-center gap-2 rounded-xl border bg-gradient-to-r ${c.classes} ${pad}`}>
      <span className={text}>{c.emoji}</span>
      <span className={`font-bold ${text}`}>{c.label}</span>
      {score !== undefined && <span className={`opacity-70 ${size === 'sm' ? 'text-[10px]' : 'text-xs'}`}>({score}/100)</span>}
    </div>
  );
}

export function RiskMeter({ level, score }: { level: RiskLevel; score: number }) {
  const c = CONFIG[level];
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${c.classes} p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Urgency Level</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-3xl">{c.emoji}</span>
            <span className="text-2xl font-bold">{c.label}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{score}<span className="text-base font-normal opacity-60">/100</span></p>
          <p className="text-xs opacity-70">urgency score</p>
        </div>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/50">
        <div
          className={`h-full rounded-full ${c.dot} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-2 text-sm opacity-80">{c.desc}</p>
    </div>
  );
}
