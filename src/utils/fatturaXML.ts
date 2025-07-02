interface FatturaXMLData {
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
    provincia?: string;
    nazione?: string;
    codiceDestinatario?: string;
    pec?: string;
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

interface ProfessionistaXMLData {
  nome: string;
  cognome: string;
  codiceFiscale: string;
  partitaIva: string;
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  nazione: string;
  telefono?: string;
  email?: string;
  pec?: string;
  codiceDestinatario?: string;
  regimeFiscale: string;
}

export class FatturaXMLGenerator {
  private progressivoInvio: number;

  constructor() {
    // Progressivo univoco per l'invio - in produzione dovrebbe essere gestito dal database
    this.progressivoInvio = Math.floor(Math.random() * 99999) + 1;
  }

  generateXML(fattura: FatturaXMLData, professionista: ProfessionistaXMLData): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica versione="FPR12" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2 http://www.fatturapa.gov.it/export/fatturazione/sdi/fatturapa/v1.2/Schema_del_file_xml_FatturaPA_versione_1.2.xsd">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>${professionista.partitaIva}</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>${this.progressivoInvio.toString().padStart(5, '0')}</ProgressivoInvio>
      <FormatoTrasmissione>FPR12</FormatoTrasmissione>
      <CodiceDestinatario>${fattura.paziente.codiceDestinatario || '0000000'}</CodiceDestinatario>
      ${fattura.paziente.pec ? `<PECDestinatario>${fattura.paziente.pec}</PECDestinatario>` : ''}
    </DatiTrasmissione>
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>${professionista.partitaIva}</IdCodice>
        </IdFiscaleIVA>
        <CodiceFiscale>${professionista.codiceFiscale}</CodiceFiscale>
        <Anagrafica>
          <Nome>${this.escapeXML(professionista.nome)}</Nome>
          <Cognome>${this.escapeXML(professionista.cognome)}</Cognome>
        </Anagrafica>
        <RegimeFiscale>${professionista.regimeFiscale}</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>${this.escapeXML(professionista.indirizzo)}</Indirizzo>
        <CAP>${professionista.cap}</CAP>
        <Comune>${this.escapeXML(professionista.citta)}</Comune>
        <Provincia>${professionista.provincia}</Provincia>
        <Nazione>${professionista.nazione}</Nazione>
      </Sede>
      ${this.buildContattiCedente(professionista)}
    </CedentePrestatore>
    <CessionarioCommittente>
      <DatiAnagrafici>
        <CodiceFiscale>${fattura.paziente.codiceFiscale}</CodiceFiscale>
        <Anagrafica>
          <Nome>${this.escapeXML(fattura.paziente.nome)}</Nome>
          <Cognome>${this.escapeXML(fattura.paziente.cognome)}</Cognome>
        </Anagrafica>
      </DatiAnagrafici>
      ${this.buildSedeCessionario(fattura.paziente)}
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>${this.formatDate(fattura.data)}</Data>
        <Numero>${fattura.numero}/${fattura.anno}</Numero>
        <ImportoTotaleDocumento>${fattura.totale.toFixed(2)}</ImportoTotaleDocumento>
        <Causale>Prestazione sanitaria - ${this.escapeXML(fattura.prestazione.nome)}</Causale>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    <DatiBeniServizi>
      <DettaglioLinee>
        <NumeroLinea>1</NumeroLinea>
        <Descrizione>${this.escapeXML(fattura.prestazione.nome)} - Codice: ${fattura.prestazione.codice}</Descrizione>
        <Quantita>1.00</Quantita>
        <PrezzoUnitario>${fattura.importo.toFixed(2)}</PrezzoUnitario>
        <PrezzoTotale>${fattura.importo.toFixed(2)}</PrezzoTotale>
        <AliquotaIVA>0.00</AliquotaIVA>
        <Natura>N2</Natura>
        <RiferimentoNormativo>Art. 10 n. 18 DPR 633/72 - Prestazioni sanitarie</RiferimentoNormativo>
      </DettaglioLinee>
      ${this.buildDettaglioENPAP(fattura)}
      <DatiRiepilogo>
        <AliquotaIVA>0.00</AliquotaIVA>
        <Natura>N2</Natura>
        <ImponibileImporto>${fattura.importo.toFixed(2)}</ImponibileImporto>
        <Imposta>0.00</Imposta>
        <EsigibilitaIVA>I</EsigibilitaIVA>
        <RiferimentoNormativo>Art. 10 n. 18 DPR 633/72</RiferimentoNormativo>
      </DatiRiepilogo>
    </DatiBeniServizi>
    <DatiPagamento>
      <CondizioniPagamento>TP02</CondizioniPagamento>
      <DettaglioPagamento>
        <ModalitaPagamento>${this.getModalitaPagamentoSDI(fattura.metodoPagamento)}</ModalitaPagamento>
        <ImportoPagamento>${fattura.totale.toFixed(2)}</ImportoPagamento>
      </DettaglioPagamento>
    </DatiPagamento>
    ${this.buildAllegati()}
  </FatturaElettronicaBody>
</p:FatturaElettronica>`;

    return xml;
  }

  private buildContattiCedente(professionista: ProfessionistaXMLData): string {
    if (!professionista.telefono && !professionista.email) return '';
    
    return `<Contatti>
        ${professionista.telefono ? `<Telefono>${professionista.telefono}</Telefono>` : ''}
        ${professionista.email ? `<Email>${professionista.email}</Email>` : ''}
      </Contatti>`;
  }

  private buildSedeCessionario(paziente: FatturaXMLData['paziente']): string {
    if (!paziente.indirizzo) return '';
    
    return `<Sede>
        <Indirizzo>${this.escapeXML(paziente.indirizzo || 'Non specificato')}</Indirizzo>
        <CAP>${paziente.cap || '00000'}</CAP>
        <Comune>${this.escapeXML(paziente.citta || 'Non specificato')}</Comune>
        <Provincia>${paziente.provincia || 'XX'}</Provincia>
        <Nazione>${paziente.nazione || 'IT'}</Nazione>
      </Sede>`;
  }

  private buildDettaglioENPAP(fattura: FatturaXMLData): string {
    if (fattura.enpap <= 0) return '';
    
    return `<DettaglioLinee>
        <NumeroLinea>2</NumeroLinea>
        <Descrizione>Contributo ENPAP 2%</Descrizione>
        <Quantita>1.00</Quantita>
        <PrezzoUnitario>${fattura.enpap.toFixed(2)}</PrezzoUnitario>
        <PrezzoTotale>${fattura.enpap.toFixed(2)}</PrezzoTotale>
        <AliquotaIVA>0.00</AliquotaIVA>
        <Natura>N2</Natura>
        <RiferimentoNormativo>Contributo previdenziale ENPAP</RiferimentoNormativo>
      </DettaglioLinee>`;
  }

  private buildAllegati(): string {
    return `<Allegati>
      <NomeAttachment>Informativa_Privacy.pdf</NomeAttachment>
      <AlgoritmoCompressione>None</AlgoritmoCompressione>
      <FormatoAttachment>PDF</FormatoAttachment>
      <DescrizioneAttachment>Informativa Privacy GDPR</DescrizioneAttachment>
      <Attachment>UERGIDkRMRiBub3QgaW1wbGVtZW50ZWQgaW4gdGhpcyBkZW1v</Attachment>
    </Allegati>`;
  }

  private getModalitaPagamentoSDI(metodoPagamento: string): string {
    const mappingPagamenti: { [key: string]: string } = {
      'Contanti': 'MP01',
      'Bonifico Bancario': 'MP05',
      'Carta di Credito': 'MP08',
      'Assegno': 'MP02',
      'POS': 'MP08',
      'Paypal': 'MP08'
    };
    
    return mappingPagamenti[metodoPagamento] || 'MP05';
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

// Funzione helper per generare e scaricare XML
export async function generaEScaricaXML(fattura: FatturaXMLData) {
  // Dati professionista mock - in un'app reale verrebbero da impostazioni utente
  const professionista: ProfessionistaXMLData = {
    nome: "Maria",
    cognome: "Rossi",
    codiceFiscale: "RSSMRA80A01H501Z",
    partitaIva: "12345678901",
    indirizzo: "Via Roma, 123",
    citta: "Milano",
    cap: "20100",
    provincia: "MI",
    nazione: "IT",
    telefono: "+39 02 1234567",
    email: "maria.rossi@psicologo.it",
    pec: "maria.rossi@pec.psicologo.it",
    regimeFiscale: "RF19" // Regime forfettario o sostituire con il regime appropriato
  };

  // Aggiungi dati mancanti al paziente
  const fatturaCompleta: FatturaXMLData = {
    ...fattura,
    paziente: {
      ...fattura.paziente,
      provincia: fattura.paziente.provincia || "MI",
      nazione: fattura.paziente.nazione || "IT",
      codiceDestinatario: fattura.paziente.codiceDestinatario || "0000000"
    }
  };
  
  const generator = new FatturaXMLGenerator();
  const xmlContent = generator.generateXML(fatturaCompleta, professionista);
  
  // Crea il blob e scarica
  const blob = new Blob([xmlContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `IT${professionista.partitaIva}_${String(Date.now()).slice(-5)}.xml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Funzione per validare XML SDI
export function validaXMLSDI(xmlContent: string): { valido: boolean; errori: string[] } {
  const errori: string[] = [];
  
  // Validazioni base
  if (!xmlContent.includes('FatturaElettronica')) {
    errori.push('Struttura XML FatturaElettronica non trovata');
  }
  
  if (!xmlContent.includes('DatiTrasmissione')) {
    errori.push('Sezione DatiTrasmissione mancante');
  }
  
  if (!xmlContent.includes('CedentePrestatore')) {
    errori.push('Sezione CedentePrestatore mancante');
  }
  
  if (!xmlContent.includes('CessionarioCommittente')) {
    errori.push('Sezione CessionarioCommittente mancante');
  }
  
  if (!xmlContent.includes('DatiGeneraliDocumento')) {
    errori.push('Sezione DatiGeneraliDocumento mancante');
  }
  
  if (!xmlContent.includes('DatiBeniServizi')) {
    errori.push('Sezione DatiBeniServizi mancante');
  }
  
  return {
    valido: errori.length === 0,
    errori
  };
}