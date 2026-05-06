
-- Group challenges
CREATE TABLE public.group_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'custom',
  target_per_day INTEGER NOT NULL DEFAULT 1,
  duration_days INTEGER NOT NULL DEFAULT 30,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  invite_code TEXT NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.challenge_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.group_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  display_name TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);

CREATE TABLE public.challenge_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.group_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_date DATE NOT NULL DEFAULT CURRENT_DATE,
  value INTEGER NOT NULL DEFAULT 1,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id, day_date)
);

ALTER TABLE public.group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_checkins ENABLE ROW LEVEL SECURITY;

-- Helper: is member of challenge
CREATE OR REPLACE FUNCTION public.is_challenge_member(_challenge_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.challenge_members
    WHERE challenge_id = _challenge_id AND user_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.group_challenges
    WHERE id = _challenge_id AND owner_id = _user_id
  );
$$;

-- group_challenges policies
CREATE POLICY "Authenticated can read challenges" ON public.group_challenges
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner can insert challenges" ON public.group_challenges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner can update challenges" ON public.group_challenges
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner can delete challenges" ON public.group_challenges
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- members policies
CREATE POLICY "Members can read members" ON public.challenge_members
  FOR SELECT TO authenticated USING (public.is_challenge_member(challenge_id, auth.uid()));
CREATE POLICY "User can join self" ON public.challenge_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can leave self" ON public.challenge_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- checkins policies
CREATE POLICY "Members can read checkins" ON public.challenge_checkins
  FOR SELECT TO authenticated USING (public.is_challenge_member(challenge_id, auth.uid()));
CREATE POLICY "User can insert own checkin" ON public.challenge_checkins
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_challenge_member(challenge_id, auth.uid()));
CREATE POLICY "User can update own checkin" ON public.challenge_checkins
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can delete own checkin" ON public.challenge_checkins
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
