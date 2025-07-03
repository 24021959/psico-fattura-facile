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
    
    // Tabella prestazioni conforme ai facsimili
    this.addTabellaPrestazioniConformi(fattura, calcoli);
    
    // Note legali e fiscali
    this.addNoteLegaliFiscali(professionista, calcoli);
    
    return this.doc.output('blob');
  }

  private addHeaderCompleto(professionista: ProfessionistaData, fattura: FatturaData) {
    // Document info (top left)
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 123, 255); // Colore azzurro del sito
    this.doc.text(`Documento ${fattura.numero}/${fattura.anno}`, this.margin, this.margin + 10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text(`Emesso il ${new Date(fattura.data).toLocaleDateString('it-IT')}`, this.margin, this.margin + 20);
    
    // Mittente (left side)
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Mittente:', this.margin, this.margin + 40);
    
    this.doc.setFont('helvetica', 'normal');
    let y = this.margin + 50;
    
    const nomeCompleto = `${professionista.titolo || 'Dott.ssa'} ${professionista.nome} ${professionista.cognome}`.trim();
    this.doc.text(nomeCompleto, this.margin, y);
    y += 6;
    
    if (professionista.indirizzo) {
      this.doc.text(`${professionista.indirizzo}`, this.margin, y);
      y += 6;
    }
    if (professionista.citta && professionista.cap) {
      this.doc.text(`${professionista.cap}, ${professionista.citta}`, this.margin, y);
      y += 6;
    }
    if (professionista.codiceFiscale) {
      this.doc.text(`${professionista.codiceFiscale}`, this.margin, y);
      y += 6;
    }
    if (professionista.telefono) {
      this.doc.text(`${professionista.telefono}`, this.margin, y);
    }
    
    // Logo area (top right above destinatario)
    const logoX = this.pageWidth - this.margin - 40;
    const logoY = this.margin + 10;
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(logoX, logoY, 40, 30, 'F');
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(128, 128, 128);
    this.doc.text('Logo', logoX + 15, logoY + 18);
    
    // Destinatario (right side below logo)
    const destX = this.pageWidth - this.margin - 80;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('Destinatario:', destX, this.margin + 50);
    
    this.doc.setFont('helvetica', 'normal');
    let destY = this.margin + 60;
    this.doc.text(`${fattura.paziente.nome} ${fattura.paziente.cognome}`, destX, destY);
    destY += 6;
    if (fattura.paziente.indirizzo) {
      this.doc.text(`${fattura.paziente.indirizzo}`, destX, destY);
      destY += 6;
    }
    if (fattura.paziente.citta && fattura.paziente.cap) {
      this.doc.text(`${fattura.paziente.cap}, ${fattura.paziente.citta}`, destX, destY);
      destY += 6;
    }
    if (fattura.paziente.codiceFiscale) {
      this.doc.text(`${fattura.paziente.codiceFiscale}`, destX, destY);
    }
  }

  // Rimosso addDestinatarioFattura perché ora integrato nell'header

  private addTabellaPrestazioniConformi(fattura: FatturaData, calcoli: any) {
    const startY = this.margin + 130;
    const tableWidth = this.pageWidth - 2 * this.margin;
    
    // Header tabella
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, startY, tableWidth, 8, 'F');
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    
    // Intestazioni colonne come nel facsimile
    this.doc.text('Qt.', this.margin + 2, startY + 6);
    this.doc.text('Descrizione prestazione', this.margin + 15, startY + 6);
    this.doc.text('Importo', this.margin + 120, startY + 6);
    
    // Bordo header
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin, startY, tableWidth, 8);
    
    // Righe prestazioni
    let rowY = startY + 8;
    this.doc.setFont('helvetica', 'normal');
    
    // Riga prestazione principale (usa il nome della prestazione)
    this.doc.text('1', this.margin + 4, rowY + 6);
    this.doc.text(fattura.prestazione.nome, this.margin + 17, rowY + 6);
    this.doc.text(`${calcoli.imponibile.toFixed(2)} €`, this.margin + 122, rowY + 6);
    this.doc.rect(this.margin, rowY, tableWidth, 8);
    rowY += 8;
    
    // Riga seduta conoscitiva (sempre 0,00)
    this.doc.text('1', this.margin + 4, rowY + 6);
    this.doc.text('Seduta conoscitiva', this.margin + 17, rowY + 6);
    this.doc.text('0,00 €', this.margin + 122, rowY + 6);
    this.doc.rect(this.margin, rowY, tableWidth, 8);
    rowY += 8;
    
    // Riga totale prestazione
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Totale prestazione:', this.margin + 17, rowY + 6);
    this.doc.text(`${calcoli.imponibile.toFixed(2)} €`, this.margin + 122, rowY + 6);
    this.doc.rect(this.margin, rowY, tableWidth, 8);
    rowY += 8;
    
    // Sezione descrizione
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, rowY, tableWidth, 8, 'F');
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Descrizione', this.margin + 2, rowY + 6);
    this.doc.text('Importo', this.margin + 120, rowY + 6);
    this.doc.rect(this.margin, rowY, tableWidth, 8);
    rowY += 8;
    
    // Riga ENPAP
    if (calcoli.enpap > 0) {
      const percentualeEnpap = calcoli.percentuale_enpap || 2;
      this.doc.text(`ENPAP ${percentualeEnpap}% su ${calcoli.imponibile.toFixed(2)} €`, this.margin + 2, rowY + 6);
      this.doc.text(`${calcoli.enpap.toFixed(2)} €`, this.margin + 122, rowY + 6);
      this.doc.rect(this.margin, rowY, tableWidth, 8);
      rowY += 8;
    }
    
    // Totale da pagare
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Totale da pagare:', this.margin + 2, rowY + 6);
    this.doc.text(`${calcoli.totale.toFixed(2)} €`, this.margin + 122, rowY + 6);
    this.doc.rect(this.margin, rowY, tableWidth, 8);
    
    // Linee verticali per separare le colonne
    const colPositions = [12, 115];
    colPositions.forEach(pos => {
      this.doc.line(this.margin + pos, startY, this.margin + pos, rowY + 8);
    });
  }

  private addNoteLegaliFiscali(professionista: ProfessionistaData, calcoli: any) {
    const startY = this.margin + 200;
    
    // Modalità di pagamento
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Modalità di pagamento', this.margin, startY);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Bonifico su conto Crediem', this.margin, startY + 8);
    
    if (professionista.iban) {
      this.doc.text(`${professionista.iban}`, this.margin, startY + 16);
    }
    
    // Note legali specifiche per regime fiscale
    let noteY = startY + 30;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    
    if (professionista.regime_fiscale === 'RF01') {
      // Note per Regime Semplificato
      this.doc.text('Esente Iva ai sensi dell\'art. 10 n.18 DPR 633/72 - Prestazione Sanitaria', this.margin, noteY);
      noteY += 6;
      this.doc.text('Imposta di bollo assolta sull\'originale - DI 30/05/94', this.margin, noteY);
      noteY += 6;
      this.doc.text('Nota liberale', this.margin, noteY);
    } else {
      // Note per Regime Forfettario (RF19)  
      this.doc.text('Operazione effettuata ai sensi dell\'art.1, c.54-89, L.190/2014 (Regime Forfetario)', this.margin, noteY);
      noteY += 6;
      this.doc.text('Esercizio di imposta di bollo con modalità delle regime numero 26082016 - Regime Forfettario', this.margin, noteY);
      noteY += 6;
      this.doc.text('Imposta di bollo assolta sull\'originale - DI 30/05/94', this.margin, noteY);
      noteY += 6;
      this.doc.text('Nota liberale', this.margin, noteY);
    }
    
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