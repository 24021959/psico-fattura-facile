import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Save, X, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePazienti } from "@/hooks/usePazienti";
import { usePrestazioni } from "@/hooks/usePrestazioni";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";

type Paziente = Tables<'pazienti'>;

interface PazienteFormProps {
  paziente?: Paziente;
  trigger?: React.ReactNode;
}

export function PazienteForm({ paziente, trigger }: PazienteFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: paziente?.nome || "",
    cognome: paziente?.cognome || "",
    codice_fiscale: paziente?.codice_fiscale || "",
    email: paziente?.email || "",
    telefono: paziente?.telefono || "",
    indirizzo: paziente?.indirizzo || "",
    citta: paziente?.citta || "",
    cap: paziente?.cap || "",
    data_nascita: paziente?.data_nascita || "",
    note: paziente?.note || "",
    prestazione_default_id: (paziente as any)?.prestazione_default_id || ""
  });
  const { createPaziente, updatePaziente } = usePazienti();
  const { prestazioni } = usePrestazioni();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione base
    if (!formData.nome || !formData.cognome || !formData.codice_fiscale) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Nome, cognome e codice fiscale sono obbligatori"
      });
      return;
    }

    // Validazione codice fiscale (lunghezza)
    if (formData.codice_fiscale.length !== 16) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Il codice fiscale deve essere di 16 caratteri"
      });
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        prestazione_default_id: formData.prestazione_default_id === "none" ? null : formData.prestazione_default_id || null
      };
      
      if (paziente) {
        await updatePaziente(paziente.id, dataToSave);
      } else {
        await createPaziente(dataToSave);
      }
      
      setOpen(false);
      
      // Reset form se nuovo paziente
      if (!paziente) {
        setFormData({
          nome: "",
          cognome: "",
          codice_fiscale: "",
          email: "",
          telefono: "",
          indirizzo: "",
          citta: "",
          cap: "",
          data_nascita: "",
          note: "",
          prestazione_default_id: ""
        });
      }
    } catch (error) {
      console.error('Error saving paziente:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="medical-gradient text-primary-foreground hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Paziente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {paziente ? 'Modifica Paziente' : 'Nuovo Paziente'}
          </DialogTitle>
          <DialogDescription>
            Inserisci i dati anagrafici del paziente. I campi con * sono obbligatori.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dati Anagrafici */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Dati Anagrafici</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Mario"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cognome">Cognome *</Label>
                  <Input
                    id="cognome"
                    value={formData.cognome}
                    onChange={(e) => setFormData({...formData, cognome: e.target.value})}
                    placeholder="Rossi"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="codice_fiscale">Codice Fiscale *</Label>
                <Input
                  id="codice_fiscale"
                  value={formData.codice_fiscale}
                  onChange={(e) => setFormData({...formData, codice_fiscale: e.target.value.toUpperCase()})}
                  placeholder="RSSMRA80A01H501Z"
                  maxLength={16}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_nascita">Data di Nascita</Label>
                <Input
                  id="data_nascita"
                  type="date"
                  value={formData.data_nascita}
                  onChange={(e) => setFormData({...formData, data_nascita: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contatti */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Contatti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="mario.rossi@email.it"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Telefono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    placeholder="+39 338 123 4567"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indirizzo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Indirizzo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="indirizzo">Via/Piazza</Label>
                <Input
                  id="indirizzo"
                  value={formData.indirizzo}
                  onChange={(e) => setFormData({...formData, indirizzo: e.target.value})}
                  placeholder="Via Roma, 123"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="citta">Città</Label>
                  <Input
                    id="citta"
                    value={formData.citta}
                    onChange={(e) => setFormData({...formData, citta: e.target.value})}
                    placeholder="Milano"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cap">CAP</Label>
                  <Input
                    id="cap"
                    value={formData.cap}
                    onChange={(e) => setFormData({...formData, cap: e.target.value})}
                    placeholder="20100"
                    maxLength={5}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prestazione Default */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Prestazione Default
              </CardTitle>
              <CardDescription>
                Imposta la prestazione predefinita per questo paziente (opzionale)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="prestazione_default">Prestazione predefinita</Label>
                <Select value={formData.prestazione_default_id} onValueChange={(value) => setFormData({...formData, prestazione_default_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nessuna prestazione predefinita" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nessuna prestazione predefinita</SelectItem>
                    {prestazioni.filter(p => p.attiva).map((prestazione) => (
                      <SelectItem key={prestazione.id} value={prestazione.id}>
                        {prestazione.nome} - €{Number(prestazione.prezzo_unitario).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Quando crei una fattura per questo paziente, questa prestazione sarà preselezionata
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Note</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="note">Note aggiuntive</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="Note per il paziente (allergie, preferenze, etc.)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              <X className="mr-2 h-4 w-4" />
              Annulla
            </Button>
            <Button type="submit" className="medical-gradient text-primary-foreground">
              <Save className="mr-2 h-4 w-4" />
              {paziente ? 'Aggiorna' : 'Salva'} Paziente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}