-- Aggiungi campo prestazione_default_id alla tabella pazienti
ALTER TABLE public.pazienti 
ADD COLUMN prestazione_default_id UUID REFERENCES public.prestazioni(id);

-- Crea indice per migliorare le performance
CREATE INDEX idx_pazienti_prestazione_default ON public.pazienti(prestazione_default_id);