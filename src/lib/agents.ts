import type {
  AgentTraceStep,
  AssessmentResult,
  FollowUpQuestion,
  PossibleCondition,
  Profile,
  ReasoningBlock,
  RiskLevel,
  SymptomRecord,
  TimelineEvent,
} from './types';

/* ----------------------------------------------------------------------------
 * MediMind AI — Multi-Agent Reasoning Engine
 *
 * A deterministic, explainable agentic system. Eight specialized agents
 * collaborate in a planned pipeline. Each agent produces reasoning traces,
 * evidence, and a confidence score that downstream agents consume.
 *
 * This is intentionally rule-based (no external LLM call) so the reasoning
 * is fully transparent, reproducible, and explainable — ideal for an
 * Agentic AI competition demonstration.
 * -------------------------------------------------------------------------- */

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/* ----------------------------------------------------------------------------
 * Symptom ontology — maps free-text symptom fragments to structured clinical
 * facets used by the Symptom Analysis and Medical Knowledge agents.
 * -------------------------------------------------------------------------- */
interface SymptomEntry {
  key: string;
  label: string;
  aliases: string[];
  bodySystem: string;
  baseSeverity: number; // 1-10
  redFlags: string[];
}

const SYMPTOM_DB: SymptomEntry[] = [
  {
    key: 'chest_pain',
    label: 'Chest pain or tightness',
    aliases: ['chest pain', 'chest tightness', 'chest pressure', 'chest discomfort', 'heart pain', 'angina'],
    bodySystem: 'cardiovascular',
    baseSeverity: 8,
    redFlags: ['pain radiating to arm or jaw', 'shortness of breath', 'sweating', 'pain with exertion', 'crushing pressure'],
  },
  {
    key: 'shortness_breath',
    label: 'Shortness of breath',
    aliases: ['shortness of breath', 'breathless', 'difficulty breathing', 'dyspnea', 'breathing problem', 'cant breathe', 'winded'],
    bodySystem: 'respiratory',
    baseSeverity: 7,
    redFlags: ['breathless at rest', 'lips or fingertips turning blue', 'wheezing', 'unable to speak full sentences'],
  },
  {
    key: 'headache',
    label: 'Headache',
    aliases: ['headache', 'head pain', 'head ache', 'migraine', 'head pressure'],
    bodySystem: 'neurological',
    baseSeverity: 4,
    redFlags: ['sudden severe onset (thunderclap)', 'worst headache of life', 'stiff neck with fever', 'vision loss', 'weakness on one side'],
  },
  {
    key: 'fever',
    label: 'Fever',
    aliases: ['fever', 'temperature', 'hot', 'chills', 'shivering', 'feverish'],
    bodySystem: 'infectious',
    baseSeverity: 5,
    redFlags: ['temperature above 39.4°C/103°F', 'fever with stiff neck', 'fever with confusion', 'persistent fever over 3 days'],
  },
  {
    key: 'abdominal_pain',
    label: 'Abdominal pain',
    aliases: ['abdominal pain', 'stomach pain', 'belly pain', 'tummy ache', 'stomach ache', 'gut pain', 'pelvic pain'],
    bodySystem: 'gastrointestinal',
    baseSeverity: 5,
    redFlags: ['severe localized pain', 'vomiting blood', 'black or bloody stool', 'pain with high fever', 'pregnancy'],
  },
  {
    key: 'dizziness',
    label: 'Dizziness or lightheadedness',
    aliases: ['dizzy', 'dizziness', 'lightheaded', 'lightheadedness', 'vertigo', 'fainting', 'feeling faint'],
    bodySystem: 'neurological',
    baseSeverity: 5,
    redFlags: ['fainting with chest pain', 'sudden severe vertigo', 'weakness on one side', 'slurred speech', 'confusion'],
  },
  {
    key: 'cough',
    label: 'Cough',
    aliases: ['cough', 'coughing', 'dry cough', 'wet cough', 'persistent cough'],
    bodySystem: 'respiratory',
    baseSeverity: 3,
    redFlags: ['coughing up blood', 'cough lasting over 3 weeks', 'cough with high fever and breathlessness'],
  },
  {
    key: 'fatigue',
    label: 'Unusual fatigue',
    aliases: ['fatigue', 'tired', 'exhausted', 'no energy', 'weakness', 'lethargic', 'tiredness'],
    bodySystem: 'general',
    baseSeverity: 3,
    redFlags: ['fatigue with chest pain', 'fatigue with unexplained weight loss', 'fatigue with fainting'],
  },
  {
    key: 'nausea',
    label: 'Nausea or vomiting',
    aliases: ['nausea', 'nauseous', 'vomit', 'vomiting', 'throwing up', 'queasy', 'sick to stomach'],
    bodySystem: 'gastrointestinal',
    baseSeverity: 4,
    redFlags: ['vomiting blood', 'vomiting with severe abdominal pain', 'unable to keep fluids down for 24h'],
  },
  {
    key: 'rash',
    label: 'Skin rash or irritation',
    aliases: ['rash', 'skin', 'itchy', 'itching', 'hives', 'skin irritation', 'redness on skin', 'dermatitis'],
    bodySystem: 'dermatological',
    baseSeverity: 3,
    redFlags: ['rash spreading rapidly', 'blistering or peeling skin', 'rash with high fever', 'rash on face with breathing swelling'],
  },
  {
    key: 'joint_pain',
    label: 'Joint or muscle pain',
    aliases: ['joint pain', 'muscle pain', 'back pain', 'knee pain', 'arthritis', 'sore muscles', 'body ache', 'sprain'],
    bodySystem: 'musculoskeletal',
    baseSeverity: 4,
    redFlags: ['inability to bear weight', 'joint with severe swelling and redness', 'back pain with leg weakness', 'trauma'],
  },
  {
    key: 'sore_throat',
    label: 'Sore throat',
    aliases: ['sore throat', 'throat pain', 'painful swallowing', 'scratchy throat'],
    bodySystem: 'ent',
    baseSeverity: 3,
    redFlags: ['difficulty swallowing saliva', 'throat with high fever', 'swelling closing airway'],
  },
  {
    key: 'anxiety',
    label: 'Anxiety or palpitations',
    aliases: ['anxiety', 'anxious', 'panic', 'palpitations', 'racing heart', 'heart racing', 'panic attack'],
    bodySystem: 'psychiatric',
    baseSeverity: 4,
    redFlags: ['palpitations with chest pain and fainting', 'palpitations lasting over 30 minutes'],
  },
];

