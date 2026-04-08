
-- Bookmarks table
CREATE TABLE public.gita_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapter, verse)
);

ALTER TABLE public.gita_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.gita_bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookmarks" ON public.gita_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookmarks" ON public.gita_bookmarks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.gita_bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Journal table
CREATE TABLE public.gita_journal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  reflection TEXT NOT NULL,
  mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gita_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal" ON public.gita_journal FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own journal" ON public.gita_journal FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal" ON public.gita_journal FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal" ON public.gita_journal FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add streak tracking to gita_progress
ALTER TABLE public.gita_progress ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.gita_progress ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0;
