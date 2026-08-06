import { Activity, ArrowRight, Brain, Clock, Database, HeartPulse, MessageSquare, Network, ShieldAlert, Sparkles, Stethoscope, Zap } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';
import type { PageId } from '@/components/Navbar';

interface Props {
  onNavigate: (page: PageId) => void;
}

const STATS = [
  { label: 'Assessments Completed', value: '48,210', icon: Activity },
  { label: 'Average Response Time', value: '1.4s', icon: Clock },
  { label: 'Medical Knowledge Sources', value: '12', icon: Database },
  { label: 'Emergency Alerts Raised', value: '1,847', icon: ShieldAlert },
];

const AGENTS = [
  { name: 'Planner', icon: Brain, color: 'from-blue-500 to-blue-600', desc: 'Decomposes symptoms into subtasks' },
  { name: 'Symptom Analysis', icon: Stethoscope, color: 'from-cyan-500 to-cyan-600', desc: 'Asks intelligent follow-ups' },
  { name: 'Memory', icon: Database, color: 'from-violet-500 to-violet-600', desc: 'Remembers your history' },
  { name: 'Medical Knowledge', icon: Network, color: 'from-sky-500 to-sky-600', desc: 'Identifies possible conditions' },
  { name: 'Risk Assessment', icon: ShieldAlert, color: 'from-amber-500 to-amber-600', desc: 'Classifies urgency' },
  { name: 'Appointment', icon: HeartPulse, color: 'from-emerald-500 to-emerald-600', desc: 'Recommends the right care' },
  { name: 'Explanation', icon: Sparkles, color: 'from-indigo-500 to-indigo-600', desc: 'Explains in plain language' },
  { name: 'Report', icon: Activity, color: 'from-slate-700 to-slate-800', desc: 'Generates a health report' },
];

export default function Landing({ onNavigate }: Props) {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl floaty" />
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl floaty" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                Collaborative Medical AI Agents
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                AI-Powered Health Guidance Using{' '}
                <span className="gradient-text">Collaborative Medical Agents</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-slate-600">
                MediMind AI orchestrates eight specialized AI agents that reason, remember, and collaborate to
                assess your symptoms, classify urgency, and recommend the right next step — fully explainable,
                never a black box.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('assessment')}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition hover:scale-[1.03] active:scale-95"
                >
                  Start Assessment
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => onNavigate('workflow')}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-white hover:shadow-md"
                >
                  <Network className="h-4 w-4" />
                  How It Works
                </button>
              </div>
              <div className="mt-6">
                <Disclaimer compact />
              </div>
            </div>

            {/* Hero visual — agent constellation */}
            <div className="relative animate-scale-in">
              <div className="card rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
                      <HeartPulse className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">MediMind Agent Network</span>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Live
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {AGENTS.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <div
                        key={a.name}
                        className="group rounded-xl border border-slate-100 bg-white/70 p-2.5 text-center transition hover:scale-105 hover:shadow-md animate-fade-up"
                        style={{ animationDelay: `${i * 70}ms` }}
                      >
                        <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${a.color} shadow`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <p className="mt-1.5 text-[10px] font-semibold text-slate-700">{a.name}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span>8 agents · 7 subtasks · explainable reasoning</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="card rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">How MediMind AI Works</h2>
          <p className="mt-2 text-slate-600">A planned pipeline of eight collaborating agents — every step explainable.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { n: 1, t: 'Share your symptoms', d: 'Describe what you feel in your own words. The Planner Agent breaks it into subtasks.', icon: MessageSquare },
            { n: 2, t: 'Answer smart follow-ups', d: 'The Symptom Agent asks targeted questions — and never repeats one you already answered.', icon: Stethoscope },
            { n: 3, t: 'Agents reason together', d: 'Knowledge, Risk, and Appointment agents analyze, classify urgency, and route your care.', icon: Network },
            { n: 4, t: 'Get an explainable report', d: 'Receive a full health summary with reasoning, confidence, and recommended next step.', icon: Activity },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="card relative rounded-2xl p-6 animate-fade-up" style={{ animationDelay: `${i * 90}ms` }}>
                <div className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white shadow-lg">
                  {step.n}
                </div>
                <Icon className="h-7 w-7 text-blue-600" />
                <h3 className="mt-3 font-bold text-slate-900">{step.t}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Agent showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Meet the Agent Team</h2>
          <p className="mt-2 text-slate-600">Each agent is a specialized module that visibly contributes to your recommendation.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AGENTS.map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={a.name} className="card group rounded-2xl p-5 transition hover:shadow-lg hover:-translate-y-1 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${a.color} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-3 font-bold text-slate-900">{a.name} Agent</h3>
                <p className="mt-1 text-sm text-slate-600">{a.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl hero-gradient p-10 text-center text-white shadow-2xl sm:p-16">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl" />
          <HeartPulse className="mx-auto h-12 w-12" />
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Ready to experience AI-guided health care?</h2>
          <p className="mt-3 text-blue-100">Start your assessment in under a minute. Your AI care team is standing by.</p>
          <button
            onClick={() => onNavigate('assessment')}
            className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-base font-bold text-blue-700 shadow-xl transition hover:scale-105 active:scale-95"
          >
            Start Assessment
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
        </div>
      </section>
    </div>
  );
}