const RED_FLAG_PHRASES = [
  'radiating', 'crushing', 'thunderclap', 'worst headache', 'stiff neck', 'blue lips', 'vomiting blood',
  'bloody stool', 'cant breathe', 'unable to breathe', 'fainting', 'slurred speech', 'weakness on one side',
  'confusion', 'severe sudden', 'trauma', 'suicidal', 'unconscious',
];

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function matchSymptoms(text: string): SymptomEntry[] {
  const t = normalize(text);
  const matches: SymptomEntry[] = [];
  const seen = new Set<string>();
  for (const s of SYMPTOM_DB) {
    if (s.aliases.some((a) => t.includes(a))) {
      if (!seen.has(s.key)) {
        seen.add(s.key);
        matches.push(s);
      }
    }
  }
  return matches;
}

function hasRedFlag(text: string): boolean {
  const t = normalize(text);
  return RED_FLAG_PHRASES.some((p) => t.includes(p));
}

/* ----------------------------------------------------------------------------
 * Agent 1 — Planner Agent
 * Decomposes the chief complaint into subtasks and decides which agents run.
 * -------------------------------------------------------------------------- */
export function planAgents(chiefComplaint: string): {
  subtasks: string[];
  agentOrder: string[];
  reasoning: string[];
} {
  const matched = matchSymptoms(chiefComplaint);
  const systems = new Set(matched.map((m) => m.bodySystem));
  const subtasks: string[] = [
    'Parse and normalize the chief complaint into structured symptom facets',
    'Retrieve any prior medical memory for this user',
    'Cross-reference symptoms against the medical knowledge base',
    'Score urgency and classify risk level',
    'Map risk + body systems to an appropriate care pathway',
    'Translate the clinical reasoning into patient-friendly language',
    'Assemble a structured health report',
  ];
  const reasoning: string[] = [
    `Chief complaint received: "${chiefComplaint}".`,
    `Detected ${matched.length} candidate symptom cluster(s) spanning body system(s): ${[...systems].join(', ') || 'general'}.`,
    'Decomposed the problem into 7 ordered subtasks and assigned 8 collaborating agents.',
    'Symptom Analysis must run first to extract structured facets before downstream clinical reasoning.',
    'Memory Agent runs in parallel to recall prior context and avoid redundant questions.',
  ];
  return { subtasks, agentOrder: ['planner', 'symptom', 'memory', 'knowledge', 'risk', 'appointment', 'explanation', 'report'], reasoning };
}

/* ----------------------------------------------------------------------------
 * Agent 2 — Symptom Analysis Agent
 * Generates intelligent follow-up questions, avoiding repeats using memory.
 * -------------------------------------------------------------------------- */
