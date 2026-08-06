import { useEffect, useState } from 'react';
import { Activity, ArrowRight, Database, HeartPulse, RefreshCw, Trash2, User } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';
import RiskBadge from '@/components/RiskBadge';
import type { PageId } from '@/components/Navbar';
import { getSessionId, loadProfile } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface Props {
  onNavigate: (page: PageId) => void;
}

interface AssessmentRow {
  id: string;
  chief_complaint: string;
  risk_level: string;
  risk_score: number;
  recommended_specialist: string;
  confidence: number;
  created_at: string;
}

export default function HealthHistory({ onNavigate }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const id = getSessionId();
    const p = await loadProfile(id);
    setProfile(p);
    const { data } = await supabase
      .from('assessments')
      .select('id, chief_complaint, risk_level, risk_score, recommended_specialist, confidence, created_at')
      .eq('session_id', id)
      .order('created_at', { ascending: false });
    setAssessments((data as AssessmentRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const clearHistory = async () => {
    const id = getSessionId();
    await supabase.from('assessments').delete().eq('session_id', id);
    await supabase.from('profiles').delete().eq('session_id', id);
    localStorage.removeItem('medimind_session_id');
    load();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Health History</h1>
          <p className="text-slate-500">Your AI memory — past assessments and remembered profile.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="mt-6"><Disclaimer /></div>

      {/* Memory profile */}
      <div className="mt-6 card rounded-3xl p-6">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-violet-600" />
          <h2 className="text-lg font-bold text-slate-900">Memory Agent — Your Profile</h2>
        </div>
        {loading ? (
          <div className="mt-4 space-y-2">
            <div className="h-4 w-1/2 rounded shimmer bg-slate-100" />
            <div className="h-4 w-1/3 rounded shimmer bg-slate-100" />
          </div>
        ) : profile ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MemoryItem label="Age" value={profile.age ? String(profile.age) : 'Not recorded'} />
            <MemoryItem label="Gender" value={profile.gender ?? 'Not recorded'} />
            <MemoryItem label="Known conditions" value={profile.medicalConditions.length ? profile.medicalConditions.join(', ') : 'None recorded'} />
            <MemoryItem label="Allergies" value={profile.allergies.length ? profile.allergies.join(', ') : 'None recorded'} />
            <MemoryItem label="Medications" value={profile.medications.length ? profile.medications.join(', ') : 'None recorded'} />
            <MemoryItem label="Prior symptom reports" value={String(profile.knownSymptoms.length)} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No profile in memory yet.</p>
        )}
      </div>

      {/* Past assessments */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Past Assessments</h2>
          {assessments.length > 0 && (
            <button onClick={clearHistory} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700">
              <Trash2 className="h-3.5 w-3.5" /> Clear history
            </button>
          )}
        </div>

        {loading ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <div key={i} className="card h-28 rounded-2xl shimmer" />)}
          </div>
        ) : assessments.length === 0 ? (
          <div className="mt-4 card rounded-2xl p-10 text-center">
            <Activity className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">No assessments yet</p>
            <p className="text-sm text-slate-500">Your completed assessments will be remembered here.</p>
            <button onClick={() => onNavigate('assessment')} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
              <HeartPulse className="h-4 w-4" /> Start Assessment <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {assessments.map((a) => (
              <div key={a.id} className="card rounded-2xl p-4 animate-fade-up">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-2">"{a.chief_complaint}"</p>
                  <RiskBadge level={a.risk_level as never} size="sm" />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><User className="h-3 w-3" /> {a.recommended_specialist}</span>
                  <span>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${a.confidence}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500">{a.confidence}% conf.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemoryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}
