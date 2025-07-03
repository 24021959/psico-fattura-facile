import { supabase } from '@/integrations/supabase/client';
import { calcolaComponentiFiscali, type FiscalData } from '@/utils/fiscalUtils';
import type { 
  FatturaDettagliata, 
  FatturaFormData, 
  Paziente, 
  Prestazione 
} from '@/types/fattura';

export class FattureService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async generateNumeroFattura(): Promise<string> {
    const currentYear = new Date().getFullYear();
    
    const { data: lastFattura } = await supabase
      .from('fatture')
      .select('numero_fattura')
      .eq('user_id', this.userId)
      .like('numero_fattura', `${currentYear}-%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (lastFattura && lastFattura.length > 0) {
      const lastNumber = parseInt(lastFattura[0].numero_fattura.split('-')[1]);
      return `${currentYear}-${String(lastNumber + 1).padStart(3, '0')}`;
    }
    
    return `${currentYear}-001`;
  }

  async fetchFatture(searchTerm?: string): Promise<FatturaDettagliata[]> {
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
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });

    if (searchTerm) {
      // Cerca per numero fattura o paziente
      const { data: pazientiMatch } = await supabase
        .from('pazienti')
        .select('id')
        .eq('user_id', this.userId)
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
    return data || [];
  }

  async fetchPazienti(): Promise<Paziente[]> {
    const { data, error } = await supabase
      .from('pazienti')
      .select('*')
      .eq('user_id', this.userId)
      .order('nome', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async fetchPrestazioni(): Promise<Prestazione[]> {
    const { data, error } = await supabase
      .from('prestazioni')
      .select('*')
      .eq('user_id', this.userId)
      .eq('attiva', true)
      .order('nome', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createFattura(
    fatturaData: FatturaFormData, 
    prestazioni: Prestazione[], 
    profile: any
  ) {
    // Valida che ci siano prestazioni valide
    const prestazioniValide = fatturaData.prestazioni.filter(p => p.prestazione_id);
    if (prestazioniValide.length === 0) {
      throw new Error('Aggiungi almeno una prestazione');
    }

    if (!profile) {
      throw new Error('Profilo professionista non configurato. Configura i tuoi dati nelle Impostazioni.');
    }

    const numeroFattura = await this.generateNumeroFattura();

    // Calcola totali di tutte le prestazioni
    let importoTotalePrestazioni = 0;
    for (const riga of prestazioniValide) {
      const prestazione = prestazioni.find(p => p.id === riga.prestazione_id);
      if (prestazione) {
        importoTotalePrestazioni += Number(prestazione.prezzo_unitario) * riga.quantita;
      }
    }

    // Calcola componenti fiscali sul totale
    const fiscalData: FiscalData = {
      regime_fiscale: (profile as any).regime_fiscale || 'RF19',
      importo_prestazione: importoTotalePrestazioni,
      percentuale_enpap: (profile as any).percentuale_enpap || 2,
      enpap_a_paziente: (profile as any).enpap_a_paziente ?? true
    };

    const calcoli = calcolaComponentiFiscali(fiscalData);

    // Crea la fattura
    const { data: fattura, error: fatturaError } = await supabase
      .from('fatture')
      .insert({
        user_id: this.userId,
        paziente_id: fatturaData.paziente_id,
        numero_fattura: numeroFattura,
        data_fattura: fatturaData.data_prestazione,
        data_scadenza: null,
        stato: 'inviata',
        subtotale: calcoli.imponibile,
        iva_percentuale: 0, // IVA esente per prestazioni sanitarie
        iva_importo: 0,
        totale: calcoli.totale,
        metodo_pagamento: fatturaData.metodo_pagamento,
        note: fatturaData.note || null
      })
      .select()
      .single();

    if (fatturaError) throw fatturaError;

    // Crea le righe fattura per tutte le prestazioni
    for (const riga of prestazioniValide) {
      const prestazione = prestazioni.find(p => p.id === riga.prestazione_id);
      if (prestazione) {
        const importoRiga = Number(prestazione.prezzo_unitario) * riga.quantita;
        const descrizione = riga.descrizione_personalizzata || 
          `${prestazione.nome}${riga.quantita > 1 ? ` (x${riga.quantita})` : ''} - ${fatturaData.data_prestazione}`;
        
        const { error: rigaError } = await supabase
          .from('righe_fattura')
          .insert({
            fattura_id: fattura.id,
            prestazione_id: prestazione.id,
            descrizione: descrizione,
            quantita: riga.quantita,
            prezzo_unitario: Number(prestazione.prezzo_unitario),
            totale: importoRiga
          });

        if (rigaError) throw rigaError;
      }
    }

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

    return fattura;
  }

  async updateStatoFattura(id: string, nuovoStato: 'bozza' | 'inviata' | 'pagata' | 'scaduta') {
    const { data, error } = await supabase
      .from('fatture')
      .update({ stato: nuovoStato })
      .eq('id', id)
      .eq('user_id', this.userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async duplicateFattura(fatturaId: string) {
    // Recupera la fattura originale con tutti i dati
    const { data: fatturaOriginale, error: fetchError } = await supabase
      .from('fatture')
      .select(`
        *,
        paziente:pazienti!fatture_paziente_id_fkey(*),
        righe_fattura(*)
      `)
      .eq('id', fatturaId)
      .eq('user_id', this.userId)
      .single();

    if (fetchError) throw fetchError;
    if (!fatturaOriginale) throw new Error('Fattura non trovata');

    const numeroFattura = await this.generateNumeroFattura();
    
    // Crea la nuova fattura
    const { data: nuovaFattura, error: createError } = await supabase
      .from('fatture')
      .insert({
        user_id: this.userId,
        paziente_id: fatturaOriginale.paziente_id,
        numero_fattura: numeroFattura,
        data_fattura: new Date().toISOString().split('T')[0],
        data_scadenza: fatturaOriginale.data_scadenza,
        stato: 'bozza',
        subtotale: fatturaOriginale.subtotale,
        iva_percentuale: fatturaOriginale.iva_percentuale,
        iva_importo: fatturaOriginale.iva_importo,
        totale: fatturaOriginale.totale,
        metodo_pagamento: fatturaOriginale.metodo_pagamento,
        note: fatturaOriginale.note
      })
      .select()
      .single();

    if (createError) throw createError;

    // Duplica le righe fattura
    if (fatturaOriginale.righe_fattura?.length > 0) {
      const righeData = fatturaOriginale.righe_fattura.map(riga => ({
        fattura_id: nuovaFattura.id,
        prestazione_id: riga.prestazione_id,
        descrizione: riga.descrizione,
        quantita: riga.quantita,
        prezzo_unitario: riga.prezzo_unitario,
        totale: riga.totale
      }));

      const { error: righeError } = await supabase
        .from('righe_fattura')
        .insert(righeData);

      if (righeError) throw righeError;
    }

    return nuovaFattura;
  }

  async deleteFattura(id: string) {
    const { error } = await supabase
      .from('fatture')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId);

    if (error) throw error;
    return true;
  }
}