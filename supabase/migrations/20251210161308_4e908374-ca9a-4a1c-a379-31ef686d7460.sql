-- Create a SECURITY DEFINER function to securely look up pending buddy invites by code
CREATE OR REPLACE FUNCTION public.lookup_buddy_invite(p_invite_code text)
RETURNS TABLE (id uuid, inviter_id uuid, expires_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, inviter_id, expires_at
  FROM buddy_invites
  WHERE invite_code = upper(p_invite_code)
    AND status = 'pending'
    AND expires_at > now()
$$;