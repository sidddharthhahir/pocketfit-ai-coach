-- Create countdowns table for workout scheduling
CREATE TABLE public.countdowns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'workout',
  title TEXT NOT NULL,
  target_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.countdowns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own countdowns" 
ON public.countdowns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own countdowns" 
ON public.countdowns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own countdowns" 
ON public.countdowns 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own countdowns" 
ON public.countdowns 
FOR DELETE 
USING (auth.uid() = user_id);