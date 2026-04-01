
ALTER TABLE public.profiles 
ADD COLUMN activity_level text NOT NULL DEFAULT 'moderately_active',
ADD COLUMN workout_days_per_week integer NOT NULL DEFAULT 4;
