import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, X, FileText, Shield, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useDiarioClinico } from "@/hooks/useDiarioClinico";
import { usePazienti } from "@/hooks/usePazienti";

interface SedutaFormProps {
  trigger?: React.ReactNode;
  pazientePreselezionato?: string;
  onSuccess?: () => void;
  sedutaToEdit?: any;
}

export function SedutaForm({ trigger, pazientePreselezionato, onSuccess, sedutaToEdit }: SedutaFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    paziente_id: pazientePreselezionato || sedutaToEdit?.paziente_id || "",
    titolo: sedutaToEdit?.titolo || "",
    note: sedutaToEdit?.note_decriptate || "",
    esercizio_assegnato: sedutaToEdit?.esercizio_assegnato || "",
    data_seduta: sedutaToEdit?.data_seduta || new Date().toISOString().split('T')[0]
  });

  const { pazienti } = usePazienti();
  const { createSeduta, updateSeduta } = useDiarioClinico();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paziente_id || !formData.titolo || !formData.note) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Paziente, titolo e note sono obbligatori"
      });
      return;
    }

    if (formData.note.length > 1000) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Le note non possono superare i 1000 caratteri"
      });
      return;
    }

    try {
      let result;
      
      if (sedutaToEdit) {
        result = await updateSeduta(sedutaToEdit.id, formData);
      } else {
        result = await createSeduta(formData);
      }
      
      if (result) {
        setOpen(false);
        onSuccess?.();
        
        // Reset form solo se non stiamo modificando
        if (!sedutaToEdit) {
          if (!pazientePreselezionato) {
            setFormData({
              paziente_id: "",
              titolo: "",
              note: "",
              esercizio_assegnato: "",
              data_seduta: new Date().toISOString().split('T')[0]
            });
          } else {
            setFormData({
              paziente_id: pazientePreselezionato,
              titolo: "",
              note: "",
              esercizio_assegnato: "",
              data_seduta: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
    } catch (error) {
      console.error('SedutaForm: Error in handleSubmit:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="medical-gradient text-primary-foreground hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Nuova Seduta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {sedutaToEdit ? "Modifica Seduta" : "Nuova Seduta"} - Diario Clinico
          </DialogTitle>
          <DialogDescription>
            {sedutaToEdit ? "Modifica la seduta del diario clinico" : "Aggiungi una nuova seduta al diario clinico del paziente"}
          </DialogDescription>
        </DialogHeader>

        {/* Privacy Alert */}
        <Alert className="border-orange-200 bg-orange-50">
          <Shield className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Privacy e Sicurezza:</strong> I dati inseriti sono criptati e riservati esclusivamente al professionista autenticato. 
            Uso privato - non sostituisce documentazione medica ufficiale.
          </AlertDescription>
        </Alert>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selezione Paziente e Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Dettagli Seduta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paziente">Paziente *</Label>
                <Select 
                  value={formData.paziente_id} 
                  onValueChange={(value) => setFormData({...formData, paziente_id: value})}
                  disabled={!!pazientePreselezionato}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona paziente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pazienti.map((paziente) => (
                      <SelectItem key={paziente.id} value={paziente.id}>
                        {paziente.nome} {paziente.cognome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_seduta">Data Seduta *</Label>
                  <Input
                    id="data_seduta"
                    type="date"
                    value={formData.data_seduta}
                    onChange={(e) => setFormData({...formData, data_seduta: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="titolo">Titolo Seduta *</Label>
                  <Input
                    id="titolo"
                    value={formData.titolo}
                    onChange={(e) => setFormData({...formData, titolo: e.target.value})}
                    placeholder="es: Seduta 1 - Crisi ansiosa"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Note Cliniche */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Note Cliniche</CardTitle>
              <CardDescription>
                Inserisci le osservazioni e note della seduta (max 1000 caratteri)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note">Note della Seduta *</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="Inserisci le note della seduta, osservazioni, progressi del paziente..."
                  rows={6}
                  maxLength={1000}
                  required
                />
                <div className="text-xs text-muted-foreground text-right">
                  {formData.note.length}/1000 caratteri
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="esercizio">Esercizio Assegnato (opzionale)</Label>
                <Textarea
                  id="esercizio"
                  value={formData.esercizio_assegnato}
                  onChange={(e) => setFormData({...formData, esercizio_assegnato: e.target.value})}
                  placeholder="Descrivi eventuali esercizi o attività assegnate al paziente"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Le informazioni inserite sono destinate esclusivamente all'uso privato del professionista e non sostituiscono 
              la documentazione medica ufficiale. I dati sono criptati e protetti secondo gli standard di sicurezza.
            </AlertDescription>
          </Alert>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Annulla
            </Button>
            <Button type="submit" className="medical-gradient text-primary-foreground">
              <Save className="mr-2 h-4 w-4" />
              {sedutaToEdit ? "Aggiorna Seduta" : "Salva Seduta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}