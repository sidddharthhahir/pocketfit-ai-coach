CREATE TABLE public.body_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  waist_cm NUMERIC,
  chest_cm NUMERIC,
  hips_cm NUMERIC,
  left_arm_cm NUMERIC,
  right_arm_cm NUMERIC,
  left_thigh_cm NUMERIC,
  right_thigh_cm NUMERIC,
  neck_cm NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own measurements" ON public.body_measurements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own measurements" ON public.body_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own measurements" ON public.body_measurements
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own measurements" ON public.body_measurements
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_body_measurements_user_date ON public.body_measurements(user_id, log_date DESC);