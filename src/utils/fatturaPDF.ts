import { FatturaPDFGenerator } from './pdf/FatturaPDFGenerator';
import type { FatturaData, ProfessionistaData } from '@/types/fattura';

// Funzione helper per generare e scaricare PDF
export async function generaEScaricaPDF(fattura: FatturaData, professionistaData?: ProfessionistaData) {
  // Dati professionista - usa quelli passati o valori di fallback
  const professionista: ProfessionistaData = professionistaData || {
    nome: "Nome",
    cognome: "Cognome",
    titolo: "Dott.ssa",
    codiceFiscale: "XXXXXX00X00X000X",
    partitaIva: "00000000000",
    indirizzo: "Via da configurare, 0",
    citta: "Città da configurare",
    cap: "00000",
    telefono: "+39 000 0000000",
    email: "email@daconfiguarare.it",
    pec: "pec@daconfiguarare.it", 
    iban: "IT00 X000 0000 0000 0000 000000",
    ordineAlbo: "Ordine da configurare",
    numeroIscrizione: "00000",
    regime_fiscale: "RF19",
    percentuale_enpap: 2.00,
    enpap_a_paziente: true
  };
  
  const generator = new FatturaPDFGenerator();
  const pdfBlob = await generator.generateFattura(fattura, professionista);
  
  // Download del file
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Fattura_${fattura.numero}_${fattura.anno}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Funzione per aprire anteprima PDF in nuova tab
export async function anteprimaPDF(fattura: FatturaData, professionistaData?: ProfessionistaData) {
  // Dati professionista - usa quelli passati o valori di fallback
  const professionista: ProfessionistaData = professionistaData || {
    nome: "Nome",
    cognome: "Cognome",
    titolo: "Dott.ssa",
    codiceFiscale: "XXXXXX00X00X000X",
    partitaIva: "00000000000",
    indirizzo: "Via da configurare, 0",
    citta: "Città da configurare",
    cap: "00000",
    telefono: "+39 000 0000000",
    email: "email@daconfiguarare.it",
    pec: "pec@daconfiguarare.it", 
    iban: "IT00 X000 0000 0000 0000 000000",
    ordineAlbo: "Ordine da configurare",
    numeroIscrizione: "00000",
    regime_fiscale: "RF19",
    percentuale_enpap: 2.00,
    enpap_a_paziente: true
  };
  
  const generator = new FatturaPDFGenerator();
  const pdfBlob = await generator.generateFattura(fattura, professionista);
  
  // Apri in nuova tab per anteprima
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
  
  // Pulizia URL dopo qualche secondo
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 5000);
}

// Re-export types for backward compatibility
export type { FatturaData, ProfessionistaData };
export { FatturaPDFGenerator };