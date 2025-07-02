import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Euro, Users, FileText, Calendar, Download } from "lucide-react";

export default function Statistiche() {
  // Mock data per i grafici
  const fatturatoMensile = [
    { mese: 'Gen', importo: 3200 },
    { mese: 'Feb', importo: 3800 },
    { mese: 'Mar', importo: 4100 },
    { mese: 'Apr', importo: 3900 },
    { mese: 'Mag', importo: 4500 },
    { mese: 'Giu', importo: 4200 },
    { mese: 'Lug', importo: 3800 },
    { mese: 'Ago', importo: 3200 },
    { mese: 'Set', importo: 4800 },
    { mese: 'Ott', importo: 5100 },
    { mese: 'Nov', importo: 4900 },
    { mese: 'Dic', importo: 4250 }
  ];

  const prestazioniDistribuzione = [
    { nome: 'Seduta Individuale', valore: 45, colore: '#007BFF' },
    { nome: 'Seduta di Coppia', valore: 25, colore: '#28A745' },
    { nome: 'Consulenza Online', valore: 20, colore: '#FFC107' },
    { nome: 'Prima Visita', valore: 10, colore: '#DC3545' }
  ];

  const pazientiTrend = [
    { mese: 'Gen', nuovi: 3, totali: 18 },
    { mese: 'Feb', nuovi: 5, totali: 23 },
    { mese: 'Mar', nuovi: 2, totali: 25 },
    { mese: 'Apr', nuovi: 4, totali: 29 },
    { mese: 'Mag', nuovi: 6, totali: 35 },
    { mese: 'Giu', nuovi: 3, totali: 38 }
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fatturatoMensile}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mese" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`€ ${value}`, 'Fatturato']} />
                  <Bar dataKey="importo" fill="#007BFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={prestazioniDistribuzione}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, valore }) => `${nome}: ${valore}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="valore"
                  >
                    {prestazioniDistribuzione.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.colore} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={pazientiTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mese" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="nuovi" stroke="#28A745" strokeWidth={2} name="Nuovi" />
                  <Line type="monotone" dataKey="totali" stroke="#007BFF" strokeWidth={2} name="Totali" />
                </LineChart>
              </ResponsiveContainer>
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