import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PazienteFormProps {
  onSave?: (paziente: any) => void;
  paziente?: any;
  trigger?: React.ReactNode;
}

export function PazienteForm({ onSave, paziente, trigger }: PazienteFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: paziente?.nome || "",
    cognome: paziente?.cognome || "",
    codiceFiscale: paziente?.codiceFiscale || "",
    email: paziente?.email || "",
    telefono: paziente?.telefono || "",
    indirizzo: paziente?.indirizzo || "",
    citta: paziente?.citta || "",
    cap: paziente?.cap || "",
    note: paziente?.note || ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione base
    if (!formData.nome || !formData.cognome || !formData.codiceFiscale) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Nome, cognome e codice fiscale sono obbligatori"
      });
      return;
    }

    // Validazione codice fiscale (lunghezza)
    if (formData.codiceFiscale.length !== 16) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Il codice fiscale deve essere di 16 caratteri"
      });
      return;
    }

    const pazienteData = {
      ...formData,
      id: paziente?.id || Date.now().toString()
    };

    onSave?.(pazienteData);
    
    toast({
      title: "Successo",
      description: `Paziente ${paziente ? 'aggiornato' : 'creato'} correttamente`
    });
    
    setOpen(false);
    
    // Reset form se nuovo paziente
    if (!paziente) {
      setFormData({
        nome: "",
        cognome: "",
        codiceFiscale: "",
        email: "",
        telefono: "",
        indirizzo: "",
        citta: "",
        cap: "",
        note: ""
      });
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
                <Label htmlFor="codiceFiscale">Codice Fiscale *</Label>
                <Input
                  id="codiceFiscale"
                  value={formData.codiceFiscale}
                  onChange={(e) => setFormData({...formData, codiceFiscale: e.target.value.toUpperCase()})}
                  placeholder="RSSMRA80A01H501Z"
                  maxLength={16}
                  required
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