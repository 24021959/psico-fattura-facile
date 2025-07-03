import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type SedutaDiario = Tables<'sedute_diario'>;
type Paziente = Tables<'pazienti'>;

interface SedutaDettagliata extends SedutaDiario {
  paziente?: {
    id: string;
    nome: string;
    cognome: string;
  };
  note_decriptate?: string;
}

interface SedutaFormData {
  paziente_id: string;
  titolo: string;
  note: string;
  esercizio_assegnato?: string;
  data_seduta?: string;
}

// Funzioni di crittografia semplice (per demo - in produzione usare librerie dedicate)
const encrypt = (text: string): string => {
  try {
    return btoa(encodeURIComponent(text));
  } catch {
    return text;
  }
};

const decrypt = (encryptedText: string): string => {
  try {
    return decodeURIComponent(atob(encryptedText));
  } catch {
    return encryptedText;
  }
};

export function useDiarioClinico() {
  const [sedute, setSedute] = useState<SedutaDettagliata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Non utilizzato più
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSedute = async (pazienteId?: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('sedute_diario')
        .select(`
          *,
          paziente:pazienti!sedute_diario_paziente_id_fkey(id, nome, cognome)
        `)
        .eq('user_id', user.id)
        .order('data_seduta', { ascending: false });

      if (pazienteId) {
        query = query.eq('paziente_id', pazienteId);
      }


      const { data, error } = await query;

      if (error) throw error;
      
      // Decripta le note per la visualizzazione
      const seduteDecriptate = data?.map(seduta => ({
        ...seduta,
        note_decriptate: seduta.note_criptate ? decrypt(seduta.note_criptate) : ''
      })) || [];

      setSedute(seduteDecriptate as SedutaDettagliata[]);
    } catch (error) {
      console.error('Error fetching sedute:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nel caricamento del diario clinico"
      });
    } finally {
      setLoading(false);
    }
  };

  const createSeduta = async (sedutaData: SedutaFormData) => {
    if (!user) return null;

    try {
      // Cripta le note prima del salvataggio
      const noteCriptate = sedutaData.note ? encrypt(sedutaData.note) : null;

      const { data, error } = await supabase
        .from('sedute_diario')
        .insert({
          user_id: user.id,
          paziente_id: sedutaData.paziente_id,
          data_seduta: sedutaData.data_seduta || new Date().toISOString().split('T')[0],
          titolo: sedutaData.titolo,
          note_criptate: noteCriptate,
          esercizio_assegnato: sedutaData.esercizio_assegnato || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Seduta aggiunta al diario clinico"
      });

      await fetchSedute();
      return data;
    } catch (error) {
      console.error('createSeduta: Error:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: `Errore nella creazione della seduta: ${error.message || 'Errore sconosciuto'}`
      });
      return null;
    }
  };

  const updateSeduta = async (id: string, updates: Partial<SedutaFormData>) => {
    if (!user) return null;

    try {
      const updateData: any = { ...updates };
      
      // Cripta le note se presenti
      if (updates.note !== undefined) {
        updateData.note_criptate = updates.note ? encrypt(updates.note) : null;
        delete updateData.note;
      }

      const { data, error } = await supabase
        .from('sedute_diario')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Seduta aggiornata"
      });

      await fetchSedute();
      return data;
    } catch (error) {
      console.error('updateSeduta: Error:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'aggiornamento della seduta"
      });
      return null;
    }
  };

  const deleteSeduta = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('sedute_diario')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Seduta eliminata dal diario"
      });

      setSedute(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (error) {
      console.error('deleteSeduta: Error:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'eliminazione della seduta"
      });
      return false;
    }
  };

  const getSeduteByPaziente = (pazienteId: string) => {
    return sedute.filter(s => s.paziente_id === pazienteId);
  };

  useEffect(() => {
    if (user) {
      fetchSedute();
    }
  }, [user, searchTerm]);

  return {
    sedute,
    loading,
    searchTerm,
    setSearchTerm,
    createSeduta,
    updateSeduta,
    deleteSeduta,
    fetchSedute,
    getSeduteByPaziente,
    refreshSedute: fetchSedute
  };
}