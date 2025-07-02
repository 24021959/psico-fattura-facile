import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Paziente = Tables<'pazienti'>;
type PazienteInsert = Omit<Paziente, 'id' | 'user_id' | 'created_at' | 'updated_at'> & {
  data_nascita?: string | null;
};
type PazienteUpdate = Partial<PazienteInsert>;

export function usePazienti() {
  const [pazienti, setPazienti] = useState<Paziente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPazienti = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('pazienti')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,cognome.ilike.%${searchTerm}%,codice_fiscale.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPazienti(data || []);
    } catch (error) {
      console.error('Error fetching pazienti:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nel caricamento dei pazienti"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPaziente = async (pazienteData: PazienteInsert) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('pazienti')
        .insert({
          ...pazienteData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setPazienti(prev => [data, ...prev]);
      toast({
        title: "Successo",
        description: "Paziente creato correttamente"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating paziente:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nella creazione del paziente"
      });
      return null;
    }
  };

  const updatePaziente = async (id: string, pazienteData: PazienteUpdate) => {
    try {
      const { data, error } = await supabase
        .from('pazienti')
        .update(pazienteData)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      setPazienti(prev => 
        prev.map(p => p.id === id ? data : p)
      );
      
      toast({
        title: "Successo",
        description: "Paziente aggiornato correttamente"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating paziente:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'aggiornamento del paziente"
      });
      return null;
    }
  };

  const deletePaziente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pazienti')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setPazienti(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Successo",
        description: "Paziente eliminato correttamente"
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting paziente:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'eliminazione del paziente"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPazienti();
  }, [user, searchTerm]);

  return {
    pazienti,
    loading,
    searchTerm,
    setSearchTerm,
    createPaziente,
    updatePaziente,
    deletePaziente,
    refreshPazienti: fetchPazienti
  };
}