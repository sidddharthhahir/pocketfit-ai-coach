
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS public_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format_chk
  CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]{3,30}$');

DROP POLICY IF EXISTS "Public profiles are viewable by anyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by anyone"
  ON public.profiles
  FOR SELECT
  USING (public_enabled = true);

-- Allow public read of aggregate progress for public profiles
DROP POLICY IF EXISTS "Public workouts viewable when profile public" ON public.workout_logs;
CREATE POLICY "Public workouts viewable when profile public"
  ON public.workout_logs
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = workout_logs.user_id AND p.public_enabled = true)
  );

DROP POLICY IF EXISTS "Public checkins viewable when profile public" ON public.gym_checkins;
CREATE POLICY "Public checkins viewable when profile public"
  ON public.gym_checkins
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = gym_checkins.user_id AND p.public_enabled = true)
  );
