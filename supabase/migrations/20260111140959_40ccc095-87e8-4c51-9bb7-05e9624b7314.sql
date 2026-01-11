-- Create vision board table for manifestation/goals
CREATE TABLE public.vision_board_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'fitness',
  is_achieved BOOLEAN NOT NULL DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vision_board_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own vision board items"
ON public.vision_board_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vision board items"
ON public.vision_board_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vision board items"
ON public.vision_board_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vision board items"
ON public.vision_board_items FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_vision_board_items_updated_at
BEFORE UPDATE ON public.vision_board_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();