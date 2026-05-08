-- ============================================================
-- PATCH: Add missing DELETE policies
-- Run this in Supabase SQL Editor → it is safe to re-run
-- ============================================================

-- learning_topics: allow authenticated users to delete
DROP POLICY IF EXISTS "learning_topics_delete" ON public.learning_topics;
CREATE POLICY "learning_topics_delete" ON public.learning_topics
  FOR DELETE TO authenticated USING (true);

-- videos: allow authenticated users to delete
DROP POLICY IF EXISTS "videos_delete" ON public.videos;
CREATE POLICY "videos_delete" ON public.videos
  FOR DELETE TO authenticated USING (true);

-- notes: allow authenticated users to delete
DROP POLICY IF EXISTS "notes_delete" ON public.notes;
CREATE POLICY "notes_delete" ON public.notes
  FOR DELETE TO authenticated USING (true);
