CREATE TABLE public.rest_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rest_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, rest_date)
);

ALTER TABLE public.rest_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own rest days"
ON public.rest_days FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own rest days"
ON public.rest_days FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own rest days"
ON public.rest_days FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_rest_days_user_date ON public.rest_days(user_id, rest_date);