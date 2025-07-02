import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Prestazione = Tables<'prestazioni'>;
type PrestazioneInsert = Omit<Prestazione, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
type PrestazioneUpdate = Partial<PrestazioneInsert>;

export function usePrestazioni() {
  const [prestazioni, setPrestazioni] = useState<Prestazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPrestazioni = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let query = supabase
        .from('prestazioni')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,descrizione.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPrestazioni(data || []);
    } catch (error) {
      console.error('Error fetching prestazioni:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nel caricamento delle prestazioni"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPrestazione = async (prestazioneData: PrestazioneInsert) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('prestazioni')
        .insert({
          ...prestazioneData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setPrestazioni(prev => [data, ...prev]);
      toast({
        title: "Successo",
        description: "Prestazione creata correttamente"
      });
      
      return data;
    } catch (error) {
      console.error('Error creating prestazione:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nella creazione della prestazione"
      });
      return null;
    }
  };

  const updatePrestazione = async (id: string, prestazioneData: PrestazioneUpdate) => {
    try {
      const { data, error } = await supabase
        .from('prestazioni')
        .update(prestazioneData)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      setPrestazioni(prev => 
        prev.map(p => p.id === id ? data : p)
      );
      
      toast({
        title: "Successo",
        description: "Prestazione aggiornata correttamente"
      });
      
      return data;
    } catch (error) {
      console.error('Error updating prestazione:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'aggiornamento della prestazione"
      });
      return null;
    }
  };

  const deletePrestazione = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prestazioni')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setPrestazioni(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Successo",
        description: "Prestazione eliminata correttamente"
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting prestazione:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'eliminazione della prestazione"
      });
      return false;
    }
  };

  const toggleAttiva = async (id: string, attiva: boolean) => {
    try {
      const { data, error } = await supabase
        .from('prestazioni')
        .update({ attiva })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      setPrestazioni(prev => 
        prev.map(p => p.id === id ? data : p)
      );
      
      toast({
        title: "Successo",
        description: `Prestazione ${attiva ? 'attivata' : 'disattivata'} correttamente`
      });
      
      return data;
    } catch (error) {
      console.error('Error toggling prestazione:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'aggiornamento dello stato"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchPrestazioni();
  }, [user, searchTerm]);

  // Statistiche derivate
  const stats = {
    total: prestazioni.length,
    attive: prestazioni.filter(p => p.attiva).length,
    prezzoMedio: prestazioni.length > 0 
      ? prestazioni.reduce((sum, p) => sum + Number(p.prezzo_unitario), 0) / prestazioni.length 
      : 0,
    durataMedio: prestazioni.length > 0 
      ? prestazioni.reduce((sum, p) => sum + (p.durata_minuti || 0), 0) / prestazioni.length 
      : 0
  };

  return {
    prestazioni,
    loading,
    searchTerm,
    setSearchTerm,
    createPrestazione,
    updatePrestazione,
    deletePrestazione,
    toggleAttiva,
    refreshPrestazioni: fetchPrestazioni,
    stats
  };
}