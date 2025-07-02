import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, Search, Phone, Mail, Edit, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PazienteForm } from "@/components/forms/PazienteForm";
import { usePazienti } from "@/hooks/usePazienti";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Pazienti() {
  const { pazienti, loading, searchTerm, setSearchTerm, deletePaziente } = usePazienti();

  const handleDeletePaziente = async (id: string) => {
    await deletePaziente(id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestione Pazienti</h1>
            <p className="text-muted-foreground">
              Gestisci l'anagrafica dei tuoi pazienti ({pazienti.length} pazienti)
            </p>
          </div>
          <PazienteForm />
        </div>

        {/* Search and Filters */}
        <Card className="shadow-medical">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca pazienti per nome, cognome o codice fiscale..."
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
            <span className="ml-2 text-muted-foreground">Caricamento pazienti...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && pazienti.length === 0 && (
          <Card className="shadow-medical">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'Nessun paziente trovato' : 'Nessun paziente registrato'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Prova a modificare i criteri di ricerca' 
                  : 'Inizia aggiungendo il tuo primo paziente'
                }
              </p>
              {!searchTerm && <PazienteForm />}
            </CardContent>
          </Card>
        )}

        {/* Patients List */}
        {!loading && pazienti.length > 0 && (
          <div className="grid gap-4">
            {pazienti.map((paziente) => (
              <Card key={paziente.id} className="shadow-medical hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {paziente.nome} {paziente.cognome}
                        </h3>
                        {paziente.codice_fiscale && (
                          <p className="text-sm text-muted-foreground">
                            CF: {paziente.codice_fiscale}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          {paziente.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {paziente.email}
                            </div>
                          )}
                          {paziente.telefono && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {paziente.telefono}
                            </div>
                          )}
                        </div>
                        {paziente.note && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {paziente.note.substring(0, 50)}{paziente.note.length > 50 ? '...' : ''}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PazienteForm 
                        paziente={paziente}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Edit className="mr-1 h-3 w-3" />
                            Modifica
                          </Button>
                        }
                      />
                      <Button variant="outline" size="sm">
                        Fatture
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Elimina Paziente</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler eliminare {paziente.nome} {paziente.cognome}? 
                              Questa azione non può essere annullata.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeletePaziente(paziente.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Elimina
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button size="sm" className="bg-primary hover:bg-primary-hover text-primary-foreground">
                        Nuova Fattura
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}