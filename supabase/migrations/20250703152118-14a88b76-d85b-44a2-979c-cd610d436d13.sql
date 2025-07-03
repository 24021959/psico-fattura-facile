-- Crea tabella per eventi del calendario
CREATE TABLE public.eventi_calendario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  titolo TEXT NOT NULL,
  data_evento DATE NOT NULL,
  orario TIME NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('appuntamento', 'scadenza', 'promemoria')),
  descrizione TEXT,
  paziente_id UUID,
  prestazione_id UUID,
  fattura_id UUID,
  stato TEXT NOT NULL DEFAULT 'programmato' CHECK (stato IN ('programmato', 'completato', 'scaduto', 'annullato')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.eventi_calendario ENABLE ROW LEVEL SECURITY;

-- Politiche RLS
CREATE POLICY "Users can view their own calendar events" 
ON public.eventi_calendario 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar events" 
ON public.eventi_calendario 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" 
ON public.eventi_calendario 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" 
ON public.eventi_calendario 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger per aggiornamento automatico updated_at
CREATE TRIGGER update_eventi_calendario_updated_at
BEFORE UPDATE ON public.eventi_calendario
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indici per migliorare le performance
CREATE INDEX idx_eventi_calendario_user_id ON public.eventi_calendario(user_id);
CREATE INDEX idx_eventi_calendario_data_evento ON public.eventi_calendario(data_evento);
CREATE INDEX idx_eventi_calendario_paziente_id ON public.eventi_calendario(paziente_id);
CREATE INDEX idx_eventi_calendario_fattura_id ON public.eventi_calendario(fattura_id);