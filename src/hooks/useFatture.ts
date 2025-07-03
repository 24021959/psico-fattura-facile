import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { FattureService } from '@/services/fattureService';
import { calculateFattureStats } from '@/utils/fattureStats';
import type { 
  FatturaDettagliata, 
  FatturaFormData, 
  Paziente, 
  Prestazione, 
  FatturaStats 
} from '@/types/fattura';

export function useFatture() {
  const [fatture, setFatture] = useState<FatturaDettagliata[]>([]);
  const [pazienti, setPazienti] = useState<Paziente[]>([]);
  const [prestazioni, setPrestazioni] = useState<Prestazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  // Service instance
  const service = user ? new FattureService(user.id) : null;

  const fetchFatture = async () => {
    if (!service) return;
    
    try {
      setLoading(true);
      const data = await service.fetchFatture(searchTerm);
      setFatture(data);
    } catch (error) {
      console.error('Errore caricamento fatture:', error);
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
    if (!service) return;
    
    try {
      const data = await service.fetchPazienti();
      setPazienti(data);
    } catch (error) {
      console.error('Errore caricamento pazienti:', error);
    }
  };

  const fetchPrestazioni = async () => {
    if (!service) return;
    
    try {
      const data = await service.fetchPrestazioni();
      setPrestazioni(data);
    } catch (error) {
      console.error('Errore caricamento prestazioni:', error);
    }
  };

  const createFattura = async (fatturaData: FatturaFormData) => {
    if (!service) return null;

    try {
      const result = await service.createFattura(fatturaData, prestazioni, profile);
      
      // Aggiorna la lista delle fatture
      await fetchFatture();
      
      toast({
        title: "Successo",
        description: `Fattura ${result.numero_fattura} creata correttamente`
      });
      
      return result;
    } catch (error) {
      console.error('Errore creazione fattura:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: `Errore nella creazione della fattura: ${error.message || 'Errore sconosciuto'}`
      });
      return null;
    }
  };

  const updateStatoFattura = async (id: string, nuovoStato: 'bozza' | 'inviata' | 'pagata' | 'scaduta') => {
    if (!service) return null;

    try {
      const data = await service.updateStatoFattura(id, nuovoStato);
      
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
      console.error('Errore aggiornamento stato fattura:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nell'aggiornamento dello stato"
      });
      return null;
    }
  };

  const duplicateFattura = async (fatturaId: string) => {
    if (!service) return null;

    try {
      const nuovaFattura = await service.duplicateFattura(fatturaId);
      
      await fetchFatture();
      
      toast({
        title: "Successo",
        description: `Fattura duplicata: ${nuovaFattura.numero_fattura}`
      });
      
      return nuovaFattura;
    } catch (error) {
      console.error('Errore duplicazione fattura:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nella duplicazione della fattura"
      });
      return null;
    }
  };

  const deleteFattura = async (id: string) => {
    if (!service) return false;

    try {
      await service.deleteFattura(id);
      
      setFatture(prev => prev.filter(f => f.id !== id));
      toast({
        title: "Successo",
        description: "Fattura eliminata correttamente"
      });
      
      return true;
    } catch (error) {
      console.error('Errore eliminazione fattura:', error);
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

  // Calcola statistiche
  const stats: FatturaStats = calculateFattureStats(fatture);

  return {
    fatture,
    pazienti,
    prestazioni,
    loading,
    searchTerm,
    setSearchTerm,
    createFattura,
    duplicateFattura,
    updateStatoFattura,
    deleteFattura,
    refreshFatture: fetchFatture,
    stats
  };
}