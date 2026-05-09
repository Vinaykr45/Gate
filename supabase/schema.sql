-- ============================================================
-- GateFlow Pro — Supabase PostgreSQL Schema
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE test_type AS ENUM ('topic', 'subject', 'full');
CREATE TYPE subject_name AS ENUM (
  'Computer Science',
  'Mathematics',
  'General Aptitude',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil',
  'Chemical'
);

-- ============================================================
-- TABLES
-- ============================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  target_year INTEGER DEFAULT 2026,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Questions bank
CREATE TABLE IF NOT EXISTS public.questions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text   TEXT NOT NULL,
  options         JSONB NOT NULL DEFAULT '{}',
  -- options format: {"A": "text", "B": "text", "C": "text", "D": "text"}
  correct_answer  TEXT DEFAULT 'unknown', -- A/B/C/D or 'unknown'
  subject         TEXT NOT NULL,
  topic           TEXT NOT NULL,
  difficulty      difficulty_level DEFAULT 'medium',
  year            INTEGER,
  source_file     TEXT,          -- original uploaded filename
  explanation     TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Tests
CREATE TABLE IF NOT EXISTS public.tests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  type        test_type NOT NULL DEFAULT 'topic',
  subject     TEXT,
  topic       TEXT,
  duration    INTEGER DEFAULT 3600, -- seconds
  question_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Test ↔ Questions junction
CREATE TABLE IF NOT EXISTS public.test_questions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id     UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  order_num   INTEGER NOT NULL DEFAULT 0,
  UNIQUE(test_id, question_id)
);

-- Attempts (test sessions)
CREATE TABLE IF NOT EXISTS public.attempts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id         UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  score           NUMERIC(5,2) DEFAULT 0,
  total_marks     NUMERIC(5,2) DEFAULT 0,
  accuracy        NUMERIC(5,2) DEFAULT 0,   -- percentage
  time_taken      INTEGER DEFAULT 0,         -- seconds
  completed       BOOLEAN DEFAULT FALSE,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

-- Per-question answers
CREATE TABLE IF NOT EXISTS public.answers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id      UUID NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE,
  question_id     UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option TEXT,  -- A/B/C/D or NULL if not answered
  is_correct      BOOLEAN DEFAULT FALSE,
  time_spent      INTEGER DEFAULT 0, -- seconds
  marked_review   BOOLEAN DEFAULT FALSE,
  UNIQUE(attempt_id, question_id)
);

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Upload jobs tracking
CREATE TABLE IF NOT EXISTS public.upload_jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename        TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  status          TEXT DEFAULT 'pending', -- pending/processing/done/error
  questions_found INTEGER DEFAULT 0,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_questions_subject   ON public.questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_topic     ON public.questions(topic);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_year      ON public.questions(year);
CREATE INDEX IF NOT EXISTS idx_tests_user_id       ON public.tests(user_id);
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON public.test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id    ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_test_id    ON public.attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt_id  ON public.answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id   ON public.bookmarks(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_jobs    ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Questions: all authenticated users can read; only owners can write
CREATE POLICY "questions_select" ON public.questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "questions_insert" ON public.questions FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Tests: users see only their own
CREATE POLICY "tests_select" ON public.tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tests_insert" ON public.tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tests_delete" ON public.tests FOR DELETE USING (auth.uid() = user_id);

-- Test questions: visible if the parent test belongs to user
CREATE POLICY "test_questions_select" ON public.test_questions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.tests WHERE id = test_id AND user_id = auth.uid()));
CREATE POLICY "test_questions_insert" ON public.test_questions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.tests WHERE id = test_id AND user_id = auth.uid()));

-- Attempts: users see only their own
CREATE POLICY "attempts_select" ON public.attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "attempts_insert" ON public.attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "attempts_update" ON public.attempts FOR UPDATE USING (auth.uid() = user_id);

-- Answers: visible if the parent attempt belongs to user
CREATE POLICY "answers_select" ON public.answers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.attempts WHERE id = attempt_id AND user_id = auth.uid()));
CREATE POLICY "answers_insert" ON public.answers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.attempts WHERE id = attempt_id AND user_id = auth.uid()));

-- Bookmarks: users see/manage only their own
CREATE POLICY "bookmarks_select" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete" ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Upload jobs: users see and update only their own
CREATE POLICY "upload_jobs_select" ON public.upload_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "upload_jobs_insert" ON public.upload_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "upload_jobs_update" ON public.upload_jobs FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER upload_jobs_updated_at
  BEFORE UPDATE ON public.upload_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gate-uploads',
  'gate-uploads',
  FALSE,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "uploads_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gate-uploads' AND auth.role() = 'authenticated');
CREATE POLICY "uploads_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'gate-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- SEED DATA — 20 Sample GATE CS Questions
-- ============================================================

INSERT INTO public.questions (question_text, options, correct_answer, subject, topic, difficulty, year) VALUES

-- Operating Systems
('Which of the following page replacement algorithms suffers from Belady''s anomaly?',
 '{"A": "LRU", "B": "Optimal", "C": "FIFO", "D": "LFU"}',
 'C', 'Computer Science', 'Operating System - Memory Management', 'medium', 2019),

