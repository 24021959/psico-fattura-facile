import { Euro, Users, FileText, TrendingUp, Calendar, Clock, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FatturaForm } from "@/components/forms/FatturaForm";
import { useFatture } from "@/hooks/useFatture";
import { usePazienti } from "@/hooks/usePazienti";
import { usePrestazioni } from "@/hooks/usePrestazioni";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const { fatture, stats: fattureStats, loading: fattureLoading } = useFatture();
  const { pazienti, loading: pazientiLoading } = usePazienti();
  const { prestazioni, loading: prestazioniLoading } = usePrestazioni();

  // Calcoli per statistiche aggiornate
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const fattureMensili = fatture.filter(f => {
    const dataFattura = new Date(f.data_fattura);
    return dataFattura.getMonth() === currentMonth && dataFattura.getFullYear() === currentYear;
  });

  const fatturato = fattureMensili.reduce((sum, f) => sum + Number(f.totale), 0);
  const prestazioniAttive = prestazioni.filter(p => p.attiva).length;
  
  // Ultime fatture per attività recenti
  const ultimeFatture = fatture.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Panoramica della tua attività professionale
          </p>
        </div>
        <FatturaForm trigger={
          <Button className="medical-gradient text-primary-foreground hover:opacity-90">
            Nuova Fattura
          </Button>
        } />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Fatturato Mensile"
          value={`€ ${fatturato.toFixed(2)}`}
          subtitle={format(new Date(), "MMMM yyyy", { locale: it })}
          icon={Euro}
          variant="primary"
        />
        <StatsCard
          title="Pazienti Totali"
          value={pazienti.length.toString()}
          subtitle="Pazienti registrati"
          icon={Users}
          variant="success"
        />
        <StatsCard
          title="Fatture Emesse"
          value={fattureMensili.length.toString()}
          subtitle={format(new Date(), "MMMM yyyy", { locale: it })}
          icon={FileText}
        />
        <StatsCard
          title="Prestazioni Attive"
          value={prestazioniAttive.toString()}
          subtitle="Servizi disponibili"
          icon={Calendar}
          variant="warning"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Attività Recenti
            </CardTitle>
            <CardDescription>
              Le tue ultime operazioni
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ultimeFatture.length > 0 ? (
              ultimeFatture.map((fattura) => (
                <div key={fattura.id} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    fattura.stato === 'pagata' ? 'bg-success' : 
                    fattura.stato === 'inviata' ? 'bg-primary' : 
                    fattura.stato === 'scaduta' ? 'bg-destructive' : 'bg-warning'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Fattura #{fattura.numero_fattura} {fattura.stato === 'pagata' ? 'pagata' : 'creata'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fattura.paziente?.nome} {fattura.paziente?.cognome} • 
                      {format(new Date(fattura.created_at), "dd/MM/yyyy", { locale: it })}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">€ {Number(fattura.totale).toFixed(2)}</span>
                  {fattura.stato === 'pagata' && <CheckCircle className="h-4 w-4 text-success" />}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nessuna attività recente</p>
                <p className="text-xs">Crea la tua prima fattura per iniziare</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Azioni Rapide
            </CardTitle>
            <CardDescription>
              Operazioni frequenti per la tua attività
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FatturaForm trigger={
              <Button variant="outline" className="w-full justify-start" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Crea Nuova Fattura
              </Button>
            } />
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
              onClick={() => navigate('/pazienti')}
            >
              <Users className="mr-2 h-5 w-5" />
              Aggiungi Paziente
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
              onClick={() => navigate('/prestazioni')}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Gestisci Prestazioni
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
              onClick={() => navigate('/statistiche')}
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Visualizza Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Prestazioni Più Frequenti */}
      <Card className="shadow-medical">
        <CardHeader>
          <CardTitle>Prestazioni Più Frequenti</CardTitle>
          <CardDescription>
            Le tipologie di sedute più richieste dai tuoi pazienti
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prestazioni.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {prestazioni.slice(0, 3).map((prestazione, index) => {
                const utilizzo = Math.max(20, Math.random() * 80); // Simula utilizzo
                return (
                  <div key={prestazione.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{prestazione.nome}</h4>
                      <span className="text-sm font-medium text-primary">
                        €{Number(prestazione.prezzo_unitario).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {prestazione.descrizione || "Prestazione sanitaria"}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-muted rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-primary' : 
                            index === 1 ? 'bg-success' : 'bg-warning'
                          }`} 
                          style={{ width: `${utilizzo.toFixed(0)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {utilizzo.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nessuna prestazione configurata</p>
              <p className="text-xs">Aggiungi le tue prestazioni per visualizzare le statistiche</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}