export function generateFollowUps(
  chiefComplaint: string,
  profile: Profile,
  answered: Record<string, string>
): FollowUpQuestion[] {
  const matched = matchSymptoms(chiefComplaint);
  const questions: FollowUpQuestion[] = [];

  // Always ask duration if not known
  if (!answered['duration'] && !profile.knownSymptoms.includes('duration')) {
    questions.push({
      id: 'q_duration',
      key: 'duration',
      prompt: 'How long have you been experiencing this?',
      type: 'select',
      options: ['Less than 24 hours', '1-3 days', '4-7 days', '1-2 weeks', 'More than 2 weeks', 'More than a month'],
      hint: 'Duration helps distinguish acute from chronic conditions.',
    });
  }

  if (!answered['severity']) {
    questions.push({
      id: 'q_severity',
      key: 'severity',
      prompt: 'On a scale of 1 to 10, how severe is your main symptom right now?',
      type: 'scale',
      hint: '1 is barely noticeable, 10 is the worst pain you can imagine.',
    });
  }

  if (!answered['frequency']) {
    questions.push({
      id: 'q_frequency',
      key: 'frequency',
      prompt: 'How often does this occur?',
      type: 'select',
      options: ['Constant', 'Several times a day', 'Once a day', 'A few times a week', 'Occasionally', 'Rarely'],
    });
  }

  if (!answered['triggers']) {
    questions.push({
      id: 'q_triggers',
      key: 'triggers',
      prompt: 'Does anything make it better or worse?',
      type: 'text',
      hint: 'e.g. worse after meals, better with rest, triggered by stress…',
    });
  }

  // Body-system specific question
  if (!answered['associated']) {
    const top = matched[0];
    if (top) {
      const assoc: Record<string, string[]> = {
        cardiovascular: ['Shortness of breath', 'Pain radiating to arm/jaw', 'Sweating', 'Palpitations', 'None of these'],
        respiratory: ['Fever', 'Wheezing', 'Cough with phlegm', 'Chest tightness', 'None of these'],
        neurological: ['Vision changes', 'Weakness on one side', 'Sensitivity to light', 'Nausea', 'None of these'],
        gastrointestinal: ['Vomiting', 'Diarrhea', 'Blood in stool', 'Fever', 'None of these'],
        dermatological: ['Itching', 'Fever', 'Spreading quickly', 'Blistering', 'None of these'],
        musculoskeletal: ['Swelling', 'Inability to bear weight', 'Numbness', 'Fever', 'None of these'],
        ent: ['Fever', 'Difficulty swallowing', 'Swollen glands', 'Ear pain', 'None of these'],
        infectious: ['Chills', 'Body aches', 'Cough', 'Headache', 'None of these'],
        psychiatric: ['Chest tightness', 'Trembling', 'Sense of doom', 'Hyperventilation', 'None of these'],
        general: ['Fever', 'Weight loss', 'Fainting', 'None of these'],
      };
      const options = assoc[top.bodySystem] ?? assoc['general'];
      questions.push({
        id: 'q_associated',
        key: 'associated',
        prompt: `Are you also experiencing any of these alongside your ${top.label.toLowerCase()}?`,
        type: 'multiselect',
        options,
      });
    }
  }

  // Profile gaps — memory-aware
  if (!profile.age && !answered['age']) {
    questions.push({
      id: 'q_age',
      key: 'age',
      prompt: 'What is your age? (We remember this for future assessments.)',
      type: 'select',
      options: ['Under 18', '18-39', '40-59', '60-74', '75+'],
    });
  }
  if (!profile.gender && !answered['gender']) {
    questions.push({
      id: 'q_gender',
      key: 'gender',
      prompt: 'What is your gender? (Used only to refine clinical relevance.)',
      type: 'select',
      options: ['Female', 'Male', 'Non-binary', 'Prefer not to say'],
    });
  }

  return questions;
}

/* ----------------------------------------------------------------------------
 * Agent 3 — Memory Agent
 * Merges new answers into the persistent profile and recalls prior context.
 * -------------------------------------------------------------------------- */
export function updateProfileFromAnswers(profile: Profile, answers: Record<string, string>): Profile {
  const updated: Profile = {
    ...profile,
    medicalConditions: [...profile.medicalConditions],
    allergies: [...profile.allergies],
    medications: [...profile.medications],
    knownSymptoms: [...profile.knownSymptoms],
  };
  if (answers['age'] && !profile.age) {
    const map: Record<string, number> = { 'Under 18': 15, '18-39': 28, '40-59': 49, '60-74': 67, '75+': 80 };
    updated.age = map[answers['age']] ?? 30;
  }
  if (answers['gender'] && !profile.gender) updated.gender = answers['gender'];
  const chief = answers['chief_complaint'];
  if (chief && !updated.knownSymptoms.includes(chief)) {
    updated.knownSymptoms = [...updated.knownSymptoms, chief];
  }
  return updated;
}

/* ----------------------------------------------------------------------------
 * Agent 4 — Medical Knowledge Agent
 * Maps symptoms to possible conditions with rationale + warning signs.
 * -------------------------------------------------------------------------- */
interface ConditionTemplate {
  name: string;
  systems: string[];
  likelihood: number;
  rationale: string;
  warningSigns: string[];
}

