import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type EventoCalendario = Tables<'eventi_calendario'>;

interface EventoFormData {
  titolo: string;
  data_evento: string;
  orario: string;
  tipo: 'appuntamento' | 'scadenza' | 'promemoria';
  descrizione?: string;
  paziente_id?: string;
  prestazione_id?: string;
  fattura_id?: string;
}

export function useEventiCalendario() {
  const [eventi, setEventi] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchEventi = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('eventi_calendario')
        .select('*')
        .eq('user_id', user.id)
        .order('data_evento', { ascending: true });

      if (error) throw error;
      
      setEventi(data || []);
    } catch (error) {
      console.error('Error fetching eventi:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nel caricamento degli eventi"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvento = async (eventoData: EventoFormData) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('eventi_calendario')
        .insert({
          user_id: user.id,
          titolo: eventoData.titolo,
          data_evento: eventoData.data_evento,
          orario: eventoData.orario,
          tipo: eventoData.tipo,
          descrizione: eventoData.descrizione || null,
          paziente_id: eventoData.paziente_id || null,
          prestazione_id: eventoData.prestazione_id || null,
          fattura_id: eventoData.fattura_id || null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Evento aggiunto al calendario"
      });

      await fetchEventi();
      return data;
    } catch (error) {
      console.error('createEvento: Error:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nella creazione dell'evento"
      });
      return null;
    }
  };

  const updateEvento = async (id: string, updates: Partial<EventoFormData>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('eventi_calendario')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Evento aggiornato"
      });

      await fetchEventi();
      return data;
    } catch (error) {
      console.error('updateEvento: Error:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'aggiornamento dell'evento"
      });
      return null;
    }
  };

  const deleteEvento = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('eventi_calendario')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Evento eliminato dal calendario"
      });

      setEventi(prev => prev.filter(e => e.id !== id));
      return true;
    } catch (error) {
      console.error('deleteEvento: Error:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'eliminazione dell'evento"
      });
      return false;
    }
  };

  const updateStatoEvento = async (id: string, stato: 'programmato' | 'completato' | 'scaduto' | 'annullato') => {
    return updateEvento(id, { stato } as any);
  };

  useEffect(() => {
    if (user) {
      fetchEventi();
    }
  }, [user]);

  return {
    eventi,
    loading,
    createEvento,
    updateEvento,
    deleteEvento,
    updateStatoEvento,
    refreshEventi: fetchEventi
  };
}