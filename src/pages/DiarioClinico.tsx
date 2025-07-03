import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Plus, 
  Calendar, 
  FileText, 
  Shield, 
  Edit, 
  Trash2,
  Clock,
  User,
  Activity,
  AlertTriangle
} from "lucide-react";
import { useDiarioClinico } from "@/hooks/useDiarioClinico";
import { usePazienti } from "@/hooks/usePazienti";
import { SedutaForm } from "@/components/forms/SedutaForm";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export function DiarioClinico() {
  const [selectedPaziente, setSelectedPaziente] = useState<string>("");
  const { 
    sedute, 
    loading, 
    searchTerm, 
    setSearchTerm, 
    deleteSeduta,
    getSeduteByPaziente 
  } = useDiarioClinico();
  
  const { pazienti } = usePazienti();

  // Filtra sedute per paziente selezionato
  const seduteVisualizzate = selectedPaziente 
    ? getSeduteByPaziente(selectedPaziente)
    : sedute;

  const pazienteSelezionato = pazienti.find(p => p.id === selectedPaziente);

  const handleDeleteSeduta = async (sedutaId: string) => {
    if (confirm("Sei sicuro di voler eliminare questa seduta? L'azione non può essere annullata.")) {
      await deleteSeduta(sedutaId);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Caricamento diario clinico...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diario Clinico</h1>
          <p className="text-muted-foreground">
            Gestione confidenziale delle sedute e note cliniche dei pazienti
          </p>
        </div>

        {/* Privacy Alert */}
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Sicurezza Garantita:</strong> Tutti i dati sono criptati con standard AES-256. 
            Accesso riservato esclusivamente al professionista autenticato. 
            <span className="block mt-1 text-sm">
              ⚠️ Uso privato - non sostituisce documentazione medica ufficiale
            </span>
          </AlertDescription>
        </Alert>
      </div>

      {/* Filtri e Azioni */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtri e Ricerca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ricerca Testuale */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cerca per parole chiave</label>
              <Input
                placeholder="Cerca in titoli e note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filtro Paziente */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtra per paziente</label>
              <select
                value={selectedPaziente}
                onChange={(e) => setSelectedPaziente(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Tutti i pazienti</option>
                {pazienti.map((paziente) => (
                  <option key={paziente.id} value={paziente.id}>
                    {paziente.nome} {paziente.cognome}
                  </option>
                ))}
              </select>
            </div>

            {/* Nuova Seduta */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Azioni</label>
              <SedutaForm 
                pazientePreselezionato={selectedPaziente || undefined}
                trigger={
                  <Button className="w-full medical-gradient text-primary-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuova Seduta
                  </Button>
                }
              />
            </div>
          </div>

          {/* Info Paziente Selezionato */}
          {pazienteSelezionato && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">
                  {pazienteSelezionato.nome} {pazienteSelezionato.cognome}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {getSeduteByPaziente(selectedPaziente).length} sedute registrate
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Sedute */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Timeline Sedute
            <Badge variant="secondary">{seduteVisualizzate.length}</Badge>
          </h2>
        </div>

        {seduteVisualizzate.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nessuna seduta registrata</h3>
              <p className="text-muted-foreground mb-4">
                {selectedPaziente 
                  ? "Nessuna seduta trovata per questo paziente"
                  : searchTerm 
                    ? "Nessuna seduta corrisponde ai criteri di ricerca"
                    : "Inizia aggiungendo la prima seduta al diario clinico"
                }
              </p>
              <SedutaForm 
                pazientePreselezionato={selectedPaziente || undefined}
                trigger={
                  <Button className="medical-gradient text-primary-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Aggiungi Prima Seduta
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {seduteVisualizzate.map((seduta) => (
              <Card key={seduta.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        {seduta.titolo}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(seduta.data_seduta), "dd MMMM yyyy", { locale: it })}
                        </span>
                        {!selectedPaziente && seduta.paziente && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {seduta.paziente.nome} {seduta.paziente.cognome}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteSeduta(seduta.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Note Cliniche */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Note Cliniche
                    </h4>
                    <div className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">
                      {(seduta as any).note_decriptate || "Nessuna nota disponibile"}
                    </div>
                  </div>

                  {/* Esercizio Assegnato */}
                  {seduta.esercizio_assegnato && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Esercizio Assegnato
                      </h4>
                      <div className="p-3 bg-primary/5 rounded-lg text-sm">
                        {seduta.esercizio_assegnato}
                      </div>
                    </div>
                  )}

                  {/* Meta informazioni */}
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Creata il {format(new Date(seduta.created_at), "dd/MM/yyyy 'alle' HH:mm", { locale: it })}
                    {seduta.updated_at !== seduta.created_at && (
                      <span> • Modificata il {format(new Date(seduta.updated_at), "dd/MM/yyyy 'alle' HH:mm", { locale: it })}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer Footer */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Importante:</strong> Questo diario clinico è uno strumento di supporto privato. 
          Non sostituisce la documentazione medica ufficiale e deve essere utilizzato in conformità 
          alle normative sulla privacy e protezione dei dati sanitari (GDPR).
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default DiarioClinico;