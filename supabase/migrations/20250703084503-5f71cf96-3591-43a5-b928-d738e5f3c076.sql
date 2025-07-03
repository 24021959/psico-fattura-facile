-- Crea bucket per i loghi degli utenti
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-logos', 'user-logos', true);

-- Crea policies per il bucket user-logos
CREATE POLICY "Users can view all logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user-logos');

CREATE POLICY "Users can upload their own logo" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'user-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own logo" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'user-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own logo" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'user-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);