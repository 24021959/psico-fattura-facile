-- Aggiungi campi mancanti alla tabella profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS numero_iscrizione_albo TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;