-- Aggiungere campi mancanti alla tabella profiles per la gestione del regime fiscale
ALTER TABLE public.profiles 
ADD COLUMN regime_fiscale TEXT DEFAULT 'RF19' CHECK (regime_fiscale IN ('RF01', 'RF19')),
ADD COLUMN pec TEXT,
ADD COLUMN iban TEXT,
ADD COLUMN percentuale_enpap NUMERIC DEFAULT 2.00,
ADD COLUMN enpap_a_paziente BOOLEAN DEFAULT true;

-- Aggiornare il commento della tabella
COMMENT ON COLUMN public.profiles.regime_fiscale IS 'RF01: Regime ordinario, RF19: Regime forfettario';
COMMENT ON COLUMN public.profiles.pec IS 'Email certificata PEC del professionista';
COMMENT ON COLUMN public.profiles.iban IS 'Coordinate bancarie IBAN';
COMMENT ON COLUMN public.profiles.percentuale_enpap IS 'Percentuale ENPAP da applicare (default 2%)';
COMMENT ON COLUMN public.profiles.enpap_a_paziente IS 'Se true, ENPAP addebitata al paziente, altrimenti a carico del professionista';