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

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
  }

  async generateFattura(fattura: FatturaData, professionista: ProfessionistaData): Promise<Blob> {
    this.doc = new jsPDF();
    
    // Header
    this.addHeader(professionista);
    
    // Fattura Info
    this.addFatturaInfo(fattura);
    
    // Destinatario
    this.addDestinatario(fattura.paziente);
    
    // Dettagli Prestazione
    this.addDettagliPrestazione(fattura);
    
    // Totali
    this.addTotali(fattura);
    
    // Note Legali
    this.addNoteLegali();
    
    // Footer
    this.addFooter(professionista);

    return this.doc.output('blob');
  }

  private addHeader(professionista: ProfessionistaData) {
    let currentY = this.margin;
    
    // Logo o simbolo
    if (professionista.logoUrl) {
      // TODO: Aggiungere supporto per logo immagine
      this.doc.setFillColor(0, 123, 255);
      this.doc.rect(this.margin, currentY, 20, 20, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(16);
      this.doc.text('ψ', this.margin + 7, currentY + 13);
    } else {
      this.doc.setFillColor(0, 123, 255);
      this.doc.rect(this.margin, currentY, 20, 20, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(16);
      this.doc.text('ψ', this.margin + 7, currentY + 13);
    }

    // Intestazione Professionista
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    
    const titolo = professionista.titolo || 'Dott.ssa';
    this.doc.text(`${titolo} ${professionista.nome} ${professionista.cognome}`, this.margin + 30, currentY + 12);
    
    currentY += 20;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Psicologa - Psicoterapeuta`, this.margin + 30, currentY);
    
    currentY += 10;
    this.doc.text(`${professionista.indirizzo}`, this.margin + 30, currentY);
    
    currentY += 8;
    this.doc.text(`${professionista.cap} ${professionista.citta}`, this.margin + 30, currentY);
    
    if (professionista.telefono) {
      currentY += 8;
      this.doc.text(`Tel: ${professionista.telefono}`, this.margin + 30, currentY);
    }
    
    if (professionista.email) {
      currentY += 8;
      this.doc.text(`Email: ${professionista.email}`, this.margin + 30, currentY);
    }
    
    if (professionista.pec) {
      currentY += 8;
      this.doc.text(`PEC: ${professionista.pec}`, this.margin + 30, currentY);
    }
    
    currentY += 10;
    this.doc.text(`C.F.: ${professionista.codiceFiscale}`, this.margin + 30, currentY);
    
    currentY += 8;
    this.doc.text(`P.IVA: ${professionista.partitaIva}`, this.margin + 30, currentY);
    
    if (professionista.ordineAlbo && professionista.numeroIscrizione) {
      currentY += 8;
      this.doc.text(`${professionista.ordineAlbo} n° ${professionista.numeroIscrizione}`, this.margin + 30, currentY);
    }
  }

  private addFatturaInfo(fattura: FatturaData) {
    const rightX = this.pageWidth - this.margin - 60;
    
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FATTURA', rightX, this.margin + 20);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`N° ${fattura.numero}/${fattura.anno}`, rightX, this.margin + 35);
    this.doc.text(`Data: ${new Date(fattura.data).toLocaleDateString('it-IT')}`, rightX, this.margin + 45);
  }

  private addDestinatario(paziente: any) {
    const startY = this.margin + 130;
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FATTURA A:', this.margin, startY);
    
    let currentY = startY + 15;
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${paziente.nome} ${paziente.cognome}`, this.margin, currentY);
    
    currentY += 10;
    this.doc.text(`C.F.: ${paziente.codiceFiscale}`, this.margin, currentY);
    
    if (paziente.indirizzo) {
      currentY += 10;
      this.doc.text(`${paziente.indirizzo}`, this.margin, currentY);
      if (paziente.cap && paziente.citta) {
        currentY += 10;
        this.doc.text(`${paziente.cap} ${paziente.citta}`, this.margin, currentY);
      }
    }
  }

  private addDettagliPrestazione(fattura: FatturaData) {
    const startY = this.margin + 200;
    
    // Intestazione tabella
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, startY, this.pageWidth - 2 * this.margin, 12, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DESCRIZIONE', this.margin + 5, startY + 8);
    this.doc.text('CODICE', this.margin + 80, startY + 8);
    this.doc.text('QTÀ', this.margin + 120, startY + 8);
    this.doc.text('PREZZO', this.margin + 140, startY + 8);
    this.doc.text('TOTALE', this.pageWidth - this.margin - 30, startY + 8);
    
    // Riga prestazione con più spazio
    let currentY = startY + 25;
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(fattura.prestazione.nome, this.margin + 5, currentY);
    this.doc.text(fattura.prestazione.codice, this.margin + 80, currentY);
    this.doc.text('1', this.margin + 120, currentY);
    this.doc.text(`€ ${fattura.importo.toFixed(2)}`, this.margin + 140, currentY);
    this.doc.text(`€ ${fattura.importo.toFixed(2)}`, this.pageWidth - this.margin - 30, currentY);
    
    // Linea di separazione con più spazio
    currentY += 15;
    this.doc.line(this.margin, currentY, this.pageWidth - this.margin, currentY);
    
    // IVA e note con più spazio
    currentY += 10;
    this.doc.setFontSize(9);
    this.doc.text('Prestazione sanitaria esente IVA', this.margin + 5, currentY);
    currentY += 8;
    this.doc.text('(Art. 10 n. 18 DPR 633/72)', this.margin + 5, currentY);
  }

  private addTotali(fattura: FatturaData) {
    const startY = this.margin + 280;
    const rightX = this.pageWidth - this.margin - 50;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    let currentY = startY;
    
    // Subtotale
    this.doc.text('Subtotale:', rightX - 40, currentY);
    this.doc.text(`€ ${fattura.importo.toFixed(2)}`, rightX, currentY);
    
    // IVA
    currentY += 12;
    this.doc.text('IVA (0%):', rightX - 40, currentY);
    this.doc.text('€ 0,00', rightX, currentY);
    
    // ENPAP
    if (fattura.enpap > 0) {
      currentY += 12;
      this.doc.text('ENPAP (2%):', rightX - 40, currentY);
      this.doc.text(`€ ${fattura.enpap.toFixed(2)}`, rightX, currentY);
    }
    
    // Linea separatore
    currentY += 15;
    this.doc.line(rightX - 50, currentY, rightX + 20, currentY);
    
    // Totale
    currentY += 15;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('TOTALE:', rightX - 40, currentY);
    this.doc.text(`€ ${fattura.totale.toFixed(2)}`, rightX, currentY);
    
    // Metodo pagamento
    currentY += 20;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.text(`Pagamento: ${fattura.metodoPagamento}`, this.margin, currentY);
  }

  private addNoteLegali() {
    const startY = this.pageHeight - 80;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    
    const noteLegali = [
      'INFORMATIVA PRIVACY (Art. 13 Reg. UE 679/2016):',
      'I dati personali raccolti sono trattati per finalità di fatturazione e obblighi fiscali.',
      'Il trattamento è necessario per l\'esecuzione del contratto e per adempimenti legali.',
      'I dati saranno conservati per il tempo previsto dalla normativa fiscale (10 anni).',
      'Il paziente ha diritto di accesso, rettifica, cancellazione e portabilità dei dati.',
      '',
      'Prestazione sanitaria ai sensi dell\'Art. 10 n. 18 DPR 633/72 - IVA non dovuta.',
      'Contributo ENPAP del 2% ai sensi della normativa previdenziale vigente.'
    ];
    
    let currentY = startY;
    noteLegali.forEach(nota => {
      this.doc.text(nota, this.margin, currentY);
      currentY += 5;
    });
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