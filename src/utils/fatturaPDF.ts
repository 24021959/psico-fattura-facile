import jsPDF from 'jspdf';
import { calcolaComponentiFiscali, getNoteStandard, type FiscalData } from './fiscalUtils';

interface FatturaData {
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

interface ProfessionistaData {
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

export class FatturaPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private primaryColor: [number, number, number] = [0, 123, 255]; // Healthcare blue
  private greenColor: [number, number, number] = [40, 167, 69]; // Medical green

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
  }

  async generateFattura(fattura: FatturaData, professionista: ProfessionistaData): Promise<Blob> {
    this.doc = new jsPDF();
    
    // Calcola componenti fiscali
    const fiscalData: FiscalData = {
      regime_fiscale: professionista.regime_fiscale || 'RF19',
      importo_prestazione: fattura.importo,
      percentuale_enpap: professionista.percentuale_enpap || 2,
      enpap_a_paziente: professionista.enpap_a_paziente ?? true
    };
    
    const calcoli = calcolaComponentiFiscali(fiscalData);
    
    // Header con intestazione professionista e numero fattura
    this.addHeaderCompleto(professionista, fattura);
    
    // Dati destinatario fattura
    this.addDestinatarioFattura(fattura);
    
    // Tabella prestazioni conforme ai facsimili
    this.addTabellaPrestazioniConformi(fattura, calcoli);
    
    // Note legali e fiscali
    this.addNoteLegaliFiscali(professionista, calcoli);
    
    return this.doc.output('blob');
  }

  private addHeaderCompleto(professionista: ProfessionistaData, fattura: FatturaData) {
    // Intestazione professionista (sinistra)
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    const nomeCompleto = `${professionista.titolo || ''} ${professionista.nome} ${professionista.cognome}`.trim();
    this.doc.text(nomeCompleto, this.margin, this.margin + 10);
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    
    let y = this.margin + 18;
    if (professionista.indirizzo) {
      this.doc.text(`${professionista.indirizzo}`, this.margin, y);
      y += 6;
    }
    if (professionista.citta && professionista.cap) {
      this.doc.text(`${professionista.cap} ${professionista.citta}`, this.margin, y);
      y += 6;
    }
    if (professionista.codiceFiscale) {
      this.doc.text(`C.F.: ${professionista.codiceFiscale}`, this.margin, y);
      y += 6;
    }
    if (professionista.partitaIva) {
      this.doc.text(`P.IVA: ${professionista.partitaIva}`, this.margin, y);
      y += 6;
    }
    if (professionista.pec) {
      this.doc.text(`PEC: ${professionista.pec}`, this.margin, y);
    }

    // FATTURA (destra)
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.primaryColor);
    
    const fatturaText = 'FATTURA';
    const fatturaWidth = this.doc.getTextWidth(fatturaText);
    this.doc.text(fatturaText, this.pageWidth - this.margin - fatturaWidth, this.margin + 15);
    
    // Numero e data fattura
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const numeroText = `N. ${fattura.numero}/${fattura.anno}`;
    const numeroWidth = this.doc.getTextWidth(numeroText);
    this.doc.text(numeroText, this.pageWidth - this.margin - numeroWidth, this.margin + 25);
    
