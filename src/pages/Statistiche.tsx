import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Euro, Users, FileText, Calendar, Download } from "lucide-react";
import { useFatture } from "@/hooks/useFatture";
import { usePazienti } from "@/hooks/usePazienti";
import { usePrestazioni } from "@/hooks/usePrestazioni";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { it } from "date-fns/locale";
import { useMemo } from "react";

export default function Statistiche() {
  const { fatture, stats: fattureStats } = useFatture();
  const { pazienti } = usePazienti();
  const { prestazioni } = usePrestazioni();

  // Calcoli per statistiche reali
  const currentYear = new Date().getFullYear();
  
  // Fatturato mensile degli ultimi 12 mesi basato su dati reali
  const fatturatoMensile = useMemo(() => {
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const fattureDelMese = fatture.filter(f => {
        const dataFattura = new Date(f.data_fattura);
        return dataFattura >= monthStart && dataFattura <= monthEnd;
      });
      
      const importo = fattureDelMese.reduce((sum, f) => sum + Number(f.totale), 0);
      const altezza = Math.max(4, (importo / 100)); // Scala per visualizzazione
      
      monthlyData.push({
        mese: format(date, "MMM", { locale: it }),
        importo: importo,
        altezza: Math.min(altezza, 60) // Massimo 60px
      });
    }
    return monthlyData;
  }, [fatture]);

  // Distribuzione prestazioni basata su dati reali
  const prestazioniDistribuzione = useMemo(() => {
    const prestazioniFatture = fatture
      .flatMap(f => f.righe_fattura || [])
      .filter(r => r.prestazione);

    const totale = prestazioniFatture.length;
    if (totale === 0) return [];

    const distribuzione = new Map();
    prestazioniFatture.forEach(riga => {
      const nome = riga.prestazione?.nome || 'Altro';
      distribuzione.set(nome, (distribuzione.get(nome) || 0) + 1);
    });

    const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-destructive', 'bg-psychology'];
    
    return Array.from(distribuzione.entries())
      .map(([nome, count], index) => ({
        nome,
        valore: Math.round((count / totale) * 100),
        colore: colors[index % colors.length]
      }))
      .sort((a, b) => b.valore - a.valore)
      .slice(0, 4);
  }, [fatture]);

  // Statistiche annuali
  const fatturatoAnnuale = fatture
    .filter(f => new Date(f.data_fattura).getFullYear() === currentYear)
    .reduce((sum, f) => sum + Number(f.totale), 0);

  const prezzoMedioSeduta = fatture.length > 0 
    ? fatture.reduce((sum, f) => sum + Number(f.totale), 0) / fatture.length 
    : 0;

  const fatturePagate = fatture.filter(f => f.stato === 'pagata').length;
  const percentualePagate = fatture.length > 0 ? Math.round((fatturePagate / fatture.length) * 100) : 0;

  const daIncassare = fatture
    .filter(f => f.stato === 'inviata' || f.stato === 'scaduta')
    .reduce((sum, f) => sum + Number(f.totale), 0);

  const fattureScadute = fatture.filter(f => f.stato === 'scaduta').length;

  const generaReport = () => {
    // Implementazione futura per l'export
    // TODO: Implementare export report
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Statistiche e Report</h1>
            <p className="text-muted-foreground">
              Analisi dettagliate della tua attività professionale
            </p>
          </div>
          <Button onClick={generaReport} className="medical-gradient text-primary-foreground hover:opacity-90">
            <Download className="mr-2 h-4 w-4" />
            Esporta Report
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-medical">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Euro className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fatturato Anno</p>
                  <p className="text-2xl font-bold text-foreground">€ {fatturatoAnnuale.toFixed(2)}</p>
                  <p className="text-xs text-success">{currentYear}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-medical">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pazienti Totali</p>
                  <p className="text-2xl font-bold text-foreground">{pazienti.length}</p>
                  <p className="text-xs text-success">Registrati</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-medical">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fatture Emesse</p>
                  <p className="text-2xl font-bold text-foreground">{fatture.length}</p>
                  <p className="text-xs text-success">Totali</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-medical">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-psychology/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-psychology" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prestazioni Attive</p>
                  <p className="text-2xl font-bold text-foreground">{prestazioni.filter(p => p.attiva).length}</p>
                  <p className="text-xs text-muted-foreground">Disponibili</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Fatturato Mensile */}
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Fatturato Mensile 2024
              </CardTitle>
              <CardDescription>
                Andamento del fatturato negli ultimi 12 mesi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end justify-between h-48 gap-2">
                  {fatturatoMensile.map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-1 flex-1">
                      <div className="text-xs text-muted-foreground">€{(item.importo/100).toFixed(0)}k</div>
                      <div 
                        className="bg-primary rounded-t w-full min-h-[4px] transition-all duration-300 hover:bg-primary-hover"
                        style={{ height: `${item.altezza * 2}px` }}
                      ></div>
                      <div className="text-xs font-medium">{item.mese}</div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Fatturato mensile in migliaia di euro</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribuzione Prestazioni */}
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle>Distribuzione Prestazioni</CardTitle>
              <CardDescription>
                Percentuale delle diverse tipologie di sedute
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prestazioniDistribuzione.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.nome}</span>
                      <span className="text-sm font-bold">{item.valore}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${item.colore} transition-all duration-500`}
                        style={{ width: `${item.valore}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">Distribuzione tipologie di prestazioni</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Trend Pazienti */}
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle>Crescita Pazienti</CardTitle>
              <CardDescription>
                Nuovi pazienti e totale nel tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{pazienti.length}</div>
                    <div className="text-sm text-muted-foreground">Pazienti Totali</div>
                    <div className="text-xs text-success">{currentYear}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{fatture.length}</div>
                    <div className="text-sm text-muted-foreground">Fatture Emesse</div>
                    <div className="text-xs text-muted-foreground">Totali</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Crescita attività</span>
                    <span className="font-medium text-success">+{Math.round((pazienti.length / 12) * 10) / 10}/mese</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: `${Math.min(pazienti.length * 2, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metriche Dettagliate */}
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle>Metriche Dettagliate</CardTitle>
              <CardDescription>
                Analisi approfondita della performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Prezzo Medio</p>
                  <p className="text-xl font-bold text-primary">€ {prezzoMedioSeduta.toFixed(0)}</p>
                </div>
                <div className="p-3 bg-success/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Fatture Pagate</p>
                  <p className="text-xl font-bold text-success">{percentualePagate}%</p>
                </div>
                <div className="p-3 bg-warning/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Da Incassare</p>
                  <p className="text-xl font-bold text-warning">€ {daIncassare.toFixed(0)}</p>
                </div>
                <div className="p-3 bg-destructive/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Scadute</p>
                  <p className="text-xl font-bold text-destructive">{fattureScadute}</p>
                </div>
              </div>
              
              {prestazioni.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Top Prestazioni</h4>
                  <div className="space-y-2">
                    {prestazioni.slice(0, 3).map((prestazione, index) => (
                      <div key={prestazione.id} className="flex justify-between items-center">
                        <span className="text-sm">{prestazione.nome}</span>
                        <span className="font-medium">€ {Number(prestazione.prezzo_unitario).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-medical bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Fatturato {currentYear}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Totale Anno:</span>
                <span className="font-medium">€ {fatturatoAnnuale.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Indicativo:</span>
                <span className="font-medium">€ 60.000</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min((fatturatoAnnuale / 60000) * 100, 100)}%` }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medical bg-success/5 border-success/20">
            <CardHeader>
              <CardTitle className="text-success">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Fatture Pagate:</span>
                <span className="font-medium">{percentualePagate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Fatture Totali:</span>
                <span className="font-medium">{fatture.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Pazienti Attivi:</span>
                <span className="font-medium">{pazienti.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medical bg-warning/5 border-warning/20">
            <CardHeader>
              <CardTitle className="text-warning">Da Monitorare</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Fatture Scadute:</span>
                <span className="font-medium">{fattureScadute}</span>
              </div>
              <div className="flex justify-between">
                <span>Da Incassare:</span>
                <span className="font-medium">€ {daIncassare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>In Attesa:</span>
                <span className="font-medium">{fatture.filter(f => f.stato === 'inviata').length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}