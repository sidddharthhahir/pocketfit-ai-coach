
-- Table to control exclusive access to the Gita feature
CREATE TABLE public.gita_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  granted_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gita_access ENABLE ROW LEVEL SECURITY;

-- Users can check their own access
CREATE POLICY "Users can check own gita access"
  ON public.gita_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only users who already have access can grant access to others
CREATE POLICY "Gita members can grant access"
  ON public.gita_access FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gita_access WHERE user_id = auth.uid()
    )
  );

-- Security definer function to check access without recursion issues
CREATE OR REPLACE FUNCTION public.has_gita_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gita_access WHERE user_id = _user_id
  )
$$;
