# MediMind AI — Virtual Health Assistant

> **Your Intelligent Health Guidance Companion**

MediMind AI is a premium, multi-agent virtual health assistant that guides users through symptom assessment, urgency classification, and care-pathway recommendation. It is **not** a chatbot — it is a complete **Agentic AI ecosystem** where eight specialized AI agents collaborate, reason, remember, plan, and produce an explainable healthcare recommendation.

Built for the Agentic AI Competition.

---

## Problem Statement

Many people experience symptoms but don't know whether they should rest, visit a clinic, consult a specialist, or seek emergency care. Hospitals are overcrowded because patients often cannot determine the urgency of their condition.

## Solution

MediMind AI intelligently guides users by:

- Asking intelligent follow-up questions tailored to their symptoms
- Analyzing symptoms across multiple clinical facets
- Assessing urgency (Low / Moderate / High / Emergency)
- Suggesting possible conditions **without diagnosing**
- Recommending the next appropriate step (home care, general physician, or specialist)
- Remembering previous answers and never asking the same question twice
- Providing a fully explainable, printable health report

The AI clearly states that it is **not** replacing a doctor and encourages professional medical consultation when appropriate.

---

## Architecture

MediMind AI uses a **planned multi-agent pipeline**. A central orchestrator runs eight specialized agents in sequence, passing structured context between them. Each agent emits a reasoning trace, evidence, and an output that downstream agents consume.

```
User
  │
  ▼
Planner Agent ──► decomposes complaint into subtasks
  │
  ▼
Symptom Analysis Agent ──► extracts structured facets (duration, severity, triggers…)
  │
  ▼
Memory Agent ──► recalls prior context, avoids repeats
  │
  ▼
Medical Knowledge Agent ──► identifies possible conditions (no diagnosis)
  │
  ▼
Risk Assessment Agent ──► classifies urgency (low → emergency)
  │
  ▼
Appointment Recommendation Agent ──► routes to the right care pathway
  │
  ▼
Explanation Agent ──► translates reasoning into plain language + confidence
  │
  ▼
Report Generator Agent ──► assembles the structured health report
```

### Data Persistence

- **Supabase (Postgres)** stores the user's persistent memory profile and every completed assessment.
- **Row Level Security** is enabled on all tables.
- The Memory Agent reads and writes the `profiles` table so prior symptoms, age, gender, conditions, allergies, and medications persist across sessions.

---

## AI Workflow

The orchestrator (`src/lib/agents.ts`) runs the full pipeline with live trace emission. Each agent:

1. Receives structured context from upstream agents
2. Produces a list of reasoning steps (visible to the user)
3. Emits an output consumed by downstream agents
4. Reports a status: `waiting → thinking → completed`

The UI renders each agent as an animated card that updates in real time as the pipeline progresses.

---

## Agent Descriptions

| Agent | Responsibility |
|---|---|
| **Planner Agent** | Understands the user's symptoms, breaks the problem into subtasks, and determines which agents should execute. |
| **Symptom Analysis Agent** | Collects symptoms, asks intelligent follow-up questions, remembers previous answers, and extracts duration, severity, location, frequency, triggers, and pain level. |
| **Medical Knowledge Agent** | Uses trusted medical reasoning to identify possible conditions — without diagnosing — and highlights warning signs. |
| **Risk Assessment Agent** | Classifies urgency into 🟢 Low, 🟡 Moderate, 🟠 High, or 🔴 Emergency and explains the reasoning. |
| **Appointment Recommendation Agent** | Recommends home care, a general physician, or a specialist (Cardiologist, Neurologist, Dermatologist, ENT, Orthopedic, Emergency Department) and explains why. |
| **Memory Agent** | Remembers previous symptoms, assessments, age, gender, conditions, allergies, and medications — never asks twice. |
| **Explanation Agent** | Explains every recommendation in simple language, shows a confidence level, and states uncertainty. |
| **Report Generator Agent** | Generates a professional patient summary with symptoms, timeline, risk level, conditions, recommended doctor, next steps, and emergency advice. |

