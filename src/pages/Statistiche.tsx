import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Euro, Users, FileText, Calendar, Download } from "lucide-react";

export default function Statistiche() {
  // Mock data per i grafici
  const fatturatoMensile = [
    { mese: 'Gen', importo: 3200, altezza: 32 },
    { mese: 'Feb', importo: 3800, altezza: 38 },
    { mese: 'Mar', importo: 4100, altezza: 41 },
    { mese: 'Apr', importo: 3900, altezza: 39 },
    { mese: 'Mag', importo: 4500, altezza: 45 },
    { mese: 'Giu', importo: 4200, altezza: 42 },
    { mese: 'Lug', importo: 3800, altezza: 38 },
    { mese: 'Ago', importo: 3200, altezza: 32 },
    { mese: 'Set', importo: 4800, altezza: 48 },
    { mese: 'Ott', importo: 5100, altezza: 51 },
    { mese: 'Nov', importo: 4900, altezza: 49 },
    { mese: 'Dic', importo: 4250, altezza: 42 }
  ];

  const prestazioniDistribuzione = [
    { nome: 'Seduta Individuale', valore: 45, colore: 'bg-primary' },
    { nome: 'Seduta di Coppia', valore: 25, colore: 'bg-success' },
    { nome: 'Consulenza Online', valore: 20, colore: 'bg-warning' },
    { nome: 'Prima Visita', valore: 10, colore: 'bg-destructive' }
  ];

  const generaReport = () => {
    // Simula generazione report
    console.log("Generazione report...");
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
                  <p className="text-2xl font-bold text-foreground">€ 52.800</p>
                  <p className="text-xs text-success">+12.5% vs 2023</p>
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
                  <p className="text-sm text-muted-foreground">Pazienti Attivi</p>
                  <p className="text-2xl font-bold text-foreground">38</p>
                  <p className="text-xs text-success">+8 nuovi</p>
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
                  <p className="text-2xl font-bold text-foreground">186</p>
                  <p className="text-xs text-success">+15 questo mese</p>
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
                  <p className="text-sm text-muted-foreground">Sedute/Mese</p>
                  <p className="text-2xl font-bold text-foreground">32</p>
                  <p className="text-xs text-muted-foreground">Media 2024</p>
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
                    <div className="text-2xl font-bold text-primary">+21</div>
                    <div className="text-sm text-muted-foreground">Nuovi Pazienti</div>
                    <div className="text-xs text-success">2024</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">38</div>
                    <div className="text-sm text-muted-foreground">Totale Attivi</div>
                    <div className="text-xs text-muted-foreground">Dicembre</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Crescita mensile media</span>
                    <span className="font-medium text-success">+3.5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: '75%' }}></div>
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
                  <p className="text-sm text-muted-foreground">Prezzo Medio Seduta</p>
                  <p className="text-xl font-bold text-primary">€ 87</p>
                </div>
                <div className="p-3 bg-success/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Tasso Fidelizzazione</p>
                  <p className="text-xl font-bold text-success">92%</p>
                </div>
                <div className="p-3 bg-warning/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Tempo Medio Pagamento</p>
                  <p className="text-xl font-bold text-warning">12 gg</p>
                </div>
                <div className="p-3 bg-psychology/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Sedute per Paziente</p>
                  <p className="text-xl font-bold text-psychology">4.8</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Top Prestazioni</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Seduta Individuale</span>
                    <span className="font-medium">€ 3.600</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Seduta di Coppia</span>
                    <span className="font-medium">€ 3.000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Consulenza Online</span>
                    <span className="font-medium">€ 1.400</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-medical bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Obiettivi 2024</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Fatturato Target:</span>
                <span className="font-medium">€ 60.000</span>
              </div>
              <div className="flex justify-between">
                <span>Progresso:</span>
                <span className="font-medium text-success">88%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '88%' }}></div>
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
                <span className="font-medium">94%</span>
              </div>
              <div className="flex justify-between">
                <span>Sedute Completate:</span>
                <span className="font-medium">186</span>
              </div>
              <div className="flex justify-between">
                <span>Pazienti Attivi:</span>
                <span className="font-medium">38</span>
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
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span>Da Incassare:</span>
                <span className="font-medium">€ 1.240</span>
              </div>
              <div className="flex justify-between">
                <span>Solleciti da Inviare:</span>
                <span className="font-medium">2</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}