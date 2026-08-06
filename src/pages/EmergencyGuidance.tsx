import { AlertTriangle, ArrowRight, HeartPulse, Phone, ShieldAlert } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';
import type { PageId } from '@/components/Navbar';
import type { AssessmentResult } from '@/lib/types';

interface Props {
  result: AssessmentResult | null;
  onNavigate: (page: PageId) => void;
}

const RED_FLAGS = [
  { title: 'Chest pain or pressure', detail: 'Especially with sweating, shortness of breath, or pain radiating to the arm or jaw.', icon: '❤️' },
  { title: 'Difficulty breathing', detail: 'Struggling to breathe, gasping, or unable to speak full sentences.', icon: '🫁' },
  { title: 'Sudden severe headache', detail: 'Thunderclap onset — the worst headache of your life.', icon: '🧠' },
  { title: 'Fainting or unconsciousness', detail: 'Loss of consciousness, confusion, or sudden weakness on one side.', icon: '⚡' },
  { title: 'Severe bleeding', detail: 'Uncontrolled bleeding or vomiting blood.', icon: '🩸' },
  { title: 'Signs of stroke', detail: 'Face drooping, arm weakness, speech difficulty — time is critical.', icon: '🚨' },
];

const EMERGENCY_NUMBERS = [
  { region: 'United States & Canada', number: '911' },
  { region: 'United Kingdom', number: '999' },
  { region: 'European Union', number: '112' },
  { region: 'Australia', number: '000' },
  { region: 'India', number: '112' },
  { region: 'Japan', number: '119' },
];

export default function EmergencyGuidance({ result, onNavigate }: Props) {
  const isEmergency = result?.riskLevel === 'emergency';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
          <ShieldAlert className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Emergency Guidance</h1>
          <p className="text-slate-500">Know the warning signs and act fast.</p>
        </div>
      </div>

      <div className="mt-6"><Disclaimer /></div>

      {isEmergency && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-red-400 bg-red-50 px-5 py-4 animate-fade-up">
          <AlertTriangle className="h-8 w-8 shrink-0 animate-pulse text-red-600" />
          <div>
            <p className="font-bold text-red-800">Your last assessment flagged emergency urgency.</p>
            <p className="text-sm text-red-700">{result?.emergencyAdvice}</p>
          </div>
        </div>
      )}

      {/* Emergency numbers */}
      <div className="mt-6 card rounded-3xl p-6">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-red-600" />
          <h2 className="text-lg font-bold text-slate-900">Emergency Numbers</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EMERGENCY_NUMBERS.map((e) => (
            <div key={e.region} className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 px-4 py-3">
              <span className="text-sm text-slate-600">{e.region}</span>
              <span className="text-lg font-bold text-red-700">{e.number}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Red flags */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-slate-900">When to seek emergency care immediately</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {RED_FLAGS.map((f, i) => (
            <div key={f.title} className="card rounded-2xl p-5 animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-2 font-bold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What to do */}
      <div className="mt-6 card rounded-3xl p-6">
        <h2 className="text-lg font-bold text-slate-900">If you think it's an emergency</h2>
        <ol className="mt-4 space-y-3">
          {[
            'Call your local emergency number immediately.',
            'Do not drive yourself — have someone take you or call an ambulance.',
            'Unlock your front door so responders can reach you.',
            'Stay as calm as possible and sit or lie down in a safe position.',
            'If you have prescribed emergency medication (e.g. nitroglycerin, inhaler, EpiPen), use it as directed.',
            'Have your medication list and medical history ready for responders.',
          ].map((s, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => onNavigate('assessment')} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
          <HeartPulse className="h-4 w-4" /> Start Assessment <ArrowRight className="h-4 w-4" />
        </button>
        <button onClick={() => onNavigate('summary')} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          View Health Summary
        </button>
      </div>
    </div>
  );
}
