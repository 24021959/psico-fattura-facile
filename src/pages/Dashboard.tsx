import { Euro, Users, FileText, TrendingUp, Calendar, Clock, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
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
        <Button className="medical-gradient text-primary-foreground hover:opacity-90">
          Nuova Fattura
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Fatturato Mensile"
          value="€ 4.250"
          subtitle="Dicembre 2024"
          icon={Euro}
          variant="primary"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Pazienti Attivi"
          value="24"
          subtitle="Questo mese"
          icon={Users}
          variant="success"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Fatture Emesse"
          value="18"
          subtitle="Dicembre 2024"
          icon={FileText}
          trend={{ value: 15.0, isPositive: true }}
        />
        <StatsCard
          title="Sedute Programmate"
          value="32"
          subtitle="Prossimi 7 giorni"
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
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-success rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Fattura #2024-045 creata</p>
                <p className="text-xs text-muted-foreground">Paziente: Maria Bianchi • 2 ore fa</p>
              </div>
              <span className="text-sm font-medium text-success">€ 80</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nuovo paziente aggiunto</p>
                <p className="text-xs text-muted-foreground">Giuseppe Verdi • 4 ore fa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-warning rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Seduta completata</p>
                <p className="text-xs text-muted-foreground">Anna Rossi • 6 ore fa</p>
              </div>
              <span className="text-sm font-medium text-primary">€ 90</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-success rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Fattura #2024-044 pagata</p>
                <p className="text-xs text-muted-foreground">Marco Neri • 1 giorno fa</p>
              </div>
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
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
            <Button variant="outline" className="w-full justify-start" size="lg">
              <FileText className="mr-2 h-5 w-5" />
              Crea Nuova Fattura
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Users className="mr-2 h-5 w-5" />
              Aggiungi Paziente
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Calendar className="mr-2 h-5 w-5" />
              Prenota Seduta
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Seduta Individuale</h4>
                <span className="text-sm font-medium text-primary">€ 80</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Consulenza psicologica individuale
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-muted rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: "85%" }}></div>
                </div>
                <span className="text-xs text-muted-foreground">85%</span>
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Seduta di Coppia</h4>
                <span className="text-sm font-medium text-primary">€ 120</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Terapia di coppia e familiare
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-muted rounded-full">
                  <div className="h-2 bg-success rounded-full" style={{ width: "65%" }}></div>
                </div>
                <span className="text-xs text-muted-foreground">65%</span>
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Consulenza Online</h4>
                <span className="text-sm font-medium text-primary">€ 70</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Seduta tramite videochiamata
              </p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-muted rounded-full">
                  <div className="h-2 bg-warning rounded-full" style={{ width: "45%" }}></div>
                </div>
                <span className="text-xs text-muted-foreground">45%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}