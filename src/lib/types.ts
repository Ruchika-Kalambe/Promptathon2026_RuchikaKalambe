export type AgentId =
  | 'planner'
  | 'symptom'
  | 'memory'
  | 'knowledge'
  | 'risk'
  | 'appointment'
  | 'explanation'
  | 'report';

export type AgentStatus = 'waiting' | 'thinking' | 'completed';

export interface AgentTraceStep {
  agent: AgentId;
  title: string;
  status: AgentStatus;
  reasoning: string[];
  output: string;
  durationMs: number;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'emergency';

export interface PossibleCondition {
  name: string;
  likelihood: number; // 0-100
  rationale: string;
  warningSigns: string[];
}

export interface FollowUpQuestion {
  id: string;
  key: string;
  prompt: string;
  type: 'text' | 'select' | 'scale' | 'multiselect';
  options?: string[];
  hint?: string;
}

export interface SymptomRecord {
  key: string;
  label: string;
  value: string;
}

export interface TimelineEvent {
  time: string;
  label: string;
  detail: string;
  icon: string;
}

export interface ReasoningBlock {
  summary: string;
  confidence: number;
  evidence: string[];
  uncertainty: string;
  nextAction: string;
}

export interface AssessmentResult {
  chiefComplaint: string;
  symptoms: SymptomRecord[];
  timeline: TimelineEvent[];
  agentTrace: AgentTraceStep[];
  riskLevel: RiskLevel;
  riskScore: number;
  possibleConditions: PossibleCondition[];
  recommendedSpecialist: string;
  recommendation: string;
  reasoning: ReasoningBlock;
  confidence: number;
  emergencyAdvice: string;
  nextSteps: string[];
}

export interface Profile {
  sessionId: string;
  age?: number;
  gender?: string;
  medicalConditions: string[];
  allergies: string[];
  medications: string[];
  knownSymptoms: string[];
}
