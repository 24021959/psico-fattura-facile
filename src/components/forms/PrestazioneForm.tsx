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

interface PrestazioneFormProps {
  onSave?: (prestazione: any) => void;
  prestazione?: any;
  trigger?: React.ReactNode;
}

export function PrestazioneForm({ onSave, prestazione, trigger }: PrestazioneFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    codice: prestazione?.codice || "",
    nome: prestazione?.nome || "",
    descrizione: prestazione?.descrizione || "",
    prezzo: prestazione?.prezzo || "",
    durata: prestazione?.durata || "",
    categoria: prestazione?.categoria || "",
    ivaEsente: prestazione?.ivaEsente ?? true,
    cassePrevidenziali: prestazione?.cassePrevidenziali ?? true,
    percentualeCassa: prestazione?.percentualeCassa || "2"
  });
  const { toast } = useToast();

  const categorie = [
    "Individuale",
    "Coppia", 
    "Familiare",
    "Gruppo",
    "Online",
    "Valutazione",
    "Test",
    "Consulenza"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione base
    if (!formData.nome || !formData.codice || !formData.prezzo) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Nome, codice e prezzo sono obbligatori"
      });
      return;
    }

    if (isNaN(Number(formData.prezzo)) || Number(formData.prezzo) <= 0) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Il prezzo deve essere un numero valido maggiore di 0"
      });
      return;
    }

    const prestazioneData = {
      ...formData,
      id: prestazione?.id || Date.now().toString(),
      prezzo: Number(formData.prezzo),
      durata: Number(formData.durata),
      percentualeCassa: Number(formData.percentualeCassa)
    };

    onSave?.(prestazioneData);
    
    toast({
      title: "Successo",
      description: `Prestazione ${prestazione ? 'aggiornata' : 'creata'} correttamente`
    });
    
    setOpen(false);
    
    // Reset form se nuova prestazione
    if (!prestazione) {
      setFormData({
        codice: "",
        nome: "",
        descrizione: "",
        prezzo: "",
        durata: "",
        categoria: "",
        ivaEsente: true,
        cassePrevidenziali: true,
        percentualeCassa: "2"
      });
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="codice">Codice Prestazione *</Label>
                  <Input
                    id="codice"
                    value={formData.codice}
                    onChange={(e) => setFormData({...formData, codice: e.target.value})}
                    placeholder="93.29.10"
                    required
                  />
                </div>
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
              
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorie.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Label htmlFor="prezzo">Prezzo (€) *</Label>
                  <Input
                    id="prezzo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.prezzo}
                    onChange={(e) => setFormData({...formData, prezzo: e.target.value})}
                    placeholder="80.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durata">Durata (minuti)</Label>
                  <Input
                    id="durata"
                    type="number"
                    min="0"
                    value={formData.durata}
                    onChange={(e) => setFormData({...formData, durata: e.target.value})}
                    placeholder="50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aspetti Fiscali */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Aspetti Fiscali</CardTitle>
              <CardDescription>
                Configurazione fiscale per la prestazione sanitaria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IVA Esente</Label>
                  <p className="text-sm text-muted-foreground">
                    Art. 10 n. 18 DPR 633/72 - Prestazioni sanitarie
                  </p>
                </div>
                <Switch
                  checked={formData.ivaEsente}
                  onCheckedChange={(checked) => setFormData({...formData, ivaEsente: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Casse Previdenziali</Label>
                  <p className="text-sm text-muted-foreground">
                    Applica contributo ENPAP
                  </p>
                </div>
                <Switch
                  checked={formData.cassePrevidenziali}
                  onCheckedChange={(checked) => setFormData({...formData, cassePrevidenziali: checked})}
                />
              </div>
              
              {formData.cassePrevidenziali && (
                <div className="space-y-2">
                  <Label htmlFor="percentualeCassa">Percentuale Cassa (%)</Label>
                  <Input
                    id="percentualeCassa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.percentualeCassa}
                    onChange={(e) => setFormData({...formData, percentualeCassa: e.target.value})}
                    placeholder="2.0"
                  />
                  <p className="text-xs text-muted-foreground">
                    ENPAP standard: 2% per psicologi
                  </p>
                </div>
              )}
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