    const dataText = `Data: ${new Date(fattura.data).toLocaleDateString('it-IT')}`;
    const dataWidth = this.doc.getTextWidth(dataText);
    this.doc.text(dataText, this.pageWidth - this.margin - dataWidth, this.margin + 35);
  }

  private addDestinatarioFattura(fattura: FatturaData) {
    const startY = this.margin + 70;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('SPETT.LE', this.margin, startY);
    
    this.doc.setFont('helvetica', 'normal');
    let y = startY + 8;
    
    const nomeCompleto = `${fattura.paziente.nome} ${fattura.paziente.cognome}`;
    this.doc.text(nomeCompleto, this.margin, y);
    y += 6;
    
    if (fattura.paziente.indirizzo) {
      this.doc.text(fattura.paziente.indirizzo, this.margin, y);
      y += 6;
    }
    
    if (fattura.paziente.citta && fattura.paziente.cap) {
      this.doc.text(`${fattura.paziente.cap} ${fattura.paziente.citta}`, this.margin, y);
      y += 6;
    }
    
    if (fattura.paziente.codiceFiscale) {
      this.doc.text(`C.F.: ${fattura.paziente.codiceFiscale}`, this.margin, y);
    }
  }

  private addTabellaPrestazioniConformi(fattura: FatturaData, calcoli: any) {
    const startY = this.margin + 120;
    const tableWidth = this.pageWidth - 2 * this.margin;
    
    // Header tabella
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, startY, tableWidth, 8, 'F');
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    // Intestazioni colonne
    this.doc.text('DESCRIZIONE', this.margin + 2, startY + 6);
    this.doc.text('Q.TÀ', this.margin + 80, startY + 6);
    this.doc.text('PREZZO', this.margin + 100, startY + 6);
    this.doc.text('IMPONIBILE', this.margin + 130, startY + 6);
    this.doc.text('IVA', this.margin + 160, startY + 6);
    
    // Bordo header
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, startY, tableWidth, 8);
    
    // Riga prestazione
    let rowY = startY + 8;
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text(fattura.prestazione.nome, this.margin + 2, rowY + 6);
    this.doc.text('1', this.margin + 82, rowY + 6);
    this.doc.text(`€ ${calcoli.imponibile.toFixed(2)}`, this.margin + 102, rowY + 6);
    this.doc.text(`€ ${calcoli.imponibile.toFixed(2)}`, this.margin + 132, rowY + 6);
    this.doc.text('ESENTE', this.margin + 162, rowY + 6);
    
    // Bordo riga prestazione
    this.doc.rect(this.margin, rowY, tableWidth, 8);
    rowY += 8;
    
    // Riga ENPAP (se applicabile)
    if (calcoli.enpap > 0) {
      this.doc.text(`Contributo ENPAP ${fattura.importo * 2 / 100}%`, this.margin + 2, rowY + 6);
      this.doc.text('1', this.margin + 82, rowY + 6);
      this.doc.text(`€ ${calcoli.enpap.toFixed(2)}`, this.margin + 102, rowY + 6);
      this.doc.text(`€ ${calcoli.enpap.toFixed(2)}`, this.margin + 132, rowY + 6);
      this.doc.text('ESENTE', this.margin + 162, rowY + 6);
      
      this.doc.rect(this.margin, rowY, tableWidth, 8);
      rowY += 8;
    }
    
    // Riga marca da bollo (se applicabile)
    if (calcoli.bollo > 0) {
      this.doc.text('Imposta di bollo', this.margin + 2, rowY + 6);
      this.doc.text('1', this.margin + 82, rowY + 6);
      this.doc.text(`€ ${calcoli.bollo.toFixed(2)}`, this.margin + 102, rowY + 6);
      this.doc.text(`€ ${calcoli.bollo.toFixed(2)}`, this.margin + 132, rowY + 6);
      this.doc.text('-', this.margin + 162, rowY + 6);
      
      this.doc.rect(this.margin, rowY, tableWidth, 8);
      rowY += 8;
    }
    
    // Totale
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFillColor(220, 220, 220);
    this.doc.rect(this.margin, rowY, tableWidth, 8, 'F');
    
    this.doc.text('TOTALE FATTURA', this.margin + 2, rowY + 6);
    this.doc.text(`€ ${calcoli.totale.toFixed(2)}`, this.margin + 132, rowY + 6);
    
    this.doc.rect(this.margin, rowY, tableWidth, 8);
    
    // Linee verticali per separare le colonne
    const colPositions = [80, 100, 130, 160];
    colPositions.forEach(pos => {
      this.doc.line(this.margin + pos, startY, this.margin + pos, rowY + 8);
    });
  }

  private addNoteLegaliFiscali(professionista: ProfessionistaData, calcoli: any) {
    const startY = this.margin + 200;
    
    // Modalità di pagamento
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Modalità di pagamento:', this.margin, startY);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Bonifico bancario', this.margin + 40, startY);
    
    if (professionista.iban) {
      this.doc.text(`IBAN: ${professionista.iban}`, this.margin, startY + 8);
    }
    
    // Note legali
    let noteY = startY + 25;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    
    this.doc.text(calcoli.frase_legale, this.margin, noteY);
    noteY += 6;
    
    this.doc.text(calcoli.nota_enpap, this.margin, noteY);
    noteY += 6;
    
    if (calcoli.nota_bollo) {
      this.doc.text(calcoli.nota_bollo, this.margin, noteY);
      noteY += 6;
    }
    
    this.doc.text('Opposizione alla trasmissione al Sistema TS del codice fiscale del', this.margin, noteY);
    noteY += 6;
    this.doc.text('paziente ai sensi dell\'art. 3 D.M. 31/07/2015.', this.margin, noteY);
    
    // Footer
    const footerY = this.pageHeight - 15;
    this.doc.setFontSize(7);
    this.doc.setTextColor(128, 128, 128);
    this.doc.text('Fattura generata con MedInvoice', this.margin, footerY);
  }
}

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