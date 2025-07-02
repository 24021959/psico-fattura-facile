import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Plus, Search, Euro, Clock, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PrestazioneForm } from "@/components/forms/PrestazioneForm";

export default function Prestazioni() {
  const prestazioni = [
    {
      id: "1",
      codice: "93.29.10",
      nome: "Seduta Individuale",
      descrizione: "Consulenza psicologica individuale di 50 minuti",
      prezzo: 80,
      durata: 50,
      categoria: "Individuale",
      ivaEsente: true,
      cassePrevidenziali: true
    },
    {
      id: "2", 
      codice: "93.29.20",
      nome: "Seduta di Coppia",
      descrizione: "Terapia di coppia e consulenza familiare di 90 minuti",
      prezzo: 120,
      durata: 90,
      categoria: "Coppia",
      ivaEsente: true,
      cassePrevidenziali: true
    },
    {
      id: "3",
      codice: "93.29.30", 
      nome: "Consulenza Online",
      descrizione: "Seduta psicologica tramite videochiamata di 50 minuti",
      prezzo: 70,
      durata: 50,
      categoria: "Online",
      ivaEsente: true,
      cassePrevidenziali: true
    },
    {
      id: "4",
      codice: "93.29.40",
      nome: "Prima Visita",
      descrizione: "Primo colloquio conoscitivo e anamnesi di 90 minuti",
      prezzo: 100,
      durata: 90,
      categoria: "Valutazione",
      ivaEsente: true,
      cassePrevidenziali: true
    },
    {
      id: "5",
      codice: "93.29.50",
      nome: "Test Psicodiagnostici",
      descrizione: "Somministrazione e refertazione test psicologici",
      prezzo: 150,
      durata: 120,
      categoria: "Valutazione",
      ivaEsente: true,
      cassePrevidenziali: true
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestione Prestazioni</h1>
            <p className="text-muted-foreground">
              Configura le tipologie di prestazioni e i relativi prezzi
            </p>
          </div>
          <PrestazioneForm />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-medical">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Totale Prestazioni</p>
                  <p className="text-2xl font-bold text-foreground">{prestazioni.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-medical">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Euro className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prezzo Medio</p>
                  <p className="text-2xl font-bold text-foreground">€ 104</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-medical">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durata Media</p>
                  <p className="text-2xl font-bold text-foreground">76 min</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-medical">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-psychology/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-psychology" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Più Richiesta</p>
                  <p className="text-lg font-bold text-foreground">Individuale</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-medical">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca prestazioni per nome, codice o categoria..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                Filtri
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prestazioni List */}
        <div className="grid gap-4">
          {prestazioni.map((prestazione) => (
            <Card key={prestazione.id} className="shadow-medical hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{prestazione.nome}</h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            Codice: {prestazione.codice}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">€ {prestazione.prezzo}</p>
                          <p className="text-sm text-muted-foreground">{prestazione.durata} minuti</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {prestazione.descrizione}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          {prestazione.categoria}
                        </Badge>
                        {prestazione.ivaEsente && (
                          <Badge variant="outline" className="border-success/50 text-success">
                            IVA Esente
                          </Badge>
                        )}
                        {prestazione.cassePrevidenziali && (
                          <Badge variant="outline" className="border-warning/50 text-warning">
                            ENPAP 2%
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Normativa: Art. 10 n. 18 DPR 633/72 - Prestazioni sanitarie esenti IVA
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <PrestazioneForm 
                      prestazione={prestazione}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="shadow-medical bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary">
              Informazioni Normative
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>IVA Esente:</strong> Le prestazioni sanitarie sono esenti IVA secondo l'Art. 10 n. 18 DPR 633/72</p>
            <p><strong>Cassa Previdenziale:</strong> ENPAP 2% per psicologi, calcolabile separatamente o inclusa nel prezzo</p>
            <p><strong>Codici Prestazione:</strong> Utilizzare i codici del nomenclatore tariffario per la classificazione</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}