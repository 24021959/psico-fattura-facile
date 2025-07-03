import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { calcolaComponentiFiscali, type FiscalData } from '@/utils/fiscalUtils';
import type { Tables } from '@/integrations/supabase/types';

type Fattura = Tables<'fatture'>;
type RigaFattura = Tables<'righe_fattura'>;
type Paziente = Tables<'pazienti'>;
type Prestazione = Tables<'prestazioni'>;

interface FatturaDettagliata extends Fattura {
  paziente?: Paziente | any;
  righe_fattura?: (RigaFattura & { prestazione?: Prestazione | any })[];
}

interface FatturaFormData {
  paziente_id: string;
  prestazione_id: string;
  data_prestazione: string;
  metodo_pagamento: string;
  note?: string;
}

export function useFatture() {
  const [fatture, setFatture] = useState<FatturaDettagliata[]>([]);
  const [pazienti, setPazienti] = useState<Paziente[]>([]);
  const [prestazioni, setPrestazioni] = useState<Prestazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  // Genera numero fattura progressivo
  const generateNumeroFattura = async (): Promise<string> => {
    const currentYear = new Date().getFullYear();
    
    const { data: lastFattura } = await supabase
      .from('fatture')
      .select('numero_fattura')
      .eq('user_id', user?.id)
      .like('numero_fattura', `${currentYear}-%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (lastFattura && lastFattura.length > 0) {
      const lastNumber = parseInt(lastFattura[0].numero_fattura.split('-')[1]);
      return `${currentYear}-${String(lastNumber + 1).padStart(3, '0')}`;
    }
    
    return `${currentYear}-001`;
  };

  const fetchFatture = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('fatture')
        .select(`
          *,
          paziente:pazienti!fatture_paziente_id_fkey(id, nome, cognome, codice_fiscale),
          righe_fattura(
            *,
            prestazione:prestazioni!righe_fattura_prestazione_id_fkey(nome, prezzo_unitario)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        // Cerca per numero fattura o paziente
        const { data: pazientiMatch } = await supabase
          .from('pazienti')
          .select('id')
          .eq('user_id', user.id)
          .or(`nome.ilike.%${searchTerm}%,cognome.ilike.%${searchTerm}%`);
        
        const pazientiIds = pazientiMatch?.map(p => p.id) || [];
        
        if (pazientiIds.length > 0) {
          query = query.or(`numero_fattura.ilike.%${searchTerm}%,paziente_id.in.(${pazientiIds.join(',')})`);
        } else {
          query = query.ilike('numero_fattura', `%${searchTerm}%`);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setFatture(data || []);
    } catch (error) {
      console.error('Error fetching fatture:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nel caricamento delle fatture"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPazienti = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('pazienti')
        .select('*')
        .eq('user_id', user.id)
        .order('nome', { ascending: true });

      if (error) throw error;
      setPazienti(data || []);
    } catch (error) {
      console.error('Error fetching pazienti:', error);
    }
  };

  const fetchPrestazioni = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('prestazioni')
        .select('*')
        .eq('user_id', user.id)
        .eq('attiva', true)
        .order('nome', { ascending: true });

      if (error) throw error;
      setPrestazioni(data || []);
    } catch (error) {
      console.error('Error fetching prestazioni:', error);
    }
  };

  const createFattura = async (fatturaData: FatturaFormData) => {
    if (!user) return null;

    try {
      const prestazione = prestazioni.find(p => p.id === fatturaData.prestazione_id);
      if (!prestazione) {
        throw new Error('Prestazione non trovata');
      }

      // Ottieni dati profilo per calcoli fiscali
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        throw new Error('Profilo professionista non configurato. Configura i tuoi dati nelle Impostazioni.');
      }

      const numeroFattura = await generateNumeroFattura();
      const importoBase = Number(prestazione.prezzo_unitario);

      // Calcola componenti fiscali
      const fiscalData: FiscalData = {
        regime_fiscale: (profile as any).regime_fiscale || 'RF19',
        importo_prestazione: importoBase,
        percentuale_enpap: (profile as any).percentuale_enpap || 2,
        enpap_a_paziente: (profile as any).enpap_a_paziente ?? true
      };

      const calcoli = calcolaComponentiFiscali(fiscalData);

      // Crea la fattura
      const { data: fattura, error: fatturaError } = await supabase
        .from('fatture')
        .insert({
          user_id: user.id,
          paziente_id: fatturaData.paziente_id,
          numero_fattura: numeroFattura,
          data_fattura: fatturaData.data_prestazione,
          data_scadenza: null,
          stato: 'inviata',
          subtotale: calcoli.imponibile,
          iva_percentuale: 0, // IVA esente per prestazioni sanitarie
          iva_importo: 0,
          totale: calcoli.totale,
          note: fatturaData.note || null
        })
        .select()
        .single();

      if (fatturaError) throw fatturaError;

      // Crea la riga fattura per la prestazione
      const { error: rigaError } = await supabase
        .from('righe_fattura')
        .insert({
          fattura_id: fattura.id,
          prestazione_id: prestazione.id,
          descrizione: `${prestazione.nome} - ${fatturaData.data_prestazione}`,
          quantita: 1,
          prezzo_unitario: importoBase,
          totale: importoBase
        });

      if (rigaError) throw rigaError;

      // Aggiungi riga ENPAP se addebitata al paziente
      if (calcoli.enpap > 0) {
        const { error: enpapError } = await supabase
          .from('righe_fattura')
          .insert({
            fattura_id: fattura.id,
            prestazione_id: null,
            descrizione: `Contributo ENPAP ${fiscalData.percentuale_enpap}%`,
            quantita: 1,
            prezzo_unitario: calcoli.enpap,
            totale: calcoli.enpap
          });

        if (enpapError) throw enpapError;
      }

      // Aggiungi riga bollo se applicabile
      if (calcoli.bollo > 0) {
        const { error: bolloError } = await supabase
          .from('righe_fattura')
          .insert({
            fattura_id: fattura.id,
            prestazione_id: null,
            descrizione: 'Imposta di bollo',
            quantita: 1,
            prezzo_unitario: calcoli.bollo,
            totale: calcoli.bollo
          });

        if (bolloError) throw bolloError;
      }

      // Aggiorna la lista delle fatture
      await fetchFatture();
      
      toast({
        title: "Successo",
        description: `Fattura ${numeroFattura} creata correttamente`
      });
      
      return fattura;
    } catch (error) {
      console.error('createFattura: Error:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: `Errore nella creazione della fattura: ${error.message || 'Errore sconosciuto'}`
      });
      return null;
    }
  };

  const updateStatoFattura = async (id: string, nuovoStato: 'bozza' | 'inviata' | 'pagata' | 'scaduta') => {
    try {
      const { data, error } = await supabase
        .from('fatture')
        .update({ stato: nuovoStato })
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      // Aggiorna lo stato locale
      setFatture(prev => 
        prev.map(f => f.id === id ? { ...f, stato: nuovoStato } : f)
      );
      
      toast({
        title: "Successo",
        description: `Fattura aggiornata a "${nuovoStato}"`
      });
      
      return data;
    } catch (error) {
      console.error('Error updating fattura stato:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'aggiornamento dello stato"
      });
      return null;
    }
  };

  const deleteFattura = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fatture')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setFatture(prev => prev.filter(f => f.id !== id));
      toast({
        title: "Successo",
        description: "Fattura eliminata correttamente"
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting fattura:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'eliminazione della fattura"
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchFatture();
      fetchPazienti();
      fetchPrestazioni();
    }
  }, [user, searchTerm]);

  // Statistiche derivate
  const stats = {
    totale: fatture.length,
    fatturato: fatture.reduce((sum, f) => sum + Number(f.totale), 0),
    daIncassare: fatture
      .filter(f => f.stato === 'inviata' || f.stato === 'scaduta')
      .reduce((sum, f) => sum + Number(f.totale), 0),
    scadute: fatture.filter(f => f.stato === 'scaduta').length,
    pagate: fatture.filter(f => f.stato === 'pagata').length
  };

  return {
    fatture,
    pazienti,
    prestazioni,
    loading,
    searchTerm,
    setSearchTerm,
    createFattura,
    updateStatoFattura,
    deleteFattura,
    refreshFatture: fetchFatture,
    stats
  };
}