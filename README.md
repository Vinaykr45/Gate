# PrepAxis AI 🎓

> **Prepare Smarter. Practice Better. Perform Stronger.**  
> Comprehensive, AI-assisted examination preparation platform supporting **GATE Computer Science & IT**, **CA Foundation**, **CA Intermediate**, and **CA Final**. Built with **Next.js 16**, **Supabase PostgreSQL (RLS)**, and a **Multi-Provider AI Engine (Groq, OpenRouter, Google Gemini)**.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Examination Tracks](#-examination-tracks)
- [Core Architectural Modules](#-core-architectural-modules)
- [Multi-Provider AI Architecture](#-multi-provider-ai-architecture)
- [Deterministic Study Planner & Spaced Repetition](#-deterministic-study-planner--spaced-repetition)
- [Examination Engine & Scoring Rules](#-examination-engine--scoring-rules)
- [Official Curriculum & Syllabus Sources](#-official-curriculum--syllabus-sources)
- [Database Schema & Non-Destructive Migrations](#-database-schema--non-destructive-migrations)
- [Environment Configuration](#-environment-configuration)
- [Getting Started](#-getting-started)
- [Automated Test Suite](#-automated-test-suite)
- [Production Readiness & Limitations](#-production-readiness--limitations)

---

## 📖 Overview

**PrepAxis AI** upgrades the initial GateFlow architecture into a scalable, multi-examination learning ecosystem. It preserves existing GATE CSE question banks and test histories while introducing complete, version-controlled curricula for the **Institute of Chartered Accountants of India (ICAI) New Scheme of Education and Training**.

---

## 🎯 Examination Tracks

PrepAxis AI provides track isolation: curriculum, questions, tests, and student analytics for one track never bleed into another.

| Track | Level | Curricular Scope | Question Formats | Marking Scheme |
|---|---|---|---|---|
| **GATE CSE** | Post-Graduate Engineering | 10 Core Subjects + General Aptitude (190+ topics) | 1-mark & 2-mark MCQs, MSQs, NAT | MCQ: -0.33 / -0.66; NAT & MSQ: 0 penalty |
| **CA Foundation** | ICAI Entry Level | 4 Papers: Accounting, Business Laws, Quantitative Aptitude, Business Economics | Objective MCQs + Subjective | Paper 3 & 4: -0.25 penalty; Paper 1 & 2: 0 penalty |
| **CA Intermediate** | ICAI Executive Level | Group I (3 Papers) & Group II (3 Papers) | 30% Case-Scenario MCQs + 70% Descriptive | Case MCQs: 0 negative penalty under New Scheme |
| **CA Final** | ICAI Professional Level | Group I (3 Papers), Group II (3 Papers) + SPOM | Multidisciplinary Case Studies, Ind AS, Advanced Tax & Audit | Case MCQs: 0 negative penalty |

---

## 🌟 Core Architectural Modules

### 1. 📚 Version-Controlled Curriculum Hub (`/learn`)
- Built from verified official syllabi in `lib/curriculum/registry.ts`.
- Paper-wise, group-wise, and chapter-wise navigation.
- Curated video lectures, technical revision notes, and private student notebook annotations.
- Track switching from the dashboard sidebar without deleting historical progress.

### 2. 📝 Adaptive Mock Test Generator (`/test`)
- Modes: **Topic-wise Quiz**, **Subject/Paper Test**, and **Full Mock Examination**.
- Strict server-side authoritative scoring in `app/api/submit-test/route.ts`.
- Exam-calibrated timers (e.g. 160s/question for GATE, 90s/question for CA Foundation MCQs).
- Idempotent submission: network dropouts or double submissions return saved attempts without duplicate records.

### 3. 🧠 Multi-Provider AI Provider System (`lib/ai/`)
- Unified router with bounded fallback cascade: **Groq** $\rightarrow$ **OpenRouter** $\rightarrow$ **Google Gemini**.
- Round-robin key rotation across up to 20 Gemini keys for resilient burst capacity.
- Zero blocker guarantee: AI failure never prevents mock test submission, curriculum study, or study planning.
- In-memory LRU prompt cache with request deduplication to save token costs.

### 4. 📅 Deterministic Study Planner (`/planner`)
- Calculates day-by-day study tasks, weekly milestones, and revision sprints.
- 100% deterministic mathematical model (functions completely offline without AI uptime).

### 5. 🔄 Mistake Book & Spaced Repetition (`/revision`)
- Automatic population of missed questions from mock test submissions into the student's review queue.
- Implements the **SuperMemo-2 (SM-2)** algorithm with recall feedback (grades 0 to 5) to dynamically space review intervals.

### 6. 🛡️ Administrative Console & AI Health (`/admin`)
- Real-time provider health status (latency, error count, active model IDs).
- Syllabus version verification and approval status.
- Question draft approval workflow (`pending_verification` $\rightarrow$ `verified`).

---

## 🤖 Multi-Provider AI Architecture

```plaintext
lib/ai/
├── config.ts              # Env reading (AI_PRIMARY_PROVIDER, keys, models, timeouts)
├── types.ts               # Core AI interfaces & parsed response payloads
├── errors.ts              # Normalized errors (AIRateLimitError, AIAuthError, AITimeoutError)
├── cache.ts               # In-memory TTL cache & request deduplication
├── validation.ts          # Markdown stripping & JSON schema validation
├── router.ts              # Cascade executor with jittered backoff
├── providers/
│   ├── groq.ts            # High-speed LPU inference (llama-3.3-70b-versatile)
│   ├── openrouter.ts      # Multi-model gateway
│   └── gemini.ts          # Key-pool rotation across 2.5-flash / 2.0-flash / 1.5-flash
└── prompts/
    ├── tutor.ts           # Exam-aware academic tutor
    ├── generate-questions.ts # Question generator with draft tagging
    ├── extract-questions.ts  # PDF question parser
    ├── summarize.ts       # Structured flashcard & revision note generator
    └── performance-insights.ts # Diagnostic statistics interpreter
```

---

## 🗄 Database Schema & Non-Destructive Migrations

To apply the multi-exam schema without deleting existing GATE student records:

1. Open your **Supabase Dashboard $\rightarrow$ SQL Editor**.
2. Run the migration script:
   ```sql
   supabase/migrations/prepaxis_multi_exam_schema.sql
   ```
3. This script non-destructively adds:
   - `profiles.target_track` (default: `'gate_cse'`)
   - `questions.exam_track` and `questions.syllabus_version`
   - `tests.exam_track` and `tests.negative_mark_rate`
   - New tables: `syllabus_versions`, `revision_items`, `study_plans`, `curriculum_imports`.
   - Complete Row Level Security (RLS) policies isolating student data by `auth.uid() = user_id`.

---

## 🏛 Official Curriculum & Syllabus Sources

| Examination | Authority | Official Syllabus Reference | Status in PrepAxis AI |
|---|---|---|---|
| **GATE CSE** | IISc / IIT Organizing Committee | [GATE 2025/2026 Official Syllabus](https://gate2025.iitr.ac.in) | Verified & Active (10 Subjects + GA) |
| **CA Foundation** | Institute of Chartered Accountants of India (ICAI) | [ICAI Foundation New Scheme](https://www.icai.org/post/foundation-nset) | Verified & Active (4 Papers) |
| **CA Intermediate** | Institute of Chartered Accountants of India (ICAI) | [ICAI Intermediate New Scheme](https://www.icai.org/post/syllabus-nset-intermediate) | Verified & Active (6 Papers, Group I & II) |
| **CA Final** | Institute of Chartered Accountants of India (ICAI) | [ICAI Final New Scheme](https://www.icai.org/post/syllabus-nset-final) | Verified & Active (6 Papers + SPOM) |

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers
AI_PRIMARY_PROVIDER=groq
AI_FALLBACK_PROVIDERS=openrouter,gemini

GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile

OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct

GEMINI_API_KEY=your-primary-gemini-key
GEMINI_API_KEY_2=your-backup-gemini-key
GEMINI_MODEL=gemini-2.5-flash

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Test Suite
```bash
npm test
```
Executes 22 automated unit and integration tests covering:
- AI provider router, fallback, caching, and JSON validation
- Curriculum hierarchy and syllabus version mapping
- Deterministic study planner calculations
- SuperMemo-2 (SM-2) spaced repetition intervals
- Authoritative multi-exam scoring engine

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Automated Test Results

```plaintext
✔ AI Validation and JSON Extraction (4 tests)
✔ AI Error Normalization (2 tests)
✔ AI Cache and Deduplication (2 tests)
✔ Curriculum Registry and Syllabus Versions (5 tests)
✔ Authoritative Multi-Exam Scoring Engine (4 tests)
✔ Deterministic Study Planner (2 tests)
✔ SuperMemo-2 (SM-2) Spaced Repetition (3 tests)

Total: 22 passed, 0 failed across 7 suites.
```
