-- Creare tabelle per l'admin panel

-- Tabella per gli admin e i loro ruoli
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'support', 'marketing')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Tabella per il log delle attività admin (audit trail)
CREATE TABLE public.admin_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT, -- 'user', 'subscription', 'plan', etc.
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per le impostazioni generali dell'app
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabella per i ticket di supporto
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Tabella per le risposte ai ticket
CREATE TABLE public.support_ticket_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false, -- true per note interne admin
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabella per i coupon e codici sconto
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount')),
  value NUMERIC NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_plans TEXT[], -- array dei nomi dei piani
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabella per tenere traccia dell'uso dei coupon
CREATE TABLE public.discount_code_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_code_id UUID REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stripe_session_id TEXT
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_code_usage ENABLE ROW LEVEL SECURITY;

-- Funzione per verificare se un utente è admin
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE admin_users.user_id = is_admin_user.user_id 
    AND is_active = true
  );
$$;

-- Funzione per ottenere il ruolo admin di un utente
CREATE OR REPLACE FUNCTION public.get_admin_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.admin_users 
  WHERE admin_users.user_id = get_admin_role.user_id 
  AND is_active = true
  LIMIT 1;
$$;

-- Policies per admin_users
CREATE POLICY "Admins can view admin users" ON public.admin_users
  FOR SELECT USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Super admins can manage admin users" ON public.admin_users
  FOR ALL USING (public.get_admin_role(auth.uid()) = 'super_admin');

-- Policies per admin_activity_log
CREATE POLICY "Admins can view activity log" ON public.admin_activity_log
  FOR SELECT USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert activity log" ON public.admin_activity_log
  FOR INSERT WITH CHECK (public.is_admin_user(auth.uid()));

-- Policies per app_settings
CREATE POLICY "Admins can view app settings" ON public.app_settings
  FOR SELECT USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can manage app settings" ON public.app_settings
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- Policies per support_tickets
CREATE POLICY "Users can view their own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin_user(auth.uid()));

CREATE POLICY "Users can create tickets" ON public.support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- Policies per support_ticket_responses
CREATE POLICY "Users and admins can view ticket responses" ON public.support_ticket_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id 
      AND (user_id = auth.uid() OR public.is_admin_user(auth.uid()))
    )
    AND (NOT is_internal OR public.is_admin_user(auth.uid()))
  );

CREATE POLICY "Users and admins can add responses" ON public.support_ticket_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id 
      AND (user_id = auth.uid() OR public.is_admin_user(auth.uid()))
    )
  );

-- Policies per discount_codes
CREATE POLICY "Admins can manage discount codes" ON public.discount_codes
  FOR ALL USING (public.is_admin_user(auth.uid()));

-- Policies per discount_code_usage
CREATE POLICY "Admins can view discount usage" ON public.discount_code_usage
  FOR SELECT USING (public.is_admin_user(auth.uid()));

CREATE POLICY "System can track discount usage" ON public.discount_code_usage
  FOR INSERT WITH CHECK (true);

-- Inserire alcune impostazioni di default
INSERT INTO public.app_settings (key, value, description) VALUES
('homepage_title', '"Gestisci il tuo studio con semplicità"', 'Titolo principale della homepage'),
('homepage_subtitle', '"Fatturazione, pazienti e agenda in un solo posto"', 'Sottotitolo della homepage'),
('support_email', '"supporto@psico-fattura-facile.com"', 'Email di supporto'),
('privacy_policy_url', '""', 'URL della privacy policy'),
('terms_of_service_url', '""', 'URL dei termini di servizio');

-- Aggiornare la funzione di trigger per updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();