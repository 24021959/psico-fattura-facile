// Utility per calcoli fiscali delle fatture sanitarie

export interface FiscalData {
  regime_fiscale: 'RF01' | 'RF19';
  importo_prestazione: number;
  percentuale_enpap: number;
  enpap_a_paziente: boolean;
}

export interface CalcoloFiscale {
  imponibile: number;
  enpap: number;
  bollo: number;
  totale: number;
  frase_legale: string;
  nota_enpap: string;
  nota_bollo?: string;
}

/**
 * Calcola marca da bollo secondo normativa
 * Bollo da 2€ obbligatorio per importi superiori a 77,47€
 */
export function calcolaBollo(importoTotale: number): number {
  return importoTotale > 77.47 ? 2.00 : 0;
}

/**
 * Calcola contributo ENPAP
 */
export function calcolaEnpap(imponibile: number, percentuale: number, aPaziente: boolean): number {
  if (!aPaziente) return 0; // A carico del professionista, non appare in fattura
  return imponibile * percentuale / 100;
}

/**
 * Genera frase legale per esenzione IVA in base al regime fiscale
 */
export function getFraseLegale(regime: 'RF01' | 'RF19'): string {
  switch (regime) {
    case 'RF01':
      return 'Esente IVA ai sensi dell\'art. 10 n. 18 del D.P.R. 633/72';
    case 'RF19':
      return 'Operazione senza applicazione dell\'IVA, effettuata ai sensi dell\'articolo 1, commi da 54 a 89, l. n. 190 del 2014';
    default:
      return 'Prestazione sanitaria esente IVA';
  }
}

/**
 * Calcolo completo delle componenti fiscali di una fattura sanitaria
 */
export function calcolaComponentiFiscali(data: FiscalData): CalcoloFiscale {
  const imponibile = data.importo_prestazione;
  const enpap = calcolaEnpap(imponibile, data.percentuale_enpap, data.enpap_a_paziente);
  
  // Il bollo si calcola sull'importo totale (imponibile + enpap se addebitata al paziente)
  const importoPerBollo = imponibile + enpap;
  const bollo = calcolaBollo(importoPerBollo);
  
  const totale = imponibile + enpap + bollo;
  
  const frase_legale = getFraseLegale(data.regime_fiscale);
  
  const nota_enpap = data.enpap_a_paziente 
    ? `Contributo ENPAP ${data.percentuale_enpap}% come da normativa vigente`
    : `Contributo ENPAP ${data.percentuale_enpap}% a carico del professionista`;
  
  const nota_bollo = bollo > 0 
    ? 'Imposta di bollo da 2 euro assolta sull\'originale per importi maggiori di 77,47 euro'
    : undefined;

  return {
    imponibile,
    enpap,
    bollo,
    totale,
    frase_legale,
    nota_enpap,
    nota_bollo
  };
}

/**
 * Genera le note standard per fattura sanitaria
 */
export function getNoteStandard(regime: 'RF01' | 'RF19'): string {
  const fraseLegale = getFraseLegale(regime);
  
  return `${fraseLegale}.
Prestazione sanitaria di natura professionale.
Opposizione alla trasmissione al Sistema TS del codice fiscale del paziente ai sensi dell'art. 3 D.M. 31/07/2015.
Trattamento dati personali ex art. 9 Reg. UE 679/2016 - GDPR.`;
}