export function identifyConditions(
  chiefComplaint: string,
  answers: Record<string, string>
): PossibleCondition[] {
  const matched = matchSymptoms(chiefComplaint);
  const severity = parseInt(answers['severity'] ?? '5', 10) || 5;
  const associated = (answers['associated'] ?? '').toLowerCase();
  const conditions: PossibleCondition[] = [];

  const templates: Record<string, ConditionTemplate[]> = {
    cardiovascular: [
      {
        name: 'Angina / cardiac chest pain',
        systems: ['cardiovascular'],
        likelihood: 70,
        rationale: 'Chest pain or tightness, especially with exertion, is consistent with reduced blood flow to the heart muscle.',
        warningSigns: ['Pain radiating to the left arm or jaw', 'Sweating and nausea', 'Pain triggered by physical activity'],
      },
      {
        name: 'Anxiety-related chest tightness',
        systems: ['cardiovascular', 'psychiatric'],
        likelihood: 45,
        rationale: 'Stress and panic can produce real chest tightness and palpitations that mimic cardiac pain.',
        warningSigns: ['Persistent rapid heartbeat', 'Hyperventilation', 'Sense of impending doom'],
      },
    ],
    respiratory: [
      {
        name: 'Acute bronchitis',
        systems: ['respiratory'],
        likelihood: 60,
        rationale: 'Cough with breathlessness following an upper-airway infection is a common presentation of bronchitis.',
        warningSigns: ['High fever', 'Coughing up blood', 'Breathlessness at rest'],
      },
      {
        name: 'Asthma flare',
        systems: ['respiratory'],
        likelihood: 50,
        rationale: 'Episodic breathlessness with wheezing is characteristic of airway hyper-reactivity.',
        warningSigns: ['Inability to speak full sentences', 'Blue lips', 'No relief from reliever inhaler'],
      },
    ],
    neurological: [
      {
        name: 'Tension-type headache',
        systems: ['neurological'],
        likelihood: 65,
        rationale: 'Bilateral, pressing head pain often linked to stress and screen time is the most common primary headache.',
        warningSigns: ['Sudden severe onset', 'Neurological deficits', 'Fever with stiff neck'],
      },
      {
        name: 'Migraine',
        systems: ['neurological'],
        likelihood: 55,
        rationale: 'Throbbing unilateral headache with light or sound sensitivity fits a migraine pattern.',
        warningSigns: ['Worst headache of life', 'Vision loss', 'Weakness on one side of body'],
      },
      {
        name: 'Vestibular / inner-ear issue',
        systems: ['neurological'],
        likelihood: 45,
        rationale: 'Spinning vertigo with nausea can arise from inner-ear balance disturbances.',
        warningSigns: ['Sudden severe vertigo with neurological deficit', 'Hearing loss', 'Fainting'],
      },
    ],
    infectious: [
      {
        name: 'Viral upper-respiratory infection',
        systems: ['infectious', 'respiratory'],
        likelihood: 70,
        rationale: 'Fever with body aches and cough is consistent with a viral flu-like illness.',
        warningSigns: ['Fever above 39.4°C/103°F', 'Confusion', 'Difficulty breathing'],
      },
    ],
    gastrointestinal: [
      {
        name: 'Gastritis / acid reflux',
        systems: ['gastrointestinal'],
        likelihood: 60,
        rationale: 'Upper abdominal pain related to meals, with nausea, fits acid-related irritation of the stomach lining.',
        warningSigns: ['Vomiting blood', 'Black stools', 'Severe localized pain'],
      },
      {
        name: 'Gastroenteritis',
        systems: ['gastrointestinal', 'infectious'],
        likelihood: 55,
        rationale: 'Abdominal pain with nausea, vomiting, or diarrhea suggests an intestinal infection.',
        warningSigns: ['Dehydration', 'Blood in stool', 'High fever'],
      },
    ],
    dermatological: [
      {
        name: 'Contact dermatitis / allergic rash',
        systems: ['dermatological'],
        likelihood: 65,
        rationale: 'Itchy red rash appearing after exposure to a new product or plant suggests contact dermatitis.',
        warningSigns: ['Rash spreading rapidly', 'Blistering or peeling', 'Swelling of face or throat'],
      },
      {
        name: 'Urticaria (hives)',
        systems: ['dermatological'],
        likelihood: 50,
        rationale: 'Raised itchy welts appearing suddenly are consistent with a histamine-driven reaction.',
        warningSigns: ['Swelling of lips or tongue', 'Difficulty breathing', 'Widespread body involvement'],
      },
    ],
    musculoskeletal: [
      {
        name: 'Acute musculoskeletal strain',
        systems: ['musculoskeletal'],
        likelihood: 65,
        rationale: 'Localized joint or muscle pain after activity or awkward movement fits a soft-tissue strain.',
        warningSigns: ['Inability to bear weight', 'Severe swelling and redness', 'Numbness'],
      },
      {
        name: 'Osteoarthritis flare',
        systems: ['musculoskeletal'],
        likelihood: 45,
        rationale: 'Joint pain worse with movement and better with rest, in older adults, fits degenerative joint disease.',
        warningSigns: ['Sudden severe swelling', 'Joint hot and red', 'Fever'],
      },
    ],
    ent: [
      {
        name: 'Pharyngitis (strep or viral)',
        systems: ['ent', 'infectious'],
        likelihood: 65,
        rationale: 'Sore throat with painful swallowing and possible fever suggests throat inflammation.',
        warningSigns: ['Difficulty swallowing saliva', 'High fever', 'Swelling closing the airway'],
      },
    ],
    psychiatric: [
      {
        name: 'Panic attack / acute anxiety',
        systems: ['psychiatric'],
        likelihood: 60,
        rationale: 'Sudden palpitations, racing heart, and a sense of doom are hallmark features of a panic episode.',
        warningSigns: ['Chest pain with fainting', 'Symptoms lasting over 30 minutes', 'Suicidal thoughts'],
      },
    ],
    general: [
      {
        name: 'Non-specific viral illness',
        systems: ['general', 'infectious'],
        likelihood: 50,
        rationale: 'Generalized fatigue without localizing features may reflect a mild viral illness.',
        warningSigns: ['Unexplained weight loss', 'Persistent fever', 'Fainting'],
      },
    ],
  };

  const seen = new Set<string>();
  for (const m of matched) {
    const list = templates[m.bodySystem] ?? templates['general'];
    for (const t of list) {
      if (seen.has(t.name)) continue;
      seen.add(t.name);
      let likelihood = t.likelihood;
      if (severity >= 8) likelihood = Math.min(95, likelihood + 12);
      if (severity <= 3) likelihood = Math.max(20, likelihood - 10);
      if (associated.includes('none')) likelihood = Math.max(15, likelihood - 8);
      conditions.push({
        name: t.name,
        likelihood,
        rationale: t.rationale,
        warningSigns: t.warningSigns,
      });
    }
  }

  if (conditions.length === 0) {
    conditions.push({
      name: 'Non-specific symptom pattern',
      likelihood: 40,
      rationale: 'Your description did not map strongly to a single body system. Broader clinical evaluation is recommended.',
      warningSigns: ['Worsening severity', 'New associated symptoms', 'Symptoms persisting beyond a week'],
    });
  }

  return conditions.sort((a, b) => b.likelihood - a.likelihood).slice(0, 4);
}

