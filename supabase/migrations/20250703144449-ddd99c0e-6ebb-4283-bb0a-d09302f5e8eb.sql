-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL,
  stripe_price_id TEXT,
  max_fatture_mensili INTEGER,
  diario_clinico_enabled BOOLEAN DEFAULT false,
  backup_enabled BOOLEAN DEFAULT false,
  assistenza_prioritaria BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active', -- active, canceled, past_due, incomplete
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  fatture_count_mensile INTEGER DEFAULT 0,
  reset_fatture_data DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create monthly usage tracking
CREATE TABLE public.monthly_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- formato "2025-01"
  fatture_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (read-only for all authenticated users)
CREATE POLICY "subscription_plans_select" ON public.subscription_plans
  FOR SELECT USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "user_subscriptions_select" ON public.user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_subscriptions_update" ON public.user_subscriptions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_subscriptions_insert" ON public.user_subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for monthly_usage
CREATE POLICY "monthly_usage_select" ON public.monthly_usage
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "monthly_usage_update" ON public.monthly_usage
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "monthly_usage_insert" ON public.monthly_usage
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, max_fatture_mensili, diario_clinico_enabled, backup_enabled, assistenza_prioritaria) VALUES
('FREE', 0.00, 5, false, false, false),
('STANDARD', 4.99, NULL, false, true, false),
('PRO', 9.90, NULL, true, true, true);

-- Create function to initialize user subscription on signup
CREATE OR REPLACE FUNCTION public.initialize_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan_name, status)
  VALUES (NEW.id, 'FREE', 'active');
  
  INSERT INTO public.monthly_usage (user_id, month_year, fatture_count)
  VALUES (NEW.id, to_char(CURRENT_DATE, 'YYYY-MM'), 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize subscription on user creation
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_subscription();

-- Create function to update monthly usage
CREATE OR REPLACE FUNCTION public.increment_monthly_usage(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_month TEXT := to_char(CURRENT_DATE, 'YYYY-MM');
BEGIN
  INSERT INTO public.monthly_usage (user_id, month_year, fatture_count)
  VALUES (p_user_id, current_month, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET fatture_count = monthly_usage.fatture_count + 1;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();