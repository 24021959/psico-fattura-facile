import jsPDF from 'jspdf';

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
    
    // Header con logo e info fattura
    this.addHeader(professionista, fattura);
    
    // Date e destinatario
    this.addDateEDestinatario(fattura);
    
    // Tabella prestazioni
    this.addTabellaDettagli(fattura);
    
    // Totali
    this.addTotaliSection(fattura);
    
    // Note legali
    this.addNoteLegaliSection();
    
    // Footer
    this.addFooter(professionista);

    return this.doc.output('blob');
  }

  private addHeader(professionista: ProfessionistaData, fattura: FatturaData) {
    // Logo area (sinistra)
    this.doc.setFillColor(...this.primaryColor);
    this.doc.rect(this.margin, this.margin, 30, 20, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('MI', this.margin + 8, this.margin + 13);

    // Numero fattura (destra)
    this.doc.setTextColor(40, 167, 69);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    const fatturaText = `Fattura n. ${fattura.numero}`;
    const textWidth = this.doc.getTextWidth(fatturaText);
    this.doc.text(fatturaText, this.pageWidth - this.margin - textWidth, this.margin + 15);
  }

  private addDateEDestinatario(fattura: FatturaData) {
    let currentY = this.margin + 35;

    // Data fattura (sinistra)
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Data fattura: ${new Date(fattura.data).toLocaleDateString('it-IT')}`, this.margin, currentY);
    
    currentY += 12;
    const scadenza = new Date(fattura.data);
    scadenza.setDate(scadenza.getDate() + 14);
    this.doc.text(`Data di scadenza: ${scadenza.toLocaleDateString('it-IT')}`, this.margin, currentY);

    // FATTURA A: (destra)
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FATTURA A:', this.pageWidth / 2 + 20, this.margin + 35);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`[Nome dell'azienda del cliente]`, this.pageWidth / 2 + 20, this.margin + 47);
    this.doc.text(`[Indirizzo dell'azienda del cliente]`, this.pageWidth / 2 + 20, this.margin + 59);
    this.doc.text(`P.IVA/C.F.: [Numero di partita IVA del cliente /`, this.pageWidth / 2 + 20, this.margin + 71);
    this.doc.text(`Codice Fiscale]`, this.pageWidth / 2 + 20, this.margin + 83);
  }

  private addTabellaDettagli(fattura: FatturaData) {
    const startY = this.margin + 110;
    const tableWidth = this.pageWidth - 2 * this.margin;
    const colWidths = [60, 25, 25, 30, 30]; // DESCRIZIONE, QUANTITÀ, PREZZO, SUBTOTALE, IVA
    
    // Header tabella con sfondo verde
    this.doc.setFillColor(...this.greenColor);
    this.doc.rect(this.margin, startY, tableWidth, 12, 'F');
    
    // Testo header
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    let x = this.margin + 2;
    this.doc.text('DESCRIZIONE', x, startY + 8);
    x += colWidths[0];
    this.doc.text('QUANTITÀ', x, startY + 8);
    x += colWidths[1];
    this.doc.text('PREZZO', x, startY + 8);
    x += colWidths[2];
    this.doc.text('SUBTOTALE', x, startY + 8);
    x += colWidths[3];
    this.doc.text('IVA', x, startY + 8);

    // Righe della tabella
    let rowY = startY + 12;
    
    // Riga prestazione
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    
    x = this.margin + 2;
    this.doc.text(fattura.prestazione.nome, x, rowY + 8);
    x += colWidths[0];
    this.doc.text('1', x, rowY + 8);
    x += colWidths[1];
    this.doc.text(`${fattura.importo.toFixed(2)}`, x, rowY + 8);
    x += colWidths[2];
    this.doc.text(`${fattura.importo.toFixed(2)}`, x, rowY + 8);
    x += colWidths[3];
    this.doc.text('', x, rowY + 8); // IVA vuota

    // Seconda riga
    rowY += 12;
    x = this.margin + 2;
    this.doc.text('il mio servizio', x, rowY + 8);
    x += colWidths[0];
    this.doc.text('1', x, rowY + 8);
    x += colWidths[1];
    this.doc.text('230,00', x, rowY + 8);
    x += colWidths[2];
    this.doc.text('230,00', x, rowY + 8);

    // Terza riga
    rowY += 12;
    x = this.margin + 2;
    this.doc.text('imposta di bollo', x, rowY + 8);
    x += colWidths[0];
    this.doc.text('1', x, rowY + 8);
    x += colWidths[1];
    this.doc.text('2,00', x, rowY + 8);
    x += colWidths[2];
    this.doc.text('2,00', x, rowY + 8);

    // Bordi tabella
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    
    // Bordo esterno
    this.doc.rect(this.margin, startY, tableWidth, rowY - startY + 12);
    
    // Linee verticali
    x = this.margin;
    for (let i = 0; i < colWidths.length - 1; i++) {
      x += colWidths[i];
      this.doc.line(x, startY, x, rowY + 12);
    }
    
    // Linee orizzontali
    this.doc.line(this.margin, startY + 12, this.pageWidth - this.margin, startY + 12);
    this.doc.line(this.margin, startY + 24, this.pageWidth - this.margin, startY + 24);
    this.doc.line(this.margin, startY + 36, this.pageWidth - this.margin, startY + 36);
  }

  private addTotaliSection(fattura: FatturaData) {
    const startY = this.margin + 170;
    const rightX = this.pageWidth - this.margin - 2;
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    // SUBTOTALE
    this.doc.text('SUBTOTALE', rightX - 60, startY);
    this.doc.text('322,00 €', rightX - 20, startY);
    
    // Totale
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Totale', rightX - 60, startY + 15);
    this.doc.text('322,00 €', rightX - 20, startY + 15);
  }

  private addNoteLegaliSection() {
    const startY = this.margin + 220;
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    // Info azienda (sinistra)
    this.doc.text('[Nome dell\'Azienda]', this.margin, startY);
    this.doc.text('[Indirizzo]', this.margin, startY + 10);
    this.doc.text('P.IVA/C.F.: [Numero di partita IVA / Codice Fiscale]', this.margin, startY + 20);
    
    // Info banca (destra)
    this.doc.text('[Nome della banca]', this.pageWidth / 2 + 20, startY);
    this.doc.text('SWIFT/BIC: [SWIFT/BIC]', this.pageWidth / 2 + 20, startY + 10);
    this.doc.text('Numero del conto corrente: [Conto corrente', this.pageWidth / 2 + 20, startY + 20);
    this.doc.text('(IBAN)]', this.pageWidth / 2 + 20, startY + 30);
    
    // Note legali
    this.doc.text('Operazione senza applicazione dell\'IVA, effettuata ai sensi dell\'articolo 1, commi da 54 a 89, l. n. 190 del 2014 così come', this.margin, startY + 50);
    this.doc.text('modificato dalla l. n. 208 del 2015 e dalla l. n. 145 del 2018', this.margin + 50, startY + 60);
    
    this.doc.text('Imposta di bollo da 2 euro assolta sull\'originale per importi maggiori di 77,47 euro', this.margin + 30, startY + 80);
  }


  private addFooter(professionista: ProfessionistaData) {
    this.doc.setFontSize(8);
    this.doc.setTextColor(128, 128, 128);
    
    const footerY = this.pageHeight - 10;
    this.doc.text('MedInvoice - Software di fatturazione per professionisti sanitari', this.margin, footerY);
    
    if (professionista.iban) {
      this.doc.text(`IBAN: ${professionista.iban}`, this.pageWidth - this.margin - 80, footerY);
    }
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
    numeroIscrizione: "00000"
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
    numeroIscrizione: "00000"
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