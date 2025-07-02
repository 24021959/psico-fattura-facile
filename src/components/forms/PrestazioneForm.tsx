import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Save, X, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePrestazioni } from "@/hooks/usePrestazioni";
import type { Tables } from "@/integrations/supabase/types";

type Prestazione = Tables<'prestazioni'>;

interface PrestazioneFormProps {
  prestazione?: Prestazione;
  trigger?: React.ReactNode;
}

export function PrestazioneForm({ prestazione, trigger }: PrestazioneFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: prestazione?.nome || "",
    descrizione: prestazione?.descrizione || "",
    prezzo_unitario: prestazione?.prezzo_unitario?.toString() || "",
    durata_minuti: prestazione?.durata_minuti?.toString() || "60",
    attiva: prestazione?.attiva ?? true
  });
  const { createPrestazione, updatePrestazione } = usePrestazioni();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione base
    if (!formData.nome || !formData.prezzo_unitario) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Nome e prezzo sono obbligatori"
      });
      return;
    }

    if (isNaN(Number(formData.prezzo_unitario)) || Number(formData.prezzo_unitario) <= 0) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Il prezzo deve essere un numero valido maggiore di 0"
      });
      return;
    }

    const prestazioneData = {
      nome: formData.nome,
      descrizione: formData.descrizione || null,
      prezzo_unitario: Number(formData.prezzo_unitario),
      durata_minuti: formData.durata_minuti ? Number(formData.durata_minuti) : 60,
      attiva: formData.attiva
    };

    try {
      if (prestazione) {
        await updatePrestazione(prestazione.id, prestazioneData);
      } else {
        await createPrestazione(prestazioneData);
      }
      
      setOpen(false);
      
      // Reset form se nuova prestazione
      if (!prestazione) {
        setFormData({
          nome: "",
          descrizione: "",
          prezzo_unitario: "",
          durata_minuti: "60",
          attiva: true
        });
      }
    } catch (error) {
      console.error('Error saving prestazione:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="medical-gradient text-primary-foreground hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Nuova Prestazione
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {prestazione ? 'Modifica Prestazione' : 'Nuova Prestazione'}
          </DialogTitle>
          <DialogDescription>
            Configura i dettagli della prestazione sanitaria. I campi con * sono obbligatori.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informazioni Base */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Informazioni Base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Prestazione *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Seduta Individuale"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descrizione">Descrizione</Label>
                <Textarea
                  id="descrizione"
                  value={formData.descrizione}
                  onChange={(e) => setFormData({...formData, descrizione: e.target.value})}
                  placeholder="Descrizione dettagliata della prestazione..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tariffe e Durata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tariffe e Durata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prezzo_unitario">Prezzo (€) *</Label>
                  <Input
                    id="prezzo_unitario"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.prezzo_unitario}
                    onChange={(e) => setFormData({...formData, prezzo_unitario: e.target.value})}
                    placeholder="80.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durata_minuti">Durata (minuti)</Label>
                  <Input
                    id="durata_minuti"
                    type="number"
                    min="0"
                    value={formData.durata_minuti}
                    onChange={(e) => setFormData({...formData, durata_minuti: e.target.value})}
                    placeholder="60"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Prestazione Attiva</Label>
                  <p className="text-sm text-muted-foreground">
                    Rendi disponibile questa prestazione per le fatture
                  </p>
                </div>
                <Switch
                  checked={formData.attiva}
                  onCheckedChange={(checked) => setFormData({...formData, attiva: checked})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Info Fiscali */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-sm space-y-1">
                <p><strong>Normativa Applicata:</strong></p>
                <p>• IVA Esente: Art. 10 n. 18 DPR 633/72 - Prestazioni sanitarie</p>
                <p>• Contributo ENPAP: 2% applicabile in fatturazione</p>
                <p>• Regime forfettario: Compatibile con prestazioni sanitarie</p>
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
              {prestazione ? 'Aggiorna' : 'Salva'} Prestazione
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}