---

## Prompt Engineering Strategy

MediMind AI uses a **deterministic, rule-based agentic reasoning engine** rather than opaque LLM calls, so that every step of reasoning is fully transparent, reproducible, and explainable — ideal for a competition demonstration.

The strategy mirrors prompt-engineering best practices:

- **Role separation:** each agent has a single, clearly scoped responsibility (system-prompt equivalent).
- **Structured context passing:** agents receive structured facets (duration, severity, body system) rather than raw text, reducing hallucination risk.
- **Chain-of-thought traces:** every agent emits its reasoning as an ordered list of steps, surfaced verbatim in the UI.
- **Memory injection:** the Memory Agent's recalled context is injected into downstream agents so they avoid redundant work.
- **Confidence calibration:** the Explanation Agent computes a confidence score from the leading condition likelihood and urgency score, and explicitly states uncertainty.

---

## Technology Stack

- **React 19 + TypeScript** — UI framework
- **Tailwind CSS v4** — styling (glassmorphism, gradients, responsive)
- **Vite 8** — build tooling
- **Supabase (Postgres + RLS)** — data persistence for assessments and memory
- **Lucide React** — medical icons
- **Multi-Agent Reasoning Engine** — `src/lib/agents.ts`

---

## Features

- 8 collaborating AI agents with live, animated reasoning traces
- Conversational multi-step assessment with typing animation and progress indicator
- Intelligent follow-up questions that avoid repeats using the Memory Agent
- Urgency classification: 🟢 Low / 🟡 Moderate / 🟠 High / 🔴 Emergency
- Possible conditions with likelihood, rationale, and warning signs (no diagnosis)
- Appointment recommendation with specialist routing
- Confidence gauge and explainable reasoning cards
- Assessment timeline visualization
- Printable health report
- Persistent health history (Supabase-backed)
- Emergency guidance page with red-flag reference and international emergency numbers
- Premium healthcare SaaS design: blue + white theme, glassmorphism, soft gradients, smooth animations

---

## Installation

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

Environment variables for Supabase are pre-populated in `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## Disclaimer

> This application is an AI health guidance assistant and is **NOT a medical diagnosis system**. Always consult a licensed healthcare professional.

---

## Future Improvements

- Integrate a real LLM (e.g. GPT-4 / Claude) behind each agent for richer natural-language reasoning
- Add user authentication for per-account health history
- Integrate real-time symptom-checker APIs (e.g. Infermedica, Ada)
- Add voice input for symptom description
- Multi-language support
- Telehealth booking integration
- Wearable-device data ingestion for continuous monitoring

## screenshots
<img width="1497" height="841" alt="agent" src="https://github.com/user-attachments/assets/517cfb90-ccd7-4930-be3e-85c7d3adf0a3" />
<img width="1507" height="841" alt="assesment" src="https://github.com/user-attachments/assets/4395c51a-1971-4cfa-851f-314abc0078fe" />
<img width="1507" height="830" alt="urgency" src="https://github.com/user-attachments/assets/b3e7423f-cac8-44af-90c9-484c14837304" />
<img width="1482" height="811" alt="appointment" src="https://github.com/user-attachments/assets/87c500c4-8777-41ad-95e2-33cc73c613d2" />
<img width="1492" height="832" alt="emergency" src="https://github.com/user-attachments/assets/8a1fcf9b-8553-4e96-8acf-f1230f37c770" />
<img width="1472" height="837" alt="patient history" src="https://github.com/user-attachments/assets/3cf29131-725d-4858-865e-99bdaa559f2a" />
<img width="1485" height="820" alt="agent 1" src="https://github.com/user-attachments/assets/850c218e-adc0-4604-bd29-4f97fb515a26" />






