-- Create notifications table for tracking all notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'system', 'sms')),
  recipient TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  template_used TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read', 'unread')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" 
ON public.notifications 
FOR ALL 
USING (is_admin_user(auth.uid()));

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their notification status" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT NOT NULL,
  description TEXT,
  variables JSONB, -- Store required variables for the template
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for email templates
CREATE POLICY "Admins can manage email templates" 
ON public.email_templates 
FOR ALL 
USING (is_admin_user(auth.uid()));

-- Create notification settings table for user preferences
CREATE TABLE public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_invoices BOOLEAN NOT NULL DEFAULT true,
  email_reminders BOOLEAN NOT NULL DEFAULT true,
  email_marketing BOOLEAN NOT NULL DEFAULT false,
  email_system_updates BOOLEAN NOT NULL DEFAULT true,
  sms_reminders BOOLEAN NOT NULL DEFAULT false,
  system_notifications BOOLEAN NOT NULL DEFAULT true,
  reminder_days_before INTEGER NOT NULL DEFAULT 7, -- Days before due date to send reminder
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notification settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for notification settings
CREATE POLICY "Users can manage their own notification settings" 
ON public.notification_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_type_status ON public.notifications(type, status);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_notification_settings_user_id ON public.notification_settings(user_id);

-- Create trigger for updated_at columns
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates
INSERT INTO public.email_templates (name, subject_template, html_template, text_template, description, variables) VALUES
('invoice_created', 
 'Nuova Fattura #{{invoiceNumber}} - {{clinicName}}',
 '<h2>Nuova Fattura Disponibile</h2><p>Gentile {{patientName}}, è stata emessa una nuova fattura...</p>',
 'Nuova Fattura Disponibile\n\nGentile {{patientName}}, è stata emessa una nuova fattura...',
 'Template per notificare la creazione di una nuova fattura',
 '["invoiceNumber", "clinicName", "patientName", "amount", "dueDate"]'::jsonb),

('payment_reminder',
 'Promemoria Pagamento - Fattura #{{invoiceNumber}}',
 '<h2>Promemoria Pagamento</h2><p>La fattura #{{invoiceNumber}} è in scadenza...</p>',
 'Promemoria Pagamento\n\nLa fattura #{{invoiceNumber}} è in scadenza...',
 'Template per promemoria di pagamento',
 '["invoiceNumber", "patientName", "amount", "dueDate"]'::jsonb),

('subscription_expiring',
 'Il tuo abbonamento sta per scadere - Psico Fattura Facile',
 '<h2>Abbonamento in Scadenza</h2><p>Il tuo abbonamento {{planName}} scadrà il {{expiryDate}}...</p>',
 'Abbonamento in Scadenza\n\nIl tuo abbonamento {{planName}} scadrà il {{expiryDate}}...',
 'Template per notificare la scadenza dell abbonamento',
 '["userName", "planName", "expiryDate", "renewUrl"]'::jsonb);