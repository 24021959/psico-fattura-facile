-- Crea tabella per le sedute del diario clinico
CREATE TABLE public.sedute_diario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paziente_id UUID NOT NULL REFERENCES public.pazienti(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_seduta DATE NOT NULL DEFAULT CURRENT_DATE,
  titolo TEXT NOT NULL,
  note_criptate TEXT, -- Note criptate lato client
  esercizio_assegnato TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita Row Level Security
ALTER TABLE public.sedute_diario ENABLE ROW LEVEL SECURITY;

-- Crea politiche RLS per massima sicurezza
CREATE POLICY "Users can view their own clinical sessions" 
ON public.sedute_diario 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clinical sessions" 
ON public.sedute_diario 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clinical sessions" 
ON public.sedute_diario 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clinical sessions" 
ON public.sedute_diario 
FOR DELETE 
USING (auth.uid() = user_id);

-- Indici per prestazioni
CREATE INDEX idx_sedute_diario_paziente_data ON public.sedute_diario(paziente_id, data_seduta DESC);
CREATE INDEX idx_sedute_diario_user_date ON public.sedute_diario(user_id, data_seduta DESC);

-- Trigger per aggiornamento automatico updated_at
CREATE TRIGGER update_sedute_diario_updated_at
BEFORE UPDATE ON public.sedute_diario
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();