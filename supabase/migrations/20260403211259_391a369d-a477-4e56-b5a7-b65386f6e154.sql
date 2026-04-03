
-- 1. Trigger to validate accepted invite before buddy INSERT
CREATE OR REPLACE FUNCTION public.validate_buddy_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM buddy_invites
    WHERE status = 'accepted'
      AND (
        (inviter_id = NEW.user_id AND invitee_id = NEW.buddy_user_id)
        OR (inviter_id = NEW.buddy_user_id AND invitee_id = NEW.user_id)
      )
  ) THEN
    RAISE EXCEPTION 'No accepted invite exists between these users';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_buddy_invite ON public.buddies;
CREATE TRIGGER enforce_buddy_invite
BEFORE INSERT ON public.buddies
FOR EACH ROW
EXECUTE FUNCTION public.validate_buddy_insert();

-- 2. Trigger to prevent tampering with immutable buddy_invites fields
CREATE OR REPLACE FUNCTION public.protect_invite_immutable_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.inviter_id IS DISTINCT FROM OLD.inviter_id THEN
    RAISE EXCEPTION 'Cannot modify inviter_id';
  END IF;
  IF NEW.invite_code IS DISTINCT FROM OLD.invite_code THEN
    RAISE EXCEPTION 'Cannot modify invite_code';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_invite_fields ON public.buddy_invites;
CREATE TRIGGER protect_invite_fields
BEFORE UPDATE ON public.buddy_invites
FOR EACH ROW
EXECUTE FUNCTION public.protect_invite_immutable_fields();

-- 3. Replace broad UPDATE policy with scoped ones
DROP POLICY IF EXISTS "Inviter can update their invites" ON public.buddy_invites;

CREATE POLICY "Inviter can update own invites"
ON public.buddy_invites
FOR UPDATE
TO authenticated
USING (auth.uid() = inviter_id)
WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Invitee can accept or decline invites"
ON public.buddy_invites
FOR UPDATE
TO authenticated
USING (auth.uid() = invitee_id)
WITH CHECK (auth.uid() = invitee_id);

-- 4. Add missing UPDATE policy for checkins storage
CREATE POLICY "Authenticated users can update checkin photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'checkins' AND auth.uid()::text = (storage.foldername(name))[1]);
