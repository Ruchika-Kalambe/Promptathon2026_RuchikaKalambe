import { ArrowRight, Brain, CalendarCheck, Database, FileText, HeartPulse, MessageCircle, Network, ShieldAlert, Sparkles, Stethoscope } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';
import type { PageId } from '@/components/Navbar';

interface Props {
  onNavigate: (page: PageId) => void;
}

const AGENTS = [
  { name: 'Planner Agent', icon: Brain, color: 'from-blue-500 to-blue-600', desc: 'Understands the user\'s symptoms, breaks the problem into subtasks, and determines which agents should execute.' },
  { name: 'Symptom Analysis Agent', icon: Stethoscope, color: 'from-cyan-500 to-cyan-600', desc: 'Collects symptoms, asks intelligent follow-up questions, remembers previous answers, and extracts duration, severity, location, frequency, triggers, and pain level.' },
  { name: 'Medical Knowledge Agent', icon: Network, color: 'from-sky-500 to-sky-600', desc: 'Uses trusted medical reasoning to identify possible conditions — without diagnosing — and highlights warning signs.' },
  { name: 'Risk Assessment Agent', icon: ShieldAlert, color: 'from-amber-500 to-amber-600', desc: 'Classifies urgency into Low, Moderate, High, or Emergency and explains the reasoning behind the score.' },
  { name: 'Appointment Recommendation Agent', icon: CalendarCheck, color: 'from-emerald-500 to-emerald-600', desc: 'Recommends the right care pathway — home care, general physician, or a specialist — and explains why.' },
  { name: 'Memory Agent', icon: Database, color: 'from-violet-500 to-violet-600', desc: 'Remembers previous symptoms, assessments, age, gender, conditions, allergies, and medications — never asks twice.' },
  { name: 'Explanation Agent', icon: MessageCircle, color: 'from-indigo-500 to-indigo-600', desc: 'Explains every recommendation in simple language, shows a confidence level, and states uncertainty.' },
  { name: 'Report Generator Agent', icon: FileText, color: 'from-slate-700 to-slate-800', desc: 'Generates a professional patient summary with symptoms, timeline, risk level, conditions, and next steps.' },
];

const STACK = [
  'React 19 + TypeScript',
  'Tailwind CSS v4',
  'Vite 8',
  'Supabase (Postgres + RLS)',
  'Lucide Icons',
  'Multi-Agent Reasoning Engine',
];

export default function About({ onNavigate }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-xl">
          <HeartPulse className="h-7 w-7 text-white" />
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">About MediMind AI</h1>
        <p className="mt-2 text-lg text-slate-600">Your Intelligent Health Guidance Companion</p>
      </div>

      <div className="mt-6"><Disclaimer /></div>

      {/* Problem / Solution */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-900">The Problem</h2>
          <p className="mt-2 text-sm text-slate-600">
            Many people experience symptoms but don't know whether they should rest, visit a clinic, consult a
            specialist, or seek emergency care. Hospitals are overcrowded because patients often cannot determine
            the urgency of their condition.
          </p>
        </div>
        <div className="card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-900">Our Solution</h2>
          <p className="mt-2 text-sm text-slate-600">
            MediMind AI guides users by asking follow-up questions, analyzing symptoms, assessing urgency,
            suggesting possible conditions without diagnosing, and recommending the next appropriate step —
            through a team of eight collaborating AI agents.
          </p>
        </div>
      </div>

      {/* Agents */}
      <div className="mt-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900">The Eight AI Agents</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {AGENTS.map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={a.name} className="card rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${a.color} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{a.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{a.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reasoning principles */}
      <div className="mt-10 card rounded-3xl p-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-600" />
          <h2 className="text-2xl font-bold text-slate-900">Explainable AI Reasoning</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Every recommendation includes reasoning, confidence, evidence, and a suggested next action. MediMind AI
          never produces a black-box answer — each agent's contribution is visible in the collaboration trace.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: 'Reasoning', d: 'Why the AI reached its conclusion' },
            { t: 'Confidence', d: 'A calibrated confidence score' },
            { t: 'Evidence', d: 'The symptom facts that support it' },
            { t: 'Next Action', d: 'What you should do next' },
          ].map((c) => (
            <div key={c.t} className="rounded-xl bg-indigo-50/60 p-4">
              <p className="text-sm font-bold text-indigo-700">{c.t}</p>
              <p className="mt-1 text-xs text-slate-600">{c.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900">Technology Stack</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {STACK.map((s) => (
            <span key={s} className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">{s}</span>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <button onClick={() => onNavigate('assessment')} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105">
          <HeartPulse className="h-4 w-4" /> Start Your Assessment <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
