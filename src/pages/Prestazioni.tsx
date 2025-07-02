import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Plus, Search, Euro, Clock, Edit, Trash2, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PrestazioneForm } from "@/components/forms/PrestazioneForm";
import { usePrestazioni } from "@/hooks/usePrestazioni";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Prestazioni() {
  const { prestazioni, loading, searchTerm, setSearchTerm, deletePrestazione, toggleAttiva, stats } = usePrestazioni();
  const handleDeletePrestazione = async (id: string) => {
    await deletePrestazione(id);
  };

  const handleToggleAttiva = async (id: string, currentStatus: boolean) => {
    await toggleAttiva(id, !currentStatus);
  };

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
                  <p className="text-2xl font-bold text-foreground">€ {stats.prezzoMedio.toFixed(0)}</p>
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
                  <p className="text-2xl font-bold text-foreground">{stats.durataMedio.toFixed(0)} min</p>
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
                  <p className="text-sm text-muted-foreground">Prestazioni Attive</p>
                  <p className="text-2xl font-bold text-foreground">{stats.attive}</p>
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
                  placeholder="Cerca prestazioni per nome o descrizione..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                Filtri
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Caricamento prestazioni...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && prestazioni.length === 0 && (
          <Card className="shadow-medical">
            <CardContent className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'Nessuna prestazione trovata' : 'Nessuna prestazione configurata'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Prova a modificare i criteri di ricerca' 
                  : 'Inizia aggiungendo la tua prima prestazione'
                }
              </p>
              {!searchTerm && <PrestazioneForm />}
            </CardContent>
          </Card>
        )}

        {/* Prestazioni List */}
        {!loading && prestazioni.length > 0 && (
          <div className="grid gap-4">
            {prestazioni.map((prestazione) => (
              <Card key={prestazione.id} className="shadow-medical hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        prestazione.attiva ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Activity className={`h-6 w-6 ${
                          prestazione.attiva ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground text-lg">{prestazione.nome}</h3>
                              {!prestazione.attiva && (
                                <Badge variant="outline" className="text-xs border-muted-foreground text-muted-foreground">
                                  Disattivata
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">€ {Number(prestazione.prezzo_unitario).toFixed(2)}</p>
                            {prestazione.durata_minuti && (
                              <p className="text-sm text-muted-foreground">{prestazione.durata_minuti} minuti</p>
                            )}
                          </div>
                        </div>
                        
                        {prestazione.descrizione && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {prestazione.descrizione}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="border-success/50 text-success">
                            IVA Esente
                          </Badge>
                          <Badge variant="outline" className="border-warning/50 text-warning">
                            ENPAP 2%
                          </Badge>
                          {prestazione.attiva && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                              Attiva
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Normativa: Art. 10 n. 18 DPR 633/72 - Prestazioni sanitarie esenti IVA
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleAttiva(prestazione.id, prestazione.attiva || false)}
                        className={prestazione.attiva ? "text-warning hover:bg-warning/10" : "text-success hover:bg-success/10"}
                      >
                        {prestazione.attiva ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <PrestazioneForm 
                        prestazione={prestazione}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Elimina Prestazione</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler eliminare "{prestazione.nome}"? 
                              Questa azione non può essere annullata e potrebbe influire sulle fatture esistenti.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeletePrestazione(prestazione.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Elimina
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        {!loading && prestazioni.length > 0 && (
          <Card className="shadow-medical bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg text-primary">
                Informazioni Normative
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>IVA Esente:</strong> Le prestazioni sanitarie sono esenti IVA secondo l'Art. 10 n. 18 DPR 633/72</p>
              <p><strong>Cassa Previdenziale:</strong> ENPAP 2% per psicologi, calcolabile separatamente o inclusa nel prezzo</p>
              <p><strong>Gestione Prestazioni:</strong> Attiva/disattiva prestazioni per controllarene la disponibilità</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}