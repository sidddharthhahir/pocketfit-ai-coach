-- Add is_recurring column to countdowns table
ALTER TABLE public.countdowns 
ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT false;

-- Add icon column for emoji icons
ALTER TABLE public.countdowns 
ADD COLUMN icon TEXT DEFAULT '⏳';