-- Add UPDATE policy for meal_logs table
CREATE POLICY "Users can update own meal logs" ON public.meal_logs
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);