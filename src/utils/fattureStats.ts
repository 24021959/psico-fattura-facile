import type { FatturaDettagliata, FatturaStats } from '@/types/fattura';

export function calculateFattureStats(fatture: FatturaDettagliata[]): FatturaStats {
  return {
    totale: fatture.length,
    fatturato: fatture.reduce((sum, f) => sum + Number(f.totale), 0),
    daIncassare: fatture
      .filter(f => f.stato === 'inviata' || f.stato === 'scaduta')
      .reduce((sum, f) => sum + Number(f.totale), 0),
    scadute: fatture.filter(f => f.stato === 'scaduta').length,
    pagate: fatture.filter(f => f.stato === 'pagata').length
  };
}