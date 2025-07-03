-- Fix user_subscriptions table to ensure all users have a subscription record
-- This migration ensures existing users without subscription records get a FREE plan

INSERT INTO public.user_subscriptions (user_id, plan_name, status)
SELECT 
  p.user_id,
  'FREE' as plan_name,
  'active' as status
FROM public.profiles p
LEFT JOIN public.user_subscriptions us ON p.user_id = us.user_id
WHERE us.user_id IS NULL;

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION public.initialize_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert subscription record
  INSERT INTO public.user_subscriptions (user_id, plan_name, status)
  VALUES (NEW.id, 'FREE', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert monthly usage record  
  INSERT INTO public.monthly_usage (user_id, month_year, fatture_count)
  VALUES (NEW.id, to_char(CURRENT_DATE, 'YYYY-MM'), 0)
  ON CONFLICT (user_id, month_year) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Add unique constraint to prevent duplicate user subscriptions if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_subscriptions_user_id_unique'
  ) THEN
    ALTER TABLE public.user_subscriptions 
    ADD CONSTRAINT user_subscriptions_user_id_unique UNIQUE (user_id);
  END IF;
END $$;

-- Add unique constraint to prevent duplicate monthly usage records if not exists  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'monthly_usage_user_month_unique'
  ) THEN
    ALTER TABLE public.monthly_usage 
    ADD CONSTRAINT monthly_usage_user_month_unique UNIQUE (user_id, month_year);
  END IF;
END $$;