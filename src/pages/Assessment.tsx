import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Brain, CheckCircle2, FileText, HeartPulse, Send, Sparkles, Stethoscope, User } from 'lucide-react';
import AgentCard from '@/components/AgentCard';
import Disclaimer from '@/components/Disclaimer';
import ProgressBar from '@/components/ProgressBar';
import type { PageId } from '@/components/Navbar';
import { generateFollowUps, runAgentPipeline, updateProfileFromAnswers } from '@/lib/agents';
import { loadProfile, saveAssessment, saveProfile, getSessionId } from '@/lib/session';
import type { AgentTraceStep, AssessmentResult, FollowUpQuestion, Profile } from '@/lib/types';

interface Props {
  onNavigate: (page: PageId) => void;
  onResult: (result: AssessmentResult) => void;
}

type Phase = 'intro' | 'complaint' | 'questions' | 'running' | 'done';

const ALL_AGENTS: AgentTraceStep['agent'][] = ['planner', 'symptom', 'memory', 'knowledge', 'risk', 'appointment', 'explanation', 'report'];

export default function Assessment({ onNavigate, onResult }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [complaint, setComplaint] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [agentStates, setAgentStates] = useState<Record<string, AgentTraceStep>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = getSessionId();
    loadProfile(id).then(setProfile);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [phase, currentQ, questions.length, agentStates]);

  const startComplaint = async () => {
    if (!complaint.trim() || !profile) return;
    setPhase('questions');
    const qs = generateFollowUps(complaint, profile, {});
    setQuestions(qs);
  };

  const submitAnswer = (q: FollowUpQuestion, value: string) => {
    const newAnswers = { ...answers, [q.key]: value };
    setAnswers(newAnswers);
    const nextIndex = currentQ + 1;
    if (nextIndex < questions.length) {
      setCurrentQ(nextIndex);
    } else {
      runAnalysis(newAnswers);
    }
  };

  const runAnalysis = async (allAnswers: Record<string, string>) => {
    setPhase('running');
    if (!profile) return;
    const fullAnswers = { ...allAnswers, chief_complaint: complaint };
    const updatedProfile = updateProfileFromAnswers(profile, fullAnswers);
    setProfile(updatedProfile);
    await saveProfile(updatedProfile);

    ALL_AGENTS.forEach((a) => {
      setAgentStates((s) => ({ ...s, [a]: { agent: a, title: '', status: 'waiting', reasoning: [], output: '', durationMs: 0 } }));
    });

    const res = await runAgentPipeline(complaint, fullAnswers, updatedProfile, {
      onAgent: (step) => {
        setAgentStates((s) => ({ ...s, [step.agent]: { ...step } }));
      },
    });

    setResult(res);
    const id = await saveAssessment(res, updatedProfile.sessionId);
    void id;
    setPhase('done');
    onResult(res);
  };

  const restart = () => {
    setPhase('intro');
    setComplaint('');
    setAnswers({});
    setQuestions([]);
    setCurrentQ(0);
    setAgentStates({});
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => onNavigate('landing')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <HeartPulse className="h-4 w-4 text-blue-600" />
          AI Health Assessment
        </div>
      </div>

      <Disclaimer />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Conversation */}
        <div className="card rounded-3xl p-5 sm:p-6">
          <ProgressBar
            current={phase === 'intro' ? 0 : phase === 'complaint' ? 0 : phase === 'questions' ? currentQ + 1 : phase === 'running' || phase === 'done' ? questions.length + 1 : 0}
            total={questions.length + 1}
            label="Assessment progress"
          />

          <div ref={scrollRef} className="mt-5 max-h-[560px] min-h-[420px] space-y-4 overflow-y-auto pr-1">
            {/* Intro / complaint */}
            {phase === 'intro' && (
              <div className="animate-fade-up">
                <BotBubble text="Hi, I'm your MediMind AI guide. Tell me what you're experiencing today — describe your main symptom in your own words." />
                <div className="mt-4 flex gap-2">
                  <textarea
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="e.g. I've had a throbbing headache on one side for two days, worse with light…"
                    className="min-h-[90px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Chest pain and shortness of breath', 'Headache for 3 days', 'Stomach pain after eating', 'Itchy rash on arm'].map((s) => (
                    <button key={s} onClick={() => setComplaint(s)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 hover:border-blue-300 hover:bg-blue-50">
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  onClick={startComplaint}
                  disabled={!complaint.trim() || !profile}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Question phase */}
            {phase !== 'intro' && (
              <BotBubble text="Thanks. I'll now ask a few targeted questions to understand your situation better." />
            )}

            {phase === 'questions' && questions.map((q, i) => (
              i <= currentQ && (
                <QuestionBlock key={q.id} q={q} answered={answers[q.key]} onAnswer={(v) => submitAnswer(q, v)} active={i === currentQ} />
              )
            ))}

            {/* Running phase */}
            {phase === 'running' && (
              <div className="animate-fade-up">
                <BotBubble text="All set. My agent team is now collaborating to analyze your symptoms. Watch them reason in real time on the right." />
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Agents collaborating… this usually takes a few seconds.
                </div>
              </div>
            )}

            {/* Done */}
            {phase === 'done' && result && (
              <div className="animate-fade-up space-y-3">
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Analysis complete. Your AI care team has reached a recommendation.
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => onNavigate('summary')} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02]">
                    <FileText className="h-4 w-4" /> View Health Summary
                  </button>
                  <button onClick={() => onNavigate('appointment')} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    See Appointment Advice
                  </button>
                  <button onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    New Assessment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agent panel */}
        <div className="card rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Agent Activity</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">8 agents collaborate in sequence</p>
          <div className="mt-4 space-y-2.5">
            {ALL_AGENTS.map((a, i) => {
              const state = agentStates[a];
              return (
                <AgentCard
                  key={a}
                  agent={a}
                  status={state?.status ?? 'waiting'}
                  reasoning={state?.reasoning}
                  output={state?.output}
                  index={i}
                  compact
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function BotBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 animate-fade-up">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 shadow">
        <Stethoscope className="h-4 w-4 text-white" />
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-blue-50 px-4 py-2.5 text-sm text-slate-700">
        {text}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start justify-end gap-2.5 animate-fade-up">
      <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm text-white shadow">
        {text}
      </div>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200">
        <User className="h-4 w-4 text-slate-600" />
      </div>
    </div>
  );
}

function QuestionBlock({ q, answered, onAnswer, active }: { q: FollowUpQuestion; answered?: string; onAnswer: (v: string) => void; active: boolean }) {
  const [text, setText] = useState('');
  const [multi, setMulti] = useState<string[]>([]);

  if (answered) {
    return (
      <div className="animate-fade-in">
        <UserBubble text={answered} />
      </div>
    );
  }

  if (!active) return null;

  const submit = (v: string) => {
    onAnswer(v);
  };

  return (
    <div className="animate-fade-up space-y-3">
      <BotBubble text={q.prompt} />
      {q.hint && <p className="ml-10 text-xs text-slate-400">{q.hint}</p>}

      {q.type === 'text' && (
        <div className="flex justify-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your answer…"
            className="min-h-[60px] flex-1 max-w-[80%] resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <button onClick={() => text.trim() && submit(text)} className="self-end rounded-xl bg-blue-600 p-2.5 text-white shadow hover:bg-blue-700">
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}

      {q.type === 'select' && (
        <div className="flex flex-wrap justify-end gap-2">
          {q.options?.map((opt) => (
            <button key={opt} onClick={() => submit(opt)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50">
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === 'multiselect' && (
        <div className="flex flex-col items-end gap-2">
          <div className="flex max-w-[80%] flex-wrap justify-end gap-2">
            {q.options?.map((opt) => {
              const sel = multi.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => setMulti((m) => (sel ? m.filter((x) => x !== opt) : [...m, opt]))}
                  className={`rounded-xl border px-3.5 py-2 text-sm transition ${
                    sel ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <button onClick={() => submit(multi.join(', ') || 'None of these')} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700">
            <CheckCircle2 className="h-4 w-4" /> Submit
          </button>
        </div>
      )}

      {q.type === 'scale' && (
        <div className="flex flex-col items-end gap-2">
          <input
            type="range"
            min={1}
            max={10}
            defaultValue={5}
            onChange={(e) => setText(e.target.value)}
            className="w-full max-w-xs"
          />
          <div className="flex w-full max-w-xs justify-between text-[10px] text-slate-400">
            <span>1</span><span>5</span><span>10</span>
          </div>
          <button onClick={() => submit(`${text || '5'}/10`)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700">
            <CheckCircle2 className="h-4 w-4" /> Submit {text || '5'}/10
          </button>
        </div>
      )}
    </div>
  );
}
