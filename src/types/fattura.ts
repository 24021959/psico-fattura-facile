import type { Tables } from '@/integrations/supabase/types';

export type Fattura = Tables<'fatture'>;
export type RigaFattura = Tables<'righe_fattura'>;
export type Paziente = Tables<'pazienti'>;
export type Prestazione = Tables<'prestazioni'>;

export interface FatturaDettagliata extends Fattura {
  paziente?: Paziente | any;
  righe_fattura?: (RigaFattura & { prestazione?: Prestazione | any })[];
}

export interface PrestazioneRiga {
  prestazione_id: string;
  quantita: number;
  descrizione_personalizzata?: string;
}

export interface FatturaFormData {
  paziente_id: string;
  prestazioni: PrestazioneRiga[];
  data_prestazione: string;
  metodo_pagamento: string;
  note?: string;
}

export interface FatturaStats {
  totale: number;
  fatturato: number;
  daIncassare: number;
  scadute: number;
  pagate: number;
}

// Legacy export for existing code compatibility
export interface FatturaData {
  id: string;
  numero: string;
  anno: string;
  data: string;
  paziente: {
    nome: string;
    cognome: string;
    codiceFiscale: string;
    indirizzo?: string;
    citta?: string;
    cap?: string;
  };
  prestazione: {
    nome: string;
    codice: string;
  };
  importo: number;
  enpap: number;
  totale: number;
  metodoPagamento: string;
  note?: string;
}

export interface ProfessionistaData {
  nome: string;
  cognome: string;
  titolo?: string;
  codiceFiscale: string;
  partitaIva: string;
  indirizzo: string;
  citta: string;
  cap: string;
  telefono?: string;
  email?: string;
  pec?: string;
  iban?: string;
  ordineAlbo?: string;
  numeroIscrizione?: string;
  logoUrl?: string;
  regime_fiscale?: 'RF01' | 'RF19';
  percentuale_enpap?: number;
  enpap_a_paziente?: boolean;
}