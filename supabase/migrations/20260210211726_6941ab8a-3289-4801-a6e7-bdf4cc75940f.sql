DROP POLICY IF EXISTS "Users can update their own vision board items" ON public.vision_board_items;
CREATE POLICY "Users can update their own vision board items"
ON public.vision_board_items
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);