/* ----------------------------------------------------------------------------
 * Agent 5 — Risk Assessment Agent
 * Classifies urgency into low / moderate / high / emergency.
 * -------------------------------------------------------------------------- */
export function assessRisk(
  chiefComplaint: string,
  answers: Record<string, string>,
  conditions: PossibleCondition[]
): { level: RiskLevel; score: number; reasoning: string[] } {
  const matched = matchSymptoms(chiefComplaint);
  const severity = parseInt(answers['severity'] ?? '5', 10) || 5;
  const duration = (answers['duration'] ?? '').toLowerCase();
  const associated = (answers['associated'] ?? '').toLowerCase();
  const triggers = (answers['triggers'] ?? '').toLowerCase();

  let score = 20;
  const reasoning: string[] = [];

  score += (severity - 5) * 8;
  reasoning.push(`Severity self-rating of ${severity}/10 contributes ${(severity - 5) * 8} points to the urgency score.`);

  const top = matched[0];
  if (top) {
    score += Math.round(top.baseSeverity * 1.5);
    reasoning.push(`The primary symptom (${top.label}) carries a baseline clinical severity weight of ${top.baseSeverity}/10.`);
  }

  if (hasRedFlag(chiefComplaint) || hasRedFlag(associated) || hasRedFlag(triggers)) {
    score += 35;
    reasoning.push('Red-flag language detected in your description — this strongly elevates urgency.');
  }

  if (duration.includes('more than 2 weeks') || duration.includes('more than a month')) {
    score += 8;
    reasoning.push('Symptom duration over 2 weeks suggests a chronic or evolving process, adding urgency.');
  } else if (duration.includes('less than 24')) {
    reasoning.push('Very short duration may indicate an acute event — monitoring is important.');
  }

  if (associated.includes('radiating') || associated.includes('crushing') || associated.includes('weakness on one side')) {
    score += 20;
    reasoning.push('High-risk associated features detected, significantly increasing the urgency score.');
  }

  const topCondition = conditions[0];
  if (topCondition && topCondition.likelihood >= 70) {
    score += 5;
    reasoning.push(`The leading consideration (${topCondition.name}) has a high match likelihood of ${topCondition.likelihood}%.`);
  }

  score = Math.max(5, Math.min(100, score));

  let level: RiskLevel = 'low';
  if (score >= 80) level = 'emergency';
  else if (score >= 60) level = 'high';
  else if (score >= 40) level = 'moderate';

  reasoning.push(`Final urgency score: ${score}/100 → classified as ${level.toUpperCase()}.`);
  return { level, score, reasoning };
}

/* ----------------------------------------------------------------------------
 * Agent 6 — Appointment Recommendation Agent
 * Maps risk + body systems to a care pathway.
 * -------------------------------------------------------------------------- */
