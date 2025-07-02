import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Search, Download, Eye, Calendar, Euro, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FatturaForm } from "@/components/forms/FatturaForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Fatture() {
  const fatture = [
    {
      id: "2024-045",
      numero: "045",
      anno: "2024",
      data: "2024-12-15",
      paziente: {
        nome: "Maria",
        cognome: "Bianchi",
        codiceFiscale: "BNCMRA85T65H501Z"
      },
      prestazione: {
        nome: "Seduta Individuale",
        codice: "93.29.10"
      },
      importo: 80.00,
      enpap: 1.60,
      totale: 81.60,
      stato: "pagata",
      metodoPagamento: "Bonifico"
    },
    {
      id: "2024-044", 
      numero: "044",
      anno: "2024",
      data: "2024-12-12",
      paziente: {
        nome: "Giuseppe",
        cognome: "Verdi", 
        codiceFiscale: "VRDGPP75L12F205K"
      },
      prestazione: {
        nome: "Seduta di Coppia",
        codice: "93.29.20"
      },
      importo: 120.00,
      enpap: 2.40,
      totale: 122.40,
      stato: "emessa",
      metodoPagamento: "Contanti"
    },
    {
      id: "2024-043",
      numero: "043", 
      anno: "2024",
      data: "2024-12-10",
      paziente: {
        nome: "Anna",
        cognome: "Rossi",
        codiceFiscale: "RSSANN90P45B963L"
      },
      prestazione: {
        nome: "Prima Visita",
        codice: "93.29.40"
      },
      importo: 100.00,
      enpap: 2.00,
      totale: 102.00,
      stato: "scaduta",
      metodoPagamento: "Bonifico"
    }
  ];

  const getStatoBadgeVariant = (stato: string) => {
    switch (stato) {
      case "pagata": return "default";
      case "emessa": return "secondary"; 
      case "scaduta": return "destructive";
      default: return "outline";
    }
  };

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case "pagata": return "text-success";
      case "emessa": return "text-warning";
      case "scaduta": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestione Fatture</h1>
            <p className="text-muted-foreground">
              Crea e gestisci le fatture sanitarie per i tuoi pazienti
            </p>
          </div>
          <FatturaForm />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-medical">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Totale Fatture</p>
                  <p className="text-2xl font-bold text-foreground">{fatture.length}</p>
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
                  <p className="text-sm text-muted-foreground">Fatturato Totale</p>
                  <p className="text-2xl font-bold text-foreground">€ 306</p>
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
                  <p className="text-sm text-muted-foreground">Da Incassare</p>
                  <p className="text-2xl font-bold text-foreground">€ 224</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-medical">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scadute</p>
                  <p className="text-2xl font-bold text-foreground">1</p>
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
                  placeholder="Cerca per numero fattura, paziente o prestazione..."
                  className="pl-10"
                />
              </div>
              <Select defaultValue="tutti">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti gli stati</SelectItem>
                  <SelectItem value="emessa">Emesse</SelectItem>
                  <SelectItem value="pagata">Pagate</SelectItem>
                  <SelectItem value="scaduta">Scadute</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="2024">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Fatture List */}
        <div className="grid gap-4">
          {fatture.map((fattura) => (
            <Card key={fattura.id} className="shadow-medical hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">
                            Fattura #{fattura.numero}/{fattura.anno}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {new Date(fattura.data).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">€ {fattura.totale.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            (ENPAP: € {fattura.enpap.toFixed(2)})
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium text-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {fattura.paziente.nome} {fattura.paziente.cognome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            CF: {fattura.paziente.codiceFiscale}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {fattura.prestazione.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Codice: {fattura.prestazione.codice}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getStatoBadgeVariant(fattura.stato)} className={getStatoColor(fattura.stato)}>
                          {fattura.stato.charAt(0).toUpperCase() + fattura.stato.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="border-muted text-muted-foreground">
                          {fattura.metodoPagamento}
                        </Badge>
                        <Badge variant="outline" className="border-success/50 text-success">
                          IVA Esente
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Art. 10 n. 18 DPR 633/72 - Prestazione sanitaria esente IVA
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-1 h-3 w-3" />
                      Visualizza
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        import('../utils/fatturaPDF').then(({ generaEScaricaPDF }) => {
                          generaEScaricaPDF(fattura);
                        });
                      }}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-1 h-3 w-3" />
                      XML
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
              Informazioni Fatturazione Sanitaria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Numerazione:</strong> Le fatture seguono numerazione progressiva annuale</p>
            <p><strong>Conservazione:</strong> Obbligo di conservazione per 10 anni (DPR 633/72)</p>
            <p><strong>SDI:</strong> Sistema di Interscambio per fatturazione elettronica (opzionale per prestazioni sanitarie)</p>
            <p><strong>GDPR:</strong> Tutte le fatture includono informativa privacy per dati sanitari</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}