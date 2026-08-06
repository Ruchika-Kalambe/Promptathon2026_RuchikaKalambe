import { Clock, Gauge, Repeat, Zap, Link, Cpu, MessageSquare } from 'lucide-react';
import type { TimelineEvent } from '@/lib/types';

const ICONS: Record<string, typeof Clock> = {
  Clock, Gauge, Repeat, Zap, Link, Cpu, MessageSquare,
};

interface Props {
  events: TimelineEvent[];
}

export default function Timeline({ events }: Props) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-200 via-cyan-200 to-blue-100" />
      <div className="space-y-5">
        {events.map((e, i) => {
          const Icon = ICONS[e.icon] ?? Clock;
          return (
            <div key={i} className="relative animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="absolute -left-[26px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-blue-100">
                <Icon className="h-3 w-3 text-blue-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">{e.time}</span>
                <span className="text-sm font-semibold text-slate-800">{e.label}</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{e.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
