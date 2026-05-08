-- ============================================================
-- GateFlow Pro — Learning Hub Schema Extension
-- Run AFTER the main schema.sql in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- LEARNING TOPICS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learning_topics (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject     TEXT NOT NULL,
  topic       TEXT NOT NULL,
  subtopic    TEXT,
  description TEXT,
  order_num   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_topics_subject ON public.learning_topics(subject);
CREATE INDEX IF NOT EXISTS idx_learning_topics_topic   ON public.learning_topics(topic);

-- ============================================================
-- LEARNING PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id        UUID NOT NULL REFERENCES public.learning_topics(id) ON DELETE CASCADE,
  completed       BOOLEAN DEFAULT FALSE,
  watched_videos  TEXT[] DEFAULT '{}',   -- array of video IDs
  read_notes      TEXT[] DEFAULT '{}',   -- array of note IDs
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_progress_user    ON public.learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_topic   ON public.learning_progress(topic_id);

-- ============================================================
-- VIDEOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.videos (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id         UUID NOT NULL REFERENCES public.learning_topics(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  youtube_url      TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,
  order_num        INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_topic ON public.videos(topic_id);

-- ============================================================
-- NOTES (curated)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id  UUID NOT NULL REFERENCES public.learning_topics(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  content   TEXT,
  link      TEXT,
  type      TEXT DEFAULT 'text',  -- 'text' | 'link'
  order_num INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_topic ON public.notes(topic_id);

-- ============================================================
-- USER NOTES (personal)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id   UUID NOT NULL REFERENCES public.learning_topics(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notes_user  ON public.user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_topic ON public.user_notes(topic_id);

-- ============================================================
-- NOTE BOOKMARKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.note_bookmarks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id    UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, note_id)
);

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.learning_topics    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_bookmarks     ENABLE ROW LEVEL SECURITY;

-- Drop all policies first so this script is safely re-runnable
DROP POLICY IF EXISTS "learning_topics_select"     ON public.learning_topics;
DROP POLICY IF EXISTS "learning_progress_select"   ON public.learning_progress;
DROP POLICY IF EXISTS "learning_progress_insert"   ON public.learning_progress;
DROP POLICY IF EXISTS "learning_progress_update"   ON public.learning_progress;
DROP POLICY IF EXISTS "videos_select"              ON public.videos;
DROP POLICY IF EXISTS "videos_insert"              ON public.videos;
DROP POLICY IF EXISTS "notes_select"               ON public.notes;
DROP POLICY IF EXISTS "notes_insert"               ON public.notes;
DROP POLICY IF EXISTS "user_notes_select"          ON public.user_notes;
DROP POLICY IF EXISTS "user_notes_insert"          ON public.user_notes;
DROP POLICY IF EXISTS "user_notes_update"          ON public.user_notes;
DROP POLICY IF EXISTS "user_notes_delete"          ON public.user_notes;
DROP POLICY IF EXISTS "note_bookmarks_select"      ON public.note_bookmarks;
DROP POLICY IF EXISTS "note_bookmarks_insert"      ON public.note_bookmarks;
DROP POLICY IF EXISTS "note_bookmarks_delete"      ON public.note_bookmarks;

-- Topics: all authenticated users can read, insert, and delete
DROP POLICY IF EXISTS "learning_topics_delete"     ON public.learning_topics;
DROP POLICY IF EXISTS "videos_delete"              ON public.videos;
DROP POLICY IF EXISTS "notes_delete"               ON public.notes;

CREATE POLICY "learning_topics_select" ON public.learning_topics
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "learning_topics_insert" ON public.learning_topics
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "learning_topics_delete" ON public.learning_topics
  FOR DELETE TO authenticated USING (true);

-- Progress: users manage only their own
CREATE POLICY "learning_progress_select" ON public.learning_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "learning_progress_insert" ON public.learning_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "learning_progress_update" ON public.learning_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Videos: authenticated users can read, insert, and delete
CREATE POLICY "videos_select" ON public.videos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "videos_insert" ON public.videos
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "videos_delete" ON public.videos
  FOR DELETE TO authenticated USING (true);

-- Notes: authenticated users can read, insert, and delete
CREATE POLICY "notes_select" ON public.notes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "notes_insert" ON public.notes
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notes_delete" ON public.notes
  FOR DELETE TO authenticated USING (true);


-- User notes: users manage only their own
CREATE POLICY "user_notes_select" ON public.user_notes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_notes_insert" ON public.user_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_notes_update" ON public.user_notes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_notes_delete" ON public.user_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks: users manage only their own
CREATE POLICY "note_bookmarks_select" ON public.note_bookmarks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "note_bookmarks_insert" ON public.note_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "note_bookmarks_delete" ON public.note_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS (idempotent)
-- ============================================================
DROP TRIGGER IF EXISTS user_notes_updated_at       ON public.user_notes;
DROP TRIGGER IF EXISTS learning_progress_updated_at ON public.learning_progress;

CREATE TRIGGER user_notes_updated_at
  BEFORE UPDATE ON public.user_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- SEED DATA — Computer Science Learning Topics
-- (ON CONFLICT DO NOTHING so re-running is safe)
-- ============================================================

INSERT INTO public.learning_topics (subject, topic, subtopic, description, order_num) VALUES
('Computer Science', 'Operating Systems', 'Processes & Threads', 'Process lifecycle, PCB, context switching, thread models, user vs kernel threads', 1),
('Computer Science', 'Operating Systems', 'CPU Scheduling', 'FCFS, SJF, Round Robin, Priority, Multilevel Queue algorithms and metrics', 2),
('Computer Science', 'Operating Systems', 'Deadlock', 'Deadlock conditions, Banker''s Algorithm, detection & recovery strategies', 3),
('Computer Science', 'Operating Systems', 'Memory Management', 'Paging, segmentation, virtual memory, page replacement algorithms', 4),
('Computer Science', 'Operating Systems', 'File Systems', 'FAT, inode, disk scheduling, RAID levels, directory structures', 5),
('Computer Science', 'DBMS', 'Relational Model', 'Relations, keys, integrity constraints, relational algebra operations', 6),
('Computer Science', 'DBMS', 'Normalization', '1NF through BCNF, functional dependencies, lossless decomposition', 7),
('Computer Science', 'DBMS', 'Transactions & Concurrency', 'ACID properties, serializability, lock-based and timestamp protocols', 8),
('Computer Science', 'DBMS', 'Indexing & Hashing', 'B+ trees, dense/sparse indexes, hashing techniques, query optimization', 9),
('Computer Science', 'DBMS', 'SQL & Queries', 'DDL, DML, joins, aggregates, subqueries, views, stored procedures', 10),
('Computer Science', 'Data Structures & Algorithms', 'Arrays & Strings', 'Two pointers, sliding window, prefix sums, string manipulation patterns', 11),
('Computer Science', 'Data Structures & Algorithms', 'Trees & Graphs', 'BST, AVL, heaps, BFS, DFS, shortest paths, spanning trees', 12),
('Computer Science', 'Data Structures & Algorithms', 'Sorting & Searching', 'QuickSort, MergeSort, HeapSort, binary search and variants', 13),
('Computer Science', 'Data Structures & Algorithms', 'Dynamic Programming', 'Memoization, tabulation, classic DP problems (LCS, LIS, Knapsack)', 14),
('Computer Science', 'Data Structures & Algorithms', 'Hashing', 'Hash functions, collision resolution, applications in algorithms', 15),
('Computer Science', 'Computer Networks', 'OSI & TCP/IP Models', 'Layer functions, protocols at each layer, encapsulation & decapsulation', 16),
('Computer Science', 'Computer Networks', 'Data Link Layer', 'Framing, error detection/correction, MAC protocols, Ethernet, CSMA/CD', 17),
('Computer Science', 'Computer Networks', 'Network Layer', 'IP addressing, subnetting, routing algorithms (Dijkstra, Bellman-Ford)', 18),
('Computer Science', 'Computer Networks', 'Transport Layer', 'TCP vs UDP, flow control, congestion control, three-way handshake', 19),
('Computer Science', 'Computer Networks', 'Application Layer', 'HTTP, DNS, FTP, SMTP, DHCP protocols and their workings', 20),
('Computer Science', 'Theory of Computation', 'Regular Languages', 'DFA, NFA, regular expressions, pumping lemma, closure properties', 21),
('Computer Science', 'Theory of Computation', 'Context-Free Languages', 'CFG, CNF, PDA, pumping lemma for CFLs, parsing', 22),
('Computer Science', 'Theory of Computation', 'Turing Machines', 'TM variants, decidability, halting problem, reductions', 23),
('Computer Science', 'Theory of Computation', 'Complexity Theory', 'P vs NP, NP-completeness, reductions, Cook''s theorem', 24)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED VIDEOS (skip if already inserted)
-- ============================================================
INSERT INTO public.videos (topic_id, title, youtube_url, duration_seconds, order_num)
SELECT lt.id, v.title, v.url, v.dur, v.ord
FROM public.learning_topics lt,
(VALUES
  ('Deadlock in OS — Complete Explanation', 'https://www.youtube.com/watch?v=UVo9mGARkhQ', 1423, 1),
  ('Banker''s Algorithm Explained with Example', 'https://www.youtube.com/watch?v=7gMLNiEz3nw', 1876, 2),
  ('Deadlock Detection & Recovery | GATE CS', 'https://www.youtube.com/watch?v=xvoFaI8ZQMU', 945, 3)
) AS v(title, url, dur, ord)
WHERE lt.subject = 'Computer Science' AND lt.subtopic = 'Deadlock'
ON CONFLICT DO NOTHING;

INSERT INTO public.videos (topic_id, title, youtube_url, duration_seconds, order_num)
SELECT lt.id, v.title, v.url, v.dur, v.ord
FROM public.learning_topics lt,
(VALUES
  ('CPU Scheduling Algorithms | All Types | GATE', 'https://www.youtube.com/watch?v=EWkQl0n0w5M', 2134, 1),
  ('Round Robin Scheduling — Solved Examples', 'https://www.youtube.com/watch?v=aWlQYllBZDs', 1205, 2)
) AS v(title, url, dur, ord)
WHERE lt.subject = 'Computer Science' AND lt.subtopic = 'CPU Scheduling'
ON CONFLICT DO NOTHING;

INSERT INTO public.videos (topic_id, title, youtube_url, duration_seconds, order_num)
SELECT lt.id, v.title, v.url, v.dur, v.ord
FROM public.learning_topics lt,
(VALUES
  ('Database Normalization — 1NF 2NF 3NF BCNF', 'https://www.youtube.com/watch?v=GFQaEYEc8_8', 2567, 1),
  ('Functional Dependencies & Normalization | GATE', 'https://www.youtube.com/watch?v=UrYLYV7WSHM', 1834, 2)
) AS v(title, url, dur, ord)
WHERE lt.subject = 'Computer Science' AND lt.subtopic = 'Normalization'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED NOTES (skip if already inserted)
-- ============================================================
INSERT INTO public.notes (topic_id, title, content, type, order_num)
SELECT lt.id, n.title, n.content, 'text', n.ord
FROM public.learning_topics lt,
(VALUES
  ('Four Necessary Conditions for Deadlock',
   E'Deadlock occurs when ALL 4 conditions hold simultaneously:\n1. Mutual Exclusion — At least one resource must be held in a non-shareable mode\n2. Hold and Wait — A process holding resources can request more\n3. No Preemption — Resources cannot be forcibly taken; must be released voluntarily\n4. Circular Wait — A circular chain of processes, each waiting for a resource held by the next\n\nMemory trick: MHNC', 1),
  ('Banker''s Algorithm — Safety Check',
   E'Steps:\n1. Find a process whose Need <= Available\n2. Allocate resources, process finishes, release all its resources\n3. Repeat until all processes finish (safe) or no progress (unsafe)\n\nGATE Tip: Always work with the Need matrix (Max - Allocation).', 2),
  ('GATE PYQ Patterns — Deadlock',
   E'Common question types:\n- Given allocation/max matrices: find if state is safe\n- Calculate need matrix from max and allocation\n- Determine if deadlock has occurred\n- Recovery strategies\n\nHigh-frequency: Banker Algorithm problems appear almost every year.', 3)
) AS n(title, content, ord)
WHERE lt.subject = 'Computer Science' AND lt.subtopic = 'Deadlock'
ON CONFLICT DO NOTHING;