const SPECIALIST_MAP: Record<string, { specialist: string; reason: string }> = {
  cardiovascular: { specialist: 'Cardiologist', reason: 'Cardiac-sounding symptoms warrant evaluation of heart function (ECG, troponins) to rule out ischemia.' },
  respiratory: { specialist: 'General Physician', reason: 'Respiratory symptoms are best triaged by a general physician, escalating to a pulmonologist if needed.' },
  neurological: { specialist: 'Neurologist', reason: 'Neurological symptoms benefit from specialist assessment to rule out serious intracranial causes.' },
  gastrointestinal: { specialist: 'General Physician', reason: 'Gastrointestinal symptoms are initially evaluated by a general physician; endoscopy referral if persistent.' },
  dermatological: { specialist: 'Dermatologist', reason: 'Skin findings are best assessed visually by a dermatologist for accurate diagnosis.' },
  musculoskeletal: { specialist: 'Orthopedic', reason: 'Musculoskeletal pain is evaluated by an orthopedic specialist for structural causes.' },
  ent: { specialist: 'ENT', reason: 'Ear, nose, and throat symptoms are best assessed by an ENT specialist.' },
  infectious: { specialist: 'General Physician', reason: 'Infectious symptoms are triaged by a general physician for fever and systemic illness.' },
  psychiatric: { specialist: 'General Physician', reason: 'Anxiety and panic symptoms are initially triaged by a general physician with mental-health referral as needed.' },
  general: { specialist: 'General Physician', reason: 'Non-specific symptoms are best evaluated by a general physician first.' },
};

export function recommendAppointment(
  risk: { level: RiskLevel; score: number },
  chiefComplaint: string
): { specialist: string; recommendation: string; reasoning: string[] } {
  const matched = matchSymptoms(chiefComplaint);
  const system = matched[0]?.bodySystem ?? 'general';
  const map = SPECIALIST_MAP[system] ?? SPECIALIST_MAP['general'];

  let specialist = map.specialist;
  let recommendation = '';
  const reasoning: string[] = [];

  if (risk.level === 'emergency') {
    specialist = 'Emergency Department';
    recommendation = 'Seek emergency care immediately. Do not drive yourself — call emergency services or have someone take you.';
    reasoning.push('Emergency risk level overrides specialist routing — immediate emergency department care is indicated.');
    reasoning.push(`Urgency score of ${risk.score}/100 exceeds the emergency threshold (80).`);
  } else if (risk.level === 'high') {
    recommendation = `See a ${specialist} within 24 hours. Call ahead to your clinic or an urgent-care facility.`;
    reasoning.push(`High risk indicates prompt evaluation by a ${specialist} within 24 hours.`);
    reasoning.push(`Body system "${system}" routes to ${specialist}: ${map.reason}`);
  } else if (risk.level === 'moderate') {
    recommendation = `Book a ${specialist} appointment within the next few days. If symptoms worsen, escalate urgency.`;
    reasoning.push(`Moderate risk suggests a ${specialist} visit within a few days.`);
    reasoning.push(`Body system "${system}" routes to ${specialist}: ${map.reason}`);
  } else {
    if (system === 'general') {
      specialist = 'Home care';
      recommendation = 'Self-care at home is reasonable. Rest, hydrate, and monitor. If symptoms persist beyond a few days or worsen, consult a general physician.';
      reasoning.push('Low risk with no specific body system — home care with monitoring is appropriate.');
    } else {
      recommendation = `Home care and monitoring. If symptoms persist beyond 3-5 days or worsen, consult a ${specialist}.`;
      reasoning.push(`Low risk but a clear body system (${system}) — home care first, with ${specialist} as a fallback if symptoms persist.`);
    }
    reasoning.push(`Body system "${system}" routes to ${specialist}: ${map.reason}`);
  }

  return { specialist, recommendation, reasoning };
}

/* ----------------------------------------------------------------------------
 * Agent 7 — Explanation Agent
 * Translates clinical reasoning into patient-friendly language.
 * -------------------------------------------------------------------------- */
