/*
# MediMind AI - Health assessment and memory tables

1. New Tables
- `profiles` — stores the user's persistent medical memory (age, gender, conditions, allergies, medications). Single row per browser session, keyed by a client-generated session id.
- `assessments` — stores every completed AI health assessment including the full agent reasoning trace, risk level, possible conditions, and recommendations.

2. Security
- Enable RLS on both tables.
- This is a single-tenant, no-auth app (no sign-in screen). Policies use `TO anon, authenticated` with `USING (true)` because the data is intentionally shared/public within this demo instance, as documented per skill guidance.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  age integer,
  gender text,
  medical_conditions text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  medications text[] DEFAULT '{}',
  known_symptoms jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  chief_complaint text NOT NULL,
  symptoms jsonb NOT NULL DEFAULT '[]'::jsonb,
  timeline jsonb NOT NULL DEFAULT '[]'::jsonb,
  agent_trace jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_level text NOT NULL DEFAULT 'low',
  risk_score integer NOT NULL DEFAULT 0,
  possible_conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_specialist text,
  recommendation text,
  reasoning jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence integer NOT NULL DEFAULT 0,
  emergency_advice text,
  next_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_assessments" ON assessments;
CREATE POLICY "anon_select_assessments" ON assessments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_assessments" ON assessments;
CREATE POLICY "anon_insert_assessments" ON assessments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_assessments" ON assessments;
CREATE POLICY "anon_update_assessments" ON assessments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_assessments" ON assessments;
CREATE POLICY "anon_delete_assessments" ON assessments FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_assessments_session ON assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created ON assessments(created_at DESC);
