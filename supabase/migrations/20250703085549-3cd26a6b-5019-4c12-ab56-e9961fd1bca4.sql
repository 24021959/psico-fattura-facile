-- Add titolo field to profiles table for professional title
ALTER TABLE public.profiles 
ADD COLUMN titolo TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.titolo IS 'Professional title: Dott., Dott.ssa, or custom title';