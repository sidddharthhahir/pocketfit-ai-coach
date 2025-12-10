-- Add UPDATE policy for gym_checkins table
CREATE POLICY "Users can update own checkins"
ON public.gym_checkins
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);