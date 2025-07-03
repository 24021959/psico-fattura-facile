import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, Search, Download, Eye, Calendar, Euro, User, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FatturaForm } from "@/components/forms/FatturaForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFatture } from "@/hooks/useFatture";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Fatture() {
  const { fatture, loading, searchTerm, setSearchTerm, updateStatoFattura, deleteFattura, stats } = useFatture();
  const handleUpdateStato = async (id: string, nuovoStato: 'bozza' | 'inviata' | 'pagata' | 'scaduta') => {
    await updateStatoFattura(id, nuovoStato);
  };

  const handleDeleteFattura = async (id: string) => {
    await deleteFattura(id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestione Fatture</h1>
            <p className="text-muted-foreground">
              Crea e gestisci le fatture sanitarie per i tuoi pazienti ({stats.totale} fatture)
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
                  <p className="text-2xl font-bold text-foreground">{stats.totale}</p>
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
                  <p className="text-2xl font-bold text-foreground">€ {stats.fatturato.toFixed(0)}</p>
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
                  <p className="text-2xl font-bold text-foreground">€ {stats.daIncassare.toFixed(0)}</p>
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
                  <p className="text-2xl font-bold text-foreground">{stats.scadute}</p>
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
                  placeholder="Cerca per numero fattura, paziente..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select defaultValue="tutti">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti gli stati</SelectItem>
                  <SelectItem value="inviata">Inviate</SelectItem>
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Caricamento fatture...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && fatture.length === 0 && (
          <Card className="shadow-medical">
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'Nessuna fattura trovata' : 'Nessuna fattura emessa'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Prova a modificare i criteri di ricerca' 
                  : 'Inizia creando la tua prima fattura'
                }
              </p>
              {!searchTerm && <FatturaForm />}
            </CardContent>
          </Card>
        )}

        {/* Fatture List */}
        {!loading && fatture.length > 0 && (
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
                              Fattura #{fattura.numero_fattura}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              {new Date(fattura.data_fattura).toLocaleDateString('it-IT')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">€ {Number(fattura.totale).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              (ENPAP incluso)
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            {fattura.paziente && (
                              <>
                                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {fattura.paziente.nome} {fattura.paziente.cognome}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {fattura.paziente.codice_fiscale ? `CF: ${fattura.paziente.codice_fiscale}` : 'CF non inserito'}
                                </p>
                              </>
                            )}
                          </div>
                          <div>
                            {fattura.righe_fattura && fattura.righe_fattura[0] && (
                              <>
                                <p className="text-sm font-medium text-foreground">
                                  {fattura.righe_fattura[0].prestazione?.nome || fattura.righe_fattura[0].descrizione}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  €{Number(fattura.righe_fattura[0].prezzo_unitario).toFixed(2)} x {fattura.righe_fattura[0].quantita}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={fattura.stato === 'pagata' ? 'default' : fattura.stato === 'inviata' ? 'secondary' : 'destructive'}
                            className={`flex items-center gap-1 ${
                              fattura.stato === 'pagata' ? 'bg-success text-success-foreground' : 
                              fattura.stato === 'inviata' ? 'bg-warning/10 text-warning border-warning' : 
                              'bg-destructive text-destructive-foreground'
                            }`}
                          >
                            {fattura.stato === 'pagata' && <CheckCircle2 className="h-3 w-3" />}
                            {fattura.stato === 'inviata' && <Clock className="h-3 w-3" />}
                            {fattura.stato === 'scaduta' && <AlertCircle className="h-3 w-3" />}
                            {fattura.stato.charAt(0).toUpperCase() + fattura.stato.slice(1)}
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
                      {fattura.stato !== 'pagata' && (
                        <Select 
                          value={fattura.stato} 
                          onValueChange={(value) => handleUpdateStato(fattura.id, value as any)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inviata">Inviata</SelectItem>
                            <SelectItem value="pagata">Pagata</SelectItem>
                            <SelectItem value="scaduta">Scaduta</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          console.log('Visualizza fattura clicked:', fattura);
                          // Per ora stesso comportamento del PDF, in futuro potrebbe aprire una modal
                          import('../utils/fatturaPDF').then(({ generaEScaricaPDF }) => {
                            console.log('PDF module loaded, preparing data...');
                            // Prepara i dati per il PDF
                            const fatturaPerPDF = {
                              id: fattura.numero_fattura,
                              numero: fattura.numero_fattura.split('-')[1],
                              anno: fattura.numero_fattura.split('-')[0],
                              data: fattura.data_fattura,
                              paziente: {
                                ...fattura.paziente,
                                codiceFiscale: fattura.paziente?.codice_fiscale || ''
                              },
                              prestazione: fattura.righe_fattura?.[0]?.prestazione || {
                                nome: fattura.righe_fattura?.[0]?.descrizione || '',
                                codice: ''
                              },
                              importo: Number(fattura.subtotale),
                              enpap: Number(fattura.totale) - Number(fattura.subtotale),
                              totale: Number(fattura.totale),
                              stato: fattura.stato,
                              metodoPagamento: 'Non specificato'
                            };
                            console.log('Calling generaEScaricaPDF with data:', fatturaPerPDF);
                            generaEScaricaPDF(fatturaPerPDF).catch(error => {
                              console.error('Error generating PDF:', error);
                            });
                          }).catch(error => {
                            console.error('Error loading PDF module:', error);
                          });
                        }}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Visualizza
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          console.log('Download PDF clicked:', fattura);
                          import('../utils/fatturaPDF').then(({ generaEScaricaPDF }) => {
                            console.log('PDF module loaded for download, preparing data...');
                            // Prepara i dati per il PDF
                            const fatturaPerPDF = {
                              id: fattura.numero_fattura,
                              numero: fattura.numero_fattura.split('-')[1],
                              anno: fattura.numero_fattura.split('-')[0],
                              data: fattura.data_fattura,
                              paziente: {
                                ...fattura.paziente,
                                codiceFiscale: fattura.paziente?.codice_fiscale || ''
                              },
                              prestazione: fattura.righe_fattura?.[0]?.prestazione || {
                                nome: fattura.righe_fattura?.[0]?.descrizione || '',
                                codice: ''
                              },
                              importo: Number(fattura.subtotale),
                              enpap: Number(fattura.totale) - Number(fattura.subtotale),
                              totale: Number(fattura.totale),
                              stato: fattura.stato,
                              metodoPagamento: 'Non specificato'
                            };
                            console.log('Calling generaEScaricaPDF for download with data:', fatturaPerPDF);
                            generaEScaricaPDF(fatturaPerPDF).catch(error => {
                              console.error('Error generating PDF for download:', error);
                            });
                          }).catch(error => {
                            console.error('Error loading PDF module for download:', error);
                          });
                        }}
                      >
                        <Download className="mr-1 h-3 w-3" />
                        PDF
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                            Elimina
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Elimina Fattura</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler eliminare la fattura #{fattura.numero_fattura}? 
                              Questa azione non può essere annullata.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteFattura(fattura.id)}
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
        {!loading && fatture.length > 0 && (
          <Card className="shadow-medical bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg text-primary">
                Informazioni Fatturazione Sanitaria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Numerazione:</strong> Le fatture seguono numerazione progressiva annuale automatica</p>
              <p><strong>Conservazione:</strong> Obbligo di conservazione per 10 anni (DPR 633/72)</p>
              <p><strong>ENPAP:</strong> Contributo del 2% automaticamente calcolato e incluso nel totale</p>
              <p><strong>GDPR:</strong> Tutte le fatture includono informativa privacy per dati sanitari</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}