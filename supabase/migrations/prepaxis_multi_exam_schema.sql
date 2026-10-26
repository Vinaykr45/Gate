-- ============================================================
-- PrepAxis AI — Multi-Exam Curriculum & Syllabus Versioning Migration
-- Non-destructive extension to preserve all existing GATE records!
-- ============================================================

-- 1. Extend profiles with target examination track
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS target_track TEXT DEFAULT 'gate_cse',
  ADD COLUMN IF NOT EXISTS target_session TEXT DEFAULT '2026',
  ADD COLUMN IF NOT EXISTS daily_study_hours NUMERIC(3,1) DEFAULT 3.0;

-- 2. Extend questions with track, syllabus version, and marks
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS exam_track TEXT DEFAULT 'gate_cse',
  ADD COLUMN IF NOT EXISTS syllabus_version TEXT DEFAULT 'GATE_CSE_2025_2026',
  ADD COLUMN IF NOT EXISTS paper_code TEXT,
  ADD COLUMN IF NOT EXISTS chapter_name TEXT,
  ADD COLUMN IF NOT EXISTS marks NUMERIC(4,2) DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_questions_exam_track ON public.questions(exam_track);
CREATE INDEX IF NOT EXISTS idx_questions_syllabus_version ON public.questions(syllabus_version);

-- 3. Extend tests with exam track, syllabus version, and negative marking configuration
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS exam_track TEXT DEFAULT 'gate_cse',
  ADD COLUMN IF NOT EXISTS syllabus_version TEXT DEFAULT 'GATE_CSE_2025_2026',
  ADD COLUMN IF NOT EXISTS paper_id TEXT,
  ADD COLUMN IF NOT EXISTS has_negative_marking BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS negative_mark_rate NUMERIC(3,2) DEFAULT 0.33;

CREATE INDEX IF NOT EXISTS idx_tests_exam_track ON public.tests(exam_track);

-- 4. Extend learning_topics with exam track, paper, and chapter
ALTER TABLE public.learning_topics
  ADD COLUMN IF NOT EXISTS exam_track TEXT DEFAULT 'gate_cse',
  ADD COLUMN IF NOT EXISTS paper_name TEXT,
  ADD COLUMN IF NOT EXISTS chapter_name TEXT,
  ADD COLUMN IF NOT EXISTS syllabus_version TEXT DEFAULT 'GATE_CSE_2025_2026';

CREATE INDEX IF NOT EXISTS idx_learning_topics_exam_track ON public.learning_topics(exam_track);

-- 5. Syllabus Versions Table (Admin managed)
CREATE TABLE IF NOT EXISTS public.syllabus_versions (
  id                  TEXT PRIMARY KEY, -- e.g. 'GATE_CSE_2025_2026', 'ICAI_FND_NEW_SCHEME'
  exam_track          TEXT NOT NULL,
  title               TEXT NOT NULL,
  effective_from      DATE NOT NULL,
  applicable_sessions TEXT[] NOT NULL DEFAULT '{}',
  official_source_url TEXT NOT NULL,
  last_verified_date  DATE DEFAULT CURRENT_DATE,
  is_approved         BOOLEAN DEFAULT TRUE,
  description         TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial official syllabus versions
INSERT INTO public.syllabus_versions (id, exam_track, title, effective_from, applicable_sessions, official_source_url, description)
VALUES
  ('GATE_CSE_2025_2026', 'gate_cse', 'GATE CSE Official Syllabus (2025/2026)', '2024-08-01', ARRAY['February 2025', 'February 2026'], 'https://gate2025.iitr.ac.in', 'Organizing Institute official syllabus'),
  ('ICAI_FND_NEW_SCHEME', 'ca_foundation', 'ICAI Foundation New Scheme', '2023-07-01', ARRAY['June 2024', 'September 2024', 'January 2025', 'May 2025', 'September 2025'], 'https://www.icai.org/post/foundation-nset', 'ICAI New Scheme of Education and Training (4 Papers)'),
  ('ICAI_INT_NEW_SCHEME', 'ca_intermediate', 'ICAI Intermediate New Scheme', '2023-07-01', ARRAY['May 2024', 'September 2024', 'January 2025', 'May 2025', 'September 2025'], 'https://www.icai.org/post/syllabus-nset-intermediate', 'ICAI New Scheme Group I and Group II (6 Papers)'),
  ('ICAI_FINAL_NEW_SCHEME', 'ca_final', 'ICAI Final New Scheme', '2023-07-01', ARRAY['May 2024', 'November 2024', 'May 2025', 'November 2025'], 'https://www.icai.org/post/syllabus-nset-final', 'ICAI New Scheme Group I, Group II and SPOM')
ON CONFLICT (id) DO NOTHING;

-- 6. Spaced Repetition Revision / Mistake Book Table
CREATE TABLE IF NOT EXISTS public.revision_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  exam_track      TEXT NOT NULL DEFAULT 'gate_cse',
  subject         TEXT NOT NULL,
  topic           TEXT NOT NULL,
  mistake_count   INTEGER DEFAULT 1,
  repetitions     INTEGER DEFAULT 0,
  ease_factor     NUMERIC(4,2) DEFAULT 2.50,
  interval_days   INTEGER DEFAULT 1,
  last_reviewed   TIMESTAMPTZ DEFAULT NOW(),
  next_due_date   TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 day'),
  user_notes      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_revision_user_due ON public.revision_items(user_id, next_due_date);

-- 7. Study Planner Table (Deterministic scheduling)
CREATE TABLE IF NOT EXISTS public.study_plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_track      TEXT NOT NULL,
  target_date     DATE NOT NULL,
  daily_hours     NUMERIC(3,1) DEFAULT 3.0,
  schedule_data   JSONB NOT NULL DEFAULT '[]', -- array of daily tasks
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exam_track)
);

-- 8. Curriculum Import Audit Logs
CREATE TABLE IF NOT EXISTS public.curriculum_imports (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  exam_track          TEXT NOT NULL,
  syllabus_version    TEXT NOT NULL,
  source_url          TEXT NOT NULL,
  records_imported    INTEGER DEFAULT 0,
  status              TEXT DEFAULT 'approved', -- 'pending_review', 'approved', 'rejected'
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.syllabus_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_imports ENABLE ROW LEVEL SECURITY;

-- Syllabus versions are public read
CREATE POLICY "Syllabus versions are viewable by everyone" 
  ON public.syllabus_versions FOR SELECT USING (true);

-- Revision items are student-isolated
CREATE POLICY "Users can manage their own revision items" 
  ON public.revision_items FOR ALL USING (auth.uid() = user_id);

-- Study plans are student-isolated
CREATE POLICY "Users can manage their own study plan" 
  ON public.study_plans FOR ALL USING (auth.uid() = user_id);

-- Curriculum imports are readable by authenticated users
CREATE POLICY "Curriculum imports are viewable by authenticated users" 
  ON public.curriculum_imports FOR SELECT USING (auth.role() = 'authenticated');
