import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface ProfileFormData {
  nome: string;
  cognome: string;
  email: string;
  titolo?: string;
  codice_fiscale?: string;
  partita_iva?: string;
  telefono?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  numero_iscrizione_albo?: string;
  logo_url?: string;
  regime_fiscale?: 'RF01' | 'RF19';
  pec?: string;
  iban?: string;
  percentuale_enpap?: number;
  enpap_a_paziente?: boolean;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, this is normal for new users
          setProfile(null);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nel caricamento del profilo"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: ProfileFormData) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          nome: profileData.nome,
          cognome: profileData.cognome,
          email: profileData.email,
          titolo: profileData.titolo || null,
          codice_fiscale: profileData.codice_fiscale || null,
          partita_iva: profileData.partita_iva || null,
          telefono: profileData.telefono || null,
          indirizzo: profileData.indirizzo || null,
          citta: profileData.citta || null,
          cap: profileData.cap || null,
          numero_iscrizione_albo: profileData.numero_iscrizione_albo || null,
          logo_url: profileData.logo_url || null,
          regime_fiscale: profileData.regime_fiscale || 'RF19',
          pec: profileData.pec || null,
          iban: profileData.iban || null,
          percentuale_enpap: profileData.percentuale_enpap || 2.00,
          enpap_a_paziente: profileData.enpap_a_paziente ?? true,
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      toast({
        title: "Successo",
        description: "Profilo aggiornato correttamente"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'aggiornamento del profilo"
      });
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refreshProfile: fetchProfile
  };
}