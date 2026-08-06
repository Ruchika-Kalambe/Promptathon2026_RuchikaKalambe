import { supabase } from './supabase';
import type { AssessmentResult, Profile } from './types';

const SESSION_KEY = 'medimind_session_id';

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export async function loadProfile(sessionId: string): Promise<Profile> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (!data) {
    return {
      sessionId,
      medicalConditions: [],
      allergies: [],
      medications: [],
      knownSymptoms: [],
    };
  }
  return {
    sessionId: data.session_id,
    age: data.age ?? undefined,
    gender: data.gender ?? undefined,
    medicalConditions: data.medical_conditions ?? [],
    allergies: data.allergies ?? [],
    medications: data.medications ?? [],
    knownSymptoms: Array.isArray(data.known_symptoms) ? data.known_symptoms : [],
  };
}

export async function saveProfile(profile: Profile): Promise<void> {
  const row = {
    session_id: profile.sessionId,
    age: profile.age ?? null,
    gender: profile.gender ?? null,
    medical_conditions: profile.medicalConditions,
    allergies: profile.allergies,
    medications: profile.medications,
    known_symptoms: profile.knownSymptoms,
    updated_at: new Date().toISOString(),
  };
  await supabase.from('profiles').upsert(row, { onConflict: 'session_id' });
}

export async function saveAssessment(result: AssessmentResult, sessionId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      session_id: sessionId,
      chief_complaint: result.chiefComplaint,
      symptoms: result.symptoms,
      timeline: result.timeline,
      agent_trace: result.agentTrace,
      risk_level: result.riskLevel,
      risk_score: result.riskScore,
      possible_conditions: result.possibleConditions,
      recommended_specialist: result.recommendedSpecialist,
      recommendation: result.recommendation,
      reasoning: result.reasoning,
      confidence: result.confidence,
      emergency_advice: result.emergencyAdvice,
      next_steps: result.nextSteps,
    })
    .select('id')
    .maybeSingle();
  if (error || !data) return null;
  return data.id;
}
