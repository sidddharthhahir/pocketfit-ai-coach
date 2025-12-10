-- Add UPDATE and DELETE policies for weekly_insights table
CREATE POLICY "Users can update own weekly insights"
ON public.weekly_insights
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weekly insights"
ON public.weekly_insights
FOR DELETE
USING (auth.uid() = user_id);

-- Add UPDATE policy for buddies table (in case users need to modify relationships)
CREATE POLICY "Users can update their buddy relationships"
ON public.buddies
FOR UPDATE
USING ((auth.uid() = user_id) OR (auth.uid() = buddy_user_id))
WITH CHECK ((auth.uid() = user_id) OR (auth.uid() = buddy_user_id));