import { ArrowRight, CalendarCheck, CheckCircle2, Clock, HeartPulse, MapPin, Phone, Stethoscope, User } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';
import RiskBadge from '@/components/RiskBadge';
import type { PageId } from '@/components/Navbar';
import type { AssessmentResult } from '@/lib/types';

interface Props {
  result: AssessmentResult | null;
  onNavigate: (page: PageId) => void;
}

const SPECIALIST_INFO: Record<string, { desc: string; when: string; icon: string }> = {
  'Emergency Department': { desc: 'Hospital emergency department for immediate, life-threatening symptoms.', when: 'Immediately — do not delay', icon: 'emergency' },
  'Cardiologist': { desc: 'Heart specialist for chest pain, palpitations, and cardiovascular symptoms.', when: 'Within 24 hours for high risk', icon: 'heart' },
  'Neurologist': { desc: 'Brain and nervous system specialist for headaches, dizziness, and neurological symptoms.', when: 'Within a few days', icon: 'brain' },
  'Dermatologist': { desc: 'Skin specialist for rashes, lesions, and dermatological conditions.', when: 'Within a week', icon: 'skin' },
  'Orthopedic': { desc: 'Bone and joint specialist for musculoskeletal pain and injuries.', when: 'Within a few days', icon: 'bone' },
  'ENT': { desc: 'Ear, nose, and throat specialist for throat, sinus, and ear symptoms.', when: 'Within a few days', icon: 'ent' },
  'General Physician': { desc: 'Your first point of contact for general symptoms and ongoing care.', when: 'Within a few days', icon: 'general' },
  'Home care': { desc: 'Self-care at home with rest, hydration, and monitoring.', when: 'As needed', icon: 'home' },
};

export default function AppointmentRecommendation({ result, onNavigate }: Props) {
  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <CalendarCheck className="mx-auto h-12 w-12 text-slate-300" />
        <h2 className="mt-4 text-2xl font-bold text-slate-800">No recommendation yet</h2>
        <p className="mt-2 text-slate-500">Complete an assessment to get a personalized appointment recommendation.</p>
        <button onClick={() => onNavigate('assessment')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
          Start Assessment <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const info = SPECIALIST_INFO[result.recommendedSpecialist] ?? SPECIALIST_INFO['General Physician'];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Appointment Recommendation</h1>
      <p className="text-slate-500">The Appointment Agent mapped your risk and symptoms to a care pathway.</p>

      <div className="mt-6"><Disclaimer /></div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <RiskBadge level={result.riskLevel} score={result.riskScore} />
            <span className="text-xs text-slate-400">Urgency</span>
          </div>
          <div className="mt-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-xl">
              <HeartPulse className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">{result.recommendedSpecialist}</h2>
            <p className="mt-1 text-sm text-slate-600">{info.desc}</p>
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700"><span className="font-semibold">When:</span> {info.when}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Why this recommendation?</h3>
            </div>
            <p className="mt-2 text-sm text-slate-700">{result.recommendation}</p>
          </div>

          <div className="card rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800">What to tell the doctor</h3>
            </div>
            <ul className="mt-2 space-y-1.5">
              <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> Your main symptom: "{result.chiefComplaint}"</li>
              <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> When it started and how it progressed</li>
              <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> Severity and any triggers you noticed</li>
              <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> Any conditions, allergies, or medications</li>
            </ul>
          </div>

          {result.riskLevel === 'emergency' && (
            <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-600" />
                <h3 className="font-bold text-red-800">Emergency Action</h3>
              </div>
              <p className="mt-2 text-sm text-red-700">{result.emergencyAdvice}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => onNavigate('summary')} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              View Full Summary
            </button>
            <button onClick={() => onNavigate('emergency')} className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">
              Emergency Guidance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
