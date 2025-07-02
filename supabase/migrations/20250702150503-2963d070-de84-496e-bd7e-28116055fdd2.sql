-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  email TEXT NOT NULL,
  partita_iva TEXT,
  codice_fiscale TEXT,
  indirizzo TEXT,
  citta TEXT,
  cap TEXT,
  telefono TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.pazienti (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  codice_fiscale TEXT,
  email TEXT,
  telefono TEXT,
  indirizzo TEXT,
  citta TEXT,
  cap TEXT,
  data_nascita DATE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.prestazioni (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descrizione TEXT,
  prezzo_unitario DECIMAL(10,2) NOT NULL,
  durata_minuti INTEGER DEFAULT 60,
  attiva BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.fatture (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paziente_id UUID NOT NULL REFERENCES public.pazienti(id) ON DELETE CASCADE,
  numero_fattura TEXT NOT NULL,
  data_fattura DATE NOT NULL DEFAULT CURRENT_DATE,
  data_scadenza DATE,
  stato TEXT NOT NULL DEFAULT 'bozza' CHECK (stato IN ('bozza', 'inviata', 'pagata', 'scaduta')),
  subtotale DECIMAL(10,2) NOT NULL DEFAULT 0,
  iva_percentuale DECIMAL(5,2) NOT NULL DEFAULT 22.00,
  iva_importo DECIMAL(10,2) NOT NULL DEFAULT 0,
  totale DECIMAL(10,2) NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, numero_fattura)
);

-- Create invoice items table
CREATE TABLE public.righe_fattura (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fattura_id UUID NOT NULL REFERENCES public.fatture(id) ON DELETE CASCADE,
  prestazione_id UUID REFERENCES public.prestazioni(id),
  descrizione TEXT NOT NULL,
  quantita INTEGER NOT NULL DEFAULT 1,
  prezzo_unitario DECIMAL(10,2) NOT NULL,
  totale DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pazienti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prestazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.righe_fattura ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for pazienti
CREATE POLICY "Users can view their own patients" ON public.pazienti
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own patients" ON public.pazienti
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patients" ON public.pazienti
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own patients" ON public.pazienti
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for prestazioni
CREATE POLICY "Users can view their own services" ON public.prestazioni
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own services" ON public.prestazioni
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own services" ON public.prestazioni
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own services" ON public.prestazioni
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for fatture
CREATE POLICY "Users can view their own invoices" ON public.fatture
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own invoices" ON public.fatture
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invoices" ON public.fatture
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own invoices" ON public.fatture
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for righe_fattura
CREATE POLICY "Users can view invoice items through invoices" ON public.righe_fattura
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.fatture 
      WHERE fatture.id = righe_fattura.fattura_id 
      AND fatture.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create invoice items through invoices" ON public.righe_fattura
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.fatture 
      WHERE fatture.id = righe_fattura.fattura_id 
      AND fatture.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update invoice items through invoices" ON public.righe_fattura
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.fatture 
      WHERE fatture.id = righe_fattura.fattura_id 
      AND fatture.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete invoice items through invoices" ON public.righe_fattura
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.fatture 
      WHERE fatture.id = righe_fattura.fattura_id 
      AND fatture.user_id = auth.uid()
    )
  );

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, cognome, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', ''),
    COALESCE(new.raw_user_meta_data->>'cognome', ''),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pazienti_updated_at
  BEFORE UPDATE ON public.pazienti
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prestazioni_updated_at
  BEFORE UPDATE ON public.prestazioni
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fatture_updated_at
  BEFORE UPDATE ON public.fatture
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();