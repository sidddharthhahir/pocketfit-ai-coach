-- Create enum for commitment types
CREATE TYPE public.commitment_type AS ENUM ('workouts_per_week', 'checkins_per_week', 'meals_logged_per_week');

-- Create enum for invite status
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Create buddy_invites table for managing invite codes
CREATE TABLE public.buddy_invites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    inviter_id UUID NOT NULL,
    invite_code TEXT NOT NULL UNIQUE,
    status invite_status NOT NULL DEFAULT 'pending',
    invitee_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- Create buddies table for accountability pairs
CREATE TABLE public.buddies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    buddy_user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, buddy_user_id)
);

-- Create commitments table for commitment contracts
CREATE TABLE public.commitments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    type commitment_type NOT NULL,
    target_value INTEGER NOT NULL,
    duration_weeks INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.buddy_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buddies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commitments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buddy_invites
CREATE POLICY "Users can view their own invites"
ON public.buddy_invites
FOR SELECT
USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Users can create invites"
ON public.buddy_invites
FOR INSERT
WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Inviter can update their invites"
ON public.buddy_invites
FOR UPDATE
USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

CREATE POLICY "Inviter can delete their invites"
ON public.buddy_invites
FOR DELETE
USING (auth.uid() = inviter_id);

-- RLS Policies for buddies
CREATE POLICY "Users can view their buddy relationships"
ON public.buddies
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = buddy_user_id);

CREATE POLICY "Users can create buddy relationships"
ON public.buddies
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their buddy relationships"
ON public.buddies
FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = buddy_user_id);

-- RLS Policies for commitments
CREATE POLICY "Users can view their own commitments"
ON public.commitments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own commitments"
ON public.commitments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own commitments"
ON public.commitments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commitments"
ON public.commitments
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to generate unique invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 8-character alphanumeric code
        code := upper(substr(md5(random()::text), 1, 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM buddy_invites WHERE invite_code = code) INTO code_exists;
        
        IF NOT code_exists THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$;

-- Create function to get buddy stats (for accountability feature)
CREATE OR REPLACE FUNCTION public.get_buddy_weekly_stats(target_user_id UUID, week_start DATE)
RETURNS TABLE (
    workouts_count INTEGER,
    checkins_count INTEGER,
    current_streak INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    week_end DATE;
    streak INTEGER := 0;
    check_date DATE;
BEGIN
    week_end := week_start + interval '6 days';
    
    -- Count workouts for the week
    SELECT COUNT(*)::INTEGER INTO workouts_count
    FROM workout_logs
    WHERE user_id = target_user_id
    AND workout_date >= week_start
    AND workout_date <= week_end;
    
    -- Count check-ins for the week
    SELECT COUNT(*)::INTEGER INTO checkins_count
    FROM gym_checkins
    WHERE user_id = target_user_id
    AND date >= week_start
    AND date <= week_end;
    
    -- Calculate current streak (consecutive days with check-ins)
    check_date := CURRENT_DATE;
    LOOP
        IF EXISTS(SELECT 1 FROM gym_checkins WHERE user_id = target_user_id AND date = check_date AND ai_is_gym IS NOT FALSE) THEN
            streak := streak + 1;
            check_date := check_date - 1;
        ELSE
            EXIT;
        END IF;
    END LOOP;
    
    current_streak := streak;
    
    RETURN NEXT;
END;
$$;