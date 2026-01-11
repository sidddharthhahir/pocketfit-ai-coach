-- Create dream_logs table for storing dream journal entries
CREATE TABLE public.dream_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL,
  dream_content TEXT NOT NULL,
  dream_title TEXT,
  mood TEXT,
  themes TEXT[],
  lucidity_level INTEGER DEFAULT 0,
  ai_interpretation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dream_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own dreams" 
ON public.dream_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dreams" 
ON public.dream_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dreams" 
ON public.dream_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dreams" 
ON public.dream_logs 
FOR DELETE 
USING (auth.uid() = user_id);