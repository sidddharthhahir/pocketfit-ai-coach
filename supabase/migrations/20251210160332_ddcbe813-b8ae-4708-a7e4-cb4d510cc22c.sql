-- Fix 1: Add WITH CHECK to profiles UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Fix 2: Add WITH CHECK to fitness_plans UPDATE policy
DROP POLICY IF EXISTS "Users can update own fitness plans" ON public.fitness_plans;
CREATE POLICY "Users can update own fitness plans" ON public.fitness_plans
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix 3: Add WITH CHECK to workout_logs UPDATE policy  
DROP POLICY IF EXISTS "Users can update own workout logs" ON public.workout_logs;
CREATE POLICY "Users can update own workout logs" ON public.workout_logs
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix 4: Add WITH CHECK to commitments UPDATE policy
DROP POLICY IF EXISTS "Users can update their own commitments" ON public.commitments;
CREATE POLICY "Users can update their own commitments" ON public.commitments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix 5: Add WITH CHECK to buddy_invites UPDATE policy
DROP POLICY IF EXISTS "Inviter can update their invites" ON public.buddy_invites;
CREATE POLICY "Inviter can update their invites" ON public.buddy_invites
  FOR UPDATE USING ((auth.uid() = inviter_id) OR (auth.uid() = invitee_id))
  WITH CHECK ((auth.uid() = inviter_id) OR (auth.uid() = invitee_id));

-- Fix 6: Update get_buddy_weekly_stats to validate buddy relationship
CREATE OR REPLACE FUNCTION public.get_buddy_weekly_stats(target_user_id uuid, week_start date)
 RETURNS TABLE(workouts_count integer, checkins_count integer, current_streak integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    week_end DATE;
    streak INTEGER := 0;
    check_date DATE;
    calling_user_id UUID;
BEGIN
    -- Get the calling user's ID
    calling_user_id := auth.uid();
    
    -- Security check: Validate caller is a buddy of target user OR is the target user
    IF calling_user_id != target_user_id THEN
        IF NOT EXISTS (
            SELECT 1 FROM buddies 
            WHERE (user_id = calling_user_id AND buddy_user_id = target_user_id)
               OR (user_id = target_user_id AND buddy_user_id = calling_user_id)
        ) THEN
            RAISE EXCEPTION 'Access denied: Not authorized to view stats for this user';
        END IF;
    END IF;

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
$function$;