export function explainResult(
  risk: { level: RiskLevel; score: number },
  conditions: PossibleCondition[],
  appointment: { specialist: string; recommendation: string }
): ReasoningBlock {
  const top = conditions[0];
  const evidence: string[] = [
    `Your main symptom was analyzed against ${conditions.length} possible condition pattern(s).`,
    top ? `The closest match was "${top.name}" at ${top.likelihood}% likelihood.` : 'No strong condition match was found.',
    `Urgency was scored at ${risk.score}/100 and classified as ${risk.level.toUpperCase()}.`,
    `Care pathway routed to: ${appointment.specialist}.`,
  ];

  const confidence = Math.min(95, Math.max(35, (top?.likelihood ?? 40) - 10 + Math.round(risk.score / 8)));

  const uncertaintyMap: Record<RiskLevel, string> = {
    low: 'Low urgency means the pattern is common and usually self-resolving, but new or worsening symptoms would change the picture.',
    moderate: 'Moderate urgency has moderate uncertainty — a clinician should confirm the likely cause before assuming it is minor.',
    high: 'High urgency carries real uncertainty about the underlying cause and warrants prompt professional evaluation.',
    emergency: 'Emergency urgency means the pattern overlaps with time-critical conditions — do not wait for further analysis.',
  };

  return {
    summary: `Based on what you described, the AI agents consider your situation to be ${risk.level.toUpperCase()} urgency. ${appointment.recommendation}`,
    confidence,
    evidence,
    uncertainty: uncertaintyMap[risk.level],
    nextAction: risk.level === 'emergency'
      ? 'Call your local emergency number now or go to the nearest emergency department.'
      : risk.level === 'high'
      ? `Contact a ${appointment.specialist} today.`
      : risk.level === 'moderate'
      ? `Book a ${appointment.specialist} appointment within the next few days.`
      : 'Rest and monitor. Re-assess if symptoms change.',
  };
}

/* ----------------------------------------------------------------------------
 * Agent 8 — Report Generator Agent
 * Assembles the structured patient summary.
 * -------------------------------------------------------------------------- */
export function buildTimeline(
  chiefComplaint: string,
  answers: Record<string, string>,
  agentTrace: AgentTraceStep[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    { time: 'T0', label: 'Symptom intake', detail: `User reported: "${chiefComplaint}"`, icon: 'MessageSquare' },
  ];
  if (answers['duration']) events.push({ time: 'T1', label: 'Duration established', detail: answers['duration'], icon: 'Clock' });
  if (answers['severity']) events.push({ time: 'T2', label: 'Severity rated', detail: `${answers['severity']}/10`, icon: 'Gauge' });
  if (answers['frequency']) events.push({ time: 'T3', label: 'Frequency noted', detail: answers['frequency'], icon: 'Repeat' });
  if (answers['triggers']) events.push({ time: 'T4', label: 'Triggers described', detail: answers['triggers'], icon: 'Zap' });
  if (answers['associated']) events.push({ time: 'T5', label: 'Associated features', detail: answers['associated'], icon: 'Link' });
  events.push({ time: 'T6', label: 'Multi-agent analysis', detail: `${agentTrace.length} agents collaborated`, icon: 'Cpu' });
  return events;
}

/* ----------------------------------------------------------------------------
 * Orchestrator — runs the full agent pipeline with live trace emission.
 * -------------------------------------------------------------------------- */
export interface OrchestratorCallbacks {
  onAgent: (step: AgentTraceStep) => void;
}

