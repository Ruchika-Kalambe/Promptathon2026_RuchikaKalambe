import { ArrowRight, Brain, CalendarCheck, Database, FileText, MessageCircle, Network, ShieldAlert, Stethoscope } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';
import type { PageId } from '@/components/Navbar';

interface Props {
  onNavigate: (page: PageId) => void;
}

const FLOW: { id: string; name: string; role: string; icon: typeof Brain; color: string }[] = [
  { id: 'user', name: 'User', role: 'Describes symptoms in plain language', icon: Stethoscope, color: 'from-slate-500 to-slate-600' },
  { id: 'planner', name: 'Planner Agent', role: 'Decomposes the problem into subtasks', icon: Brain, color: 'from-blue-500 to-blue-600' },
  { id: 'symptom', name: 'Symptom Analysis', role: 'Extracts duration, severity, triggers', icon: Stethoscope, color: 'from-cyan-500 to-cyan-600' },
  { id: 'memory', name: 'Memory Agent', role: 'Recalls prior context, avoids repeats', icon: Database, color: 'from-violet-500 to-violet-600' },
  { id: 'knowledge', name: 'Medical Knowledge', role: 'Identifies possible conditions', icon: Network, color: 'from-sky-500 to-sky-600' },
  { id: 'risk', name: 'Risk Assessment', role: 'Classifies urgency: low → emergency', icon: ShieldAlert, color: 'from-amber-500 to-amber-600' },
  { id: 'appointment', name: 'Appointment', role: 'Routes to the right care pathway', icon: CalendarCheck, color: 'from-emerald-500 to-emerald-600' },
  { id: 'explanation', name: 'Explanation', role: 'Translates reasoning into plain language', icon: MessageCircle, color: 'from-indigo-500 to-indigo-600' },
  { id: 'report', name: 'Report Generator', role: 'Assembles the structured health report', icon: FileText, color: 'from-slate-700 to-slate-800' },
];

export default function AgentWorkflow({ onNavigate }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <Network className="h-3.5 w-3.5" /> Agentic AI Architecture
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">AI Agent Workflow</h1>
        <p className="mt-2 text-slate-600">Eight specialized agents collaborate in a planned pipeline. Each agent's reasoning is visible and explainable.</p>
      </div>

      <Disclaimer />
      <div className="mt-4" />

      {/* Flow diagram */}
      <div className="card rounded-3xl p-6 sm:p-8">
        <div className="space-y-1">
          {FLOW.map((node, i) => {
            const Icon = node.icon;
            const isLast = i === FLOW.length - 1;
            return (
              <div key={node.id}>
                <div
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/70 p-4 transition hover:shadow-md animate-fade-up"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${node.color} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">{i + 1}</span>
                      <h3 className="font-bold text-slate-800">{node.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500">{node.role}</p>
                  </div>
                </div>
                {!isLast && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="h-4 w-4 rotate-90 text-blue-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reasoning principles */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { t: 'Planning', d: 'The Planner Agent decomposes the user complaint into ordered subtasks and decides which agents execute.', icon: Brain },
          { t: 'Memory', d: 'The Memory Agent recalls prior symptoms, age, and conditions — so it never asks the same question twice.', icon: Database },
          { t: 'Explainability', d: 'Every recommendation includes reasoning, evidence, a confidence score, and stated uncertainty.', icon: MessageCircle },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={c.t} className="card rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <Icon className="h-7 w-7 text-blue-600" />
              <h3 className="mt-3 font-bold text-slate-900">{c.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{c.d}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => onNavigate('assessment')}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
        >
          Try the Workflow <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
