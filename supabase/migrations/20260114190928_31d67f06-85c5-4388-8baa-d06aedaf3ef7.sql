-- Create future_messages table
CREATE TABLE public.future_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlock_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  sleep_quality_at_write TEXT,
  mood_at_write TEXT,
  reflection_response TEXT,
  tone TEXT
);

-- Enable Row Level Security
ALTER TABLE public.future_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own messages"
ON public.future_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
ON public.future_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
ON public.future_messages
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.future_messages
FOR DELETE
USING (auth.uid() = user_id);