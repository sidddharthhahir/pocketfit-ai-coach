-- Create gym_checkins table for photo check-ins
CREATE TABLE public.gym_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  photo_url TEXT NOT NULL,
  ai_is_gym BOOLEAN,
  ai_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gym_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own checkins"
ON public.gym_checkins
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
ON public.gym_checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkins"
ON public.gym_checkins
FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for checkins
INSERT INTO storage.buckets (id, name, public)
VALUES ('checkins', 'checkins', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for checkins bucket
CREATE POLICY "Users can upload own checkin photos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'checkins' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own checkin photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'checkins' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view checkin photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'checkins');

CREATE POLICY "Users can delete own checkin photos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'checkins' AND auth.uid()::text = (storage.foldername(name))[1]);