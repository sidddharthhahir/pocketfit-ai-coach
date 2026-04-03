
-- 1. Fix dream_logs UPDATE policy: add WITH CHECK clause
DROP POLICY IF EXISTS "Users can update their own dreams" ON public.dream_logs;
CREATE POLICY "Users can update their own dreams"
ON public.dream_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Fix buddy_invites: restrict all policies to authenticated role
DROP POLICY IF EXISTS "Users can view their own invites" ON public.buddy_invites;
CREATE POLICY "Users can view their own invites"
ON public.buddy_invites
FOR SELECT
TO authenticated
USING ((auth.uid() = inviter_id) OR (auth.uid() = invitee_id));

DROP POLICY IF EXISTS "Users can create invites" ON public.buddy_invites;
CREATE POLICY "Users can create invites"
ON public.buddy_invites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "Inviter can update their invites" ON public.buddy_invites;
CREATE POLICY "Inviter can update their invites"
ON public.buddy_invites
FOR UPDATE
TO authenticated
USING ((auth.uid() = inviter_id) OR (auth.uid() = invitee_id))
WITH CHECK ((auth.uid() = inviter_id) OR (auth.uid() = invitee_id));

DROP POLICY IF EXISTS "Inviter can delete their invites" ON public.buddy_invites;
CREATE POLICY "Inviter can delete their invites"
ON public.buddy_invites
FOR DELETE
TO authenticated
USING (auth.uid() = inviter_id);

-- 3. Fix dream_logs other policies to use authenticated role
DROP POLICY IF EXISTS "Users can view their own dreams" ON public.dream_logs;
CREATE POLICY "Users can view their own dreams"
ON public.dream_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own dreams" ON public.dream_logs;
CREATE POLICY "Users can create their own dreams"
ON public.dream_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own dreams" ON public.dream_logs;
CREATE POLICY "Users can delete their own dreams"
ON public.dream_logs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Fix storage policies: meal-photos bucket - change to authenticated role
DROP POLICY IF EXISTS "Users can view own meal photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload meal photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own meal photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view own meal photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload meal photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own meal photos" ON storage.objects;

CREATE POLICY "Authenticated users can view own meal photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload meal photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can delete own meal photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Fix checkins bucket: remove duplicate public INSERT policy
-- Drop all checkins INSERT policies and recreate just the authenticated one
DROP POLICY IF EXISTS "Users can upload checkin photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload checkin photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload checkin photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload checkin photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'checkins' AND auth.uid()::text = (storage.foldername(name))[1]);