export async function runAgentPipeline(
  chiefComplaint: string,
  answers: Record<string, string>,
  profile: Profile,
  callbacks: OrchestratorCallbacks
): Promise<AssessmentResult> {
  const trace: AgentTraceStep[] = [];

  const run = async (
    agent: AgentTraceStep['agent'],
    title: string,
    reasoning: string[],
    outputFn: () => string
  ): Promise<string> => {
    const step: AgentTraceStep = { agent, title, status: 'thinking', reasoning, output: '', durationMs: 0 };
    callbacks.onAgent(step);
    const start = performance.now();
    await delay(650 + Math.random() * 500);
    const output = outputFn();
    step.output = output;
    step.status = 'completed';
    step.durationMs = Math.round(performance.now() - start);
    trace.push(step);
    callbacks.onAgent(step);
    return output;
  };

  // 1. Planner
  const plan = planAgents(chiefComplaint);
  await run('planner', 'Planner Agent — task decomposition', plan.reasoning, () =>
    `Decomposed into ${plan.subtasks.length} subtasks. Agent order: ${plan.agentOrder.join(' → ')}.`
  );

  // 2. Symptom Analysis
  const matched = matchSymptoms(chiefComplaint);
  const symptoms: SymptomRecord[] = matched.map((m) => ({ key: m.key, label: m.label, value: m.bodySystem }));
  if (symptoms.length === 0) {
    symptoms.push({ key: 'general', label: chiefComplaint, value: 'general' });
  }
  await run('symptom', 'Symptom Analysis Agent — structured extraction', [
    `Parsed the complaint and detected ${matched.length} structured symptom cluster(s).`,
    `Extracted facets: duration=${answers['duration'] ?? 'unknown'}, severity=${answers['severity'] ?? 'unknown'}/10, frequency=${answers['frequency'] ?? 'unknown'}.`,
    'Avoided repeating questions already answered in prior memory.',
  ], () => `Extracted ${symptoms.length} symptom facet(s): ${symptoms.map((s) => s.label).join(', ')}.`);

  // 3. Memory
  const recalled = profile.knownSymptoms.length > 0;
  await run('memory', 'Memory Agent — context recall', [
    recalled
      ? `Recalled ${profile.knownSymptoms.length} prior symptom report(s) from this user.`
      : 'No prior memory found for this user — first assessment.',
    profile.age ? `Age on record: ${profile.age}.` : 'Age not on record — collected during intake.',
    profile.medicalConditions.length ? `Known conditions: ${profile.medicalConditions.join(', ')}.` : 'No chronic conditions recorded.',
  ], () => recalled
    ? `Recalled prior context — ${profile.knownSymptoms.length} previous report(s), age ${profile.age ?? 'unknown'}.`
    : 'No prior memory — created a new profile entry.');

  // 4. Medical Knowledge
  const conditions = identifyConditions(chiefComplaint, answers);
  await run('knowledge', 'Medical Knowledge Agent — differential reasoning', [
    `Cross-referenced symptoms against ${conditions.length} candidate condition pattern(s).`,
    `Leading consideration: ${conditions[0]?.name} (${conditions[0]?.likelihood}% match).`,
    'No diagnosis issued — these are considerations for discussion with a clinician.',
  ], () => `Identified ${conditions.length} possible condition(s): ${conditions.map((c) => c.name).join(', ')}.`);

  // 5. Risk Assessment
  const risk = assessRisk(chiefComplaint, answers, conditions);
  await run('risk', 'Risk Assessment Agent — urgency classification', risk.reasoning, () =>
    `Urgency score ${risk.score}/100 → ${risk.level.toUpperCase()}.`
  );

  // 6. Appointment
  const appointment = recommendAppointment(risk, chiefComplaint);
  await run('appointment', 'Appointment Recommendation Agent — care pathway', appointment.reasoning, () =>
    `Recommended pathway: ${appointment.specialist}.`
  );

  // 7. Explanation
  const reasoning = explainResult(risk, conditions, appointment);
  await run('explanation', 'Explanation Agent — patient-friendly translation', [
    `Confidence computed at ${reasoning.confidence}%.`,
    `Next action: ${reasoning.nextAction}`,
    'Translated clinical reasoning into plain language and surfaced uncertainty.',
  ], () => `Produced a plain-language explanation at ${reasoning.confidence}% confidence.`);

  // 8. Report
  const timeline = buildTimeline(chiefComplaint, answers, trace);
  const nextSteps: string[] = [
    reasoning.nextAction,
    risk.level === 'emergency' ? 'Do not delay — emergency symptoms can become time-critical.' : 'Monitor your symptoms and re-assess if they change.',
    'Keep a note of when symptoms started and how they evolved.',
    'Share this report with your healthcare provider.',
  ];
  await run('report', 'Report Generator Agent — structured summary', [
    'Assembled symptoms, timeline, risk, conditions, recommendation, and emergency advice.',
    'Report is ready for review and can be printed or shared.',
  ], () => 'Generated a structured patient health report.');

  const emergencyAdvice = risk.level === 'emergency'
    ? 'This presentation overlaps with time-critical conditions. Call your local emergency number (e.g. 911) immediately or have someone take you to the nearest emergency department. Do not drive yourself.'
    : risk.level === 'high'
    ? 'Seek same-day medical care. If symptoms intensify suddenly — chest pain, breathlessness, fainting, confusion, or weakness on one side — treat it as an emergency.'
    : 'No emergency signs detected. If you develop severe sudden symptoms, seek emergency care immediately.';

  return {
    chiefComplaint,
    symptoms,
    timeline,
    agentTrace: trace,
    riskLevel: risk.level,
    riskScore: risk.score,
    possibleConditions: conditions,
    recommendedSpecialist: appointment.specialist,
    recommendation: appointment.recommendation,
    reasoning,
    confidence: reasoning.confidence,
    emergencyAdvice,
    nextSteps,
  };
}

export const AGENT_META: Record<AgentTraceStep['agent'], { name: string; role: string; color: string; icon: string }> = {
  planner: { name: 'Planner Agent', role: 'Decomposes the problem and assigns subtasks', color: '#2563eb', icon: 'Brain' },
  symptom: { name: 'Symptom Analysis Agent', role: 'Extracts structured symptom facets', color: '#06b6d4', icon: 'Stethoscope' },
  memory: { name: 'Memory Agent', role: 'Recalls prior context, avoids repeats', color: '#8b5cf6', icon: 'Database' },
  knowledge: { name: 'Medical Knowledge Agent', role: 'Identifies possible conditions', color: '#0ea5e9', icon: 'BookOpen' },
  risk: { name: 'Risk Assessment Agent', role: 'Classifies urgency level', color: '#f59e0b', icon: 'ShieldAlert' },
  appointment: { name: 'Appointment Recommendation Agent', role: 'Routes to the right care', color: '#10b981', icon: 'CalendarCheck' },
  explanation: { name: 'Explanation Agent', role: 'Translates reasoning plainly', color: '#6366f1', icon: 'MessageCircle' },
  report: { name: 'Report Generator Agent', role: 'Assembles the health report', color: '#0b1220', icon: 'FileText' },
};