('Consider a system with byte-addressable memory, 32-bit logical addresses, 4KB page size, and page table entries of 4 bytes each. The number of bits required for the page offset is:',
 '{"A": "10", "B": "12", "C": "14", "D": "16"}',
 'B', 'Computer Science', 'Operating System - Paging', 'medium', 2020),

('Which scheduling algorithm is also known as "shortest remaining time first"?',
 '{"A": "FCFS", "B": "Round Robin", "C": "SJF Non-preemptive", "D": "SJF Preemptive"}',
 'D', 'Computer Science', 'Operating System - CPU Scheduling', 'easy', 2018),

('In the banker''s algorithm, a state is safe if:',
 '{"A": "All processes can complete", "B": "No process is waiting", "C": "Resources are available", "D": "Deadlock is detected"}',
 'A', 'Computer Science', 'Operating System - Deadlock', 'medium', 2021),

-- DBMS
('Which normal form eliminates transitive functional dependencies?',
 '{"A": "1NF", "B": "2NF", "C": "3NF", "D": "BCNF"}',
 'C', 'Computer Science', 'DBMS - Normalization', 'easy', 2017),

('ACID properties of a transaction: which property ensures that a transaction brings the database from one valid state to another?',
 '{"A": "Atomicity", "B": "Consistency", "C": "Isolation", "D": "Durability"}',
 'B', 'Computer Science', 'DBMS - Transactions', 'easy', 2019),

('Consider a relation R(A, B, C, D) with functional dependencies: A→B, B→C, C→D. The highest normal form satisfied by R is:',
 '{"A": "1NF", "B": "2NF", "C": "3NF", "D": "BCNF"}',
 'A', 'Computer Science', 'DBMS - Normalization', 'hard', 2022),

-- Data Structures & Algorithms
('The worst-case time complexity of QuickSort is:',
 '{"A": "O(n log n)", "B": "O(n²)", "C": "O(n)", "D": "O(log n)"}',
 'B', 'Computer Science', 'DSA - Sorting', 'easy', 2018),

('What is the minimum number of nodes in a complete binary tree with height h?',
 '{"A": "2^h", "B": "2^h - 1", "C": "2^(h-1)", "D": "h+1"}',
 'A', 'Computer Science', 'DSA - Trees', 'medium', 2020),

('Dijkstra''s algorithm fails when:',
 '{"A": "The graph has cycles", "B": "Edge weights are negative", "C": "The graph is dense", "D": "Multiple shortest paths exist"}',
 'B', 'Computer Science', 'DSA - Graphs', 'easy', 2017),

('The time complexity of finding the kth smallest element using a min-heap of n elements is:',
 '{"A": "O(k log n)", "B": "O(n log k)", "C": "O(n + k)", "D": "O(k log k)"}',
 'A', 'Computer Science', 'DSA - Heaps', 'hard', 2021),

-- Computer Networks
('Which layer of the OSI model is responsible for end-to-end error recovery and flow control?',
 '{"A": "Network", "B": "Data Link", "C": "Transport", "D": "Session"}',
 'C', 'Computer Science', 'Computer Networks - OSI Model', 'easy', 2016),

('The maximum efficiency of pure ALOHA is:',
 '{"A": "50%", "B": "36.8%", "C": "18.4%", "D": "25%"}',
 'C', 'Computer Science', 'Computer Networks - MAC Protocols', 'hard', 2019),

-- Theory of Computation
('Which of the following languages is NOT regular?',
 '{"A": "Set of all strings with equal 0s and 1s", "B": "Set of all strings ending in 01", "C": "(01)* | (10)*", "D": "All strings of length ≤ 100"}',
 'A', 'Computer Science', 'Theory of Computation - Regular Languages', 'medium', 2020),

('A Turing machine is equivalent to:',
 '{"A": "Finite Automaton", "B": "Pushdown Automaton", "C": "Linear Bounded Automaton", "D": "None — it is more powerful"}',
 'D', 'Computer Science', 'Theory of Computation - Turing Machines', 'medium', 2018),

-- Mathematics
('The number of ways to arrange the letters of the word MISSISSIPPI is:',
 '{"A": "34650", "B": "11!/(4!4!2!)", "C": "Both A and B", "D": "11!"}',
 'C', 'Mathematics', 'Combinatorics', 'hard', 2017),

('The eigenvalues of a skew-symmetric matrix are:',
 '{"A": "Real", "B": "Purely imaginary or zero", "C": "Positive real", "D": "Always zero"}',
 'B', 'Mathematics', 'Linear Algebra', 'medium', 2021),

-- General Aptitude
('A train 150m long passes a pole in 15 seconds. How long will it take to pass a platform 100m long?',
 '{"A": "20 seconds", "B": "25 seconds", "C": "22.5 seconds", "D": "27 seconds"}',
 'B', 'General Aptitude', 'Time Speed Distance', 'easy', 2019),

('If 2x + 3y = 12 and xy = 6, then the value of 4x² + 9y² is:',
 '{"A": "72", "B": "36", "C": "144", "D": "108"}',
 'A', 'General Aptitude', 'Algebra', 'medium', 2020),

('In a group of 120 students, 80 like Mathematics and 60 like Physics. If 20 like neither, how many like both?',
 '{"A": "30", "B": "40", "C": "50", "D": "60"}',
 'B', 'General Aptitude', 'Set Theory', 'easy', 2018);

