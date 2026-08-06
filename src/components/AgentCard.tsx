import { Brain, CalendarCheck, Database, FileText, BookOpen, MessageCircle, ShieldAlert, Stethoscope } from 'lucide-react';
import type { AgentId, AgentStatus } from '@/lib/types';

const ICONS: Record<string, typeof Brain> = {
  Brain,
  Stethoscope,
  Database,
  BookOpen,
  ShieldAlert,
  CalendarCheck,
  MessageCircle,
  FileText,
};

const COLORS: Record<AgentId, { bg: string; ring: string; text: string }> = {
  planner: { bg: 'from-blue-500 to-blue-600', ring: 'ring-blue-300', text: 'text-blue-700' },
  symptom: { bg: 'from-cyan-500 to-cyan-600', ring: 'ring-cyan-300', text: 'text-cyan-700' },
  memory: { bg: 'from-violet-500 to-violet-600', ring: 'ring-violet-300', text: 'text-violet-700' },
  knowledge: { bg: 'from-sky-500 to-sky-600', ring: 'ring-sky-300', text: 'text-sky-700' },
  risk: { bg: 'from-amber-500 to-amber-600', ring: 'ring-amber-300', text: 'text-amber-700' },
  appointment: { bg: 'from-emerald-500 to-emerald-600', ring: 'ring-emerald-300', text: 'text-emerald-700' },
  explanation: { bg: 'from-indigo-500 to-indigo-600', ring: 'ring-indigo-300', text: 'text-indigo-700' },
  report: { bg: 'from-slate-700 to-slate-800', ring: 'ring-slate-300', text: 'text-slate-700' },
};

const NAMES: Record<AgentId, string> = {
  planner: 'Planner',
  symptom: 'Symptom Analysis',
  memory: 'Memory',
  knowledge: 'Medical Knowledge',
  risk: 'Risk Assessment',
  appointment: 'Appointment',
  explanation: 'Explanation',
  report: 'Report Generator',
};

const ROLES: Record<AgentId, string> = {
  planner: 'Decomposes the problem & assigns subtasks',
  symptom: 'Extracts structured symptom facets',
  memory: 'Recalls prior context, avoids repeats',
  knowledge: 'Identifies possible conditions',
  risk: 'Classifies urgency level',
  appointment: 'Routes to the right care pathway',
  explanation: 'Translates reasoning into plain language',
  report: 'Assembles the structured health report',
};

interface Props {
  agent: AgentId;
  status: AgentStatus;
  reasoning?: string[];
  output?: string;
  index?: number;
  compact?: boolean;
}

export default function AgentCard({ agent, status, reasoning, output, index = 0, compact = false }: Props) {
  const Icon = ICONS[agent] ?? Brain;
  const colors = COLORS[agent];

  return (
    <div
      className={`card rounded-2xl p-4 transition-all duration-500 animate-fade-up ${
        status === 'thinking' ? 'scale-[1.02] ring-2 ' + colors.ring : ''
      } ${status === 'completed' ? 'opacity-100' : status === 'waiting' ? 'opacity-55' : ''}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`relative shrink-0 rounded-xl bg-gradient-to-br ${colors.bg} p-2.5 text-white shadow-lg`}>
          <Icon className="h-5 w-5" />
          {status === 'thinking' && (
            <span className="absolute inset-0 rounded-xl pulse-ring" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-slate-800 text-sm">{NAMES[agent]}</h4>
            <StatusBadge status={status} />
          </div>
          {!compact && <p className="mt-0.5 text-xs text-slate-500">{ROLES[agent]}</p>}
        </div>
      </div>

      {status === 'thinking' && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2">
          <span className="dot h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="dot h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="dot h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="ml-2 text-xs text-slate-500">reasoning…</span>
        </div>
      )}

      {status === 'completed' && reasoning && reasoning.length > 0 && (
        <div className="mt-3 space-y-1.5 animate-fade-in">
          <div className="rounded-lg bg-blue-50/70 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Reasoning</p>
            <ul className="mt-1 space-y-1">
              {reasoning.map((r, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-slate-600">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
          {output && (
            <div className="rounded-lg bg-emerald-50/70 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Output</p>
              <p className="mt-1 text-xs text-slate-700">{output}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: AgentStatus }) {
  if (status === 'waiting')
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Waiting</span>;
  if (status === 'thinking')
    return <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Thinking</span>;
  return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Done</span>;
}
