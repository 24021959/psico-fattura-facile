import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, X, FileText, Calculator, User, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFatture } from "@/hooks/useFatture";
import type { Tables } from "@/integrations/supabase/types";

type Fattura = Tables<'fatture'>;

interface FatturaFormProps {
  fattura?: Fattura;
  trigger?: React.ReactNode;
  pazientePreselezionato?: string;
}

export function FatturaForm({ fattura, trigger, pazientePreselezionato }: FatturaFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    paziente_id: pazientePreselezionato || fattura?.paziente_id || "",
    prestazione_id: "",
    data_prestazione: new Date().toISOString().split('T')[0],
    metodo_pagamento: "",
    note: ""
  });
  const { pazienti, prestazioni, createFattura } = useFatture();
  const { toast } = useToast();

  const metodiPagamento = [
    "Contanti",
    "Bonifico Bancario", 
    "Carta di Credito",
    "Assegno",
    "POS",
    "PayPal"
  ];

  const prestazioneSelezionata = prestazioni.find(p => p.id === formData.prestazione_id);
  const pazienteSelezionato = pazienti.find(p => p.id === formData.paziente_id);

  // Auto-seleziona prestazione default quando si cambia paziente
  const handlePazienteChange = (pazienteId: string) => {
    const paziente = pazienti.find(p => p.id === pazienteId);
    const prestazioneDefault = (paziente as any)?.prestazione_default_id;
    
    setFormData({
      ...formData, 
      paziente_id: pazienteId,
      prestazione_id: prestazioneDefault || formData.prestazione_id
    });
  };

  // Calcoli automatici
  const importoBase = prestazioneSelezionata?.prezzo_unitario ? Number(prestazioneSelezionata.prezzo_unitario) : 0;
  const importoEnpap = importoBase * 2 / 100; // ENPAP 2%
  const totaleFinale = importoBase + importoEnpap;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('FatturaForm: Starting submit with data:', formData);
    console.log('FatturaForm: Available pazienti:', pazienti.length);
    console.log('FatturaForm: Available prestazioni:', prestazioni.length);
    
    if (!formData.paziente_id || !formData.prestazione_id || !formData.metodo_pagamento) {
      console.error('FatturaForm: Missing required fields', {
        paziente_id: formData.paziente_id,
        prestazione_id: formData.prestazione_id,
        metodo_pagamento: formData.metodo_pagamento
      });
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Paziente, prestazione e metodo di pagamento sono obbligatori"
      });
      return;
    }

    try {
      console.log('FatturaForm: Calling createFattura...');
      const result = await createFattura({
        paziente_id: formData.paziente_id,
        prestazione_id: formData.prestazione_id,
        data_prestazione: formData.data_prestazione,
        metodo_pagamento: formData.metodo_pagamento,
        note: formData.note || undefined
      });

      console.log('FatturaForm: createFattura result:', result);
      
      if (result) {
        console.log('FatturaForm: Success - closing dialog and resetting form');
        setOpen(false);
        
        // Reset form
        if (!pazientePreselezionato) {
          setFormData({
            paziente_id: "",
            prestazione_id: "",
            data_prestazione: new Date().toISOString().split('T')[0],
            metodo_pagamento: "",
            note: ""
          });
        } else {
          // Se paziente preselezionato, resetta solo gli altri campi
          setFormData({
            paziente_id: pazientePreselezionato,
            prestazione_id: "",
            data_prestazione: new Date().toISOString().split('T')[0],
            metodo_pagamento: "",
            note: ""
          });
        }
      } else {
        console.error('FatturaForm: createFattura returned null');
      }
    } catch (error) {
      console.error('FatturaForm: Error in handleSubmit:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="medical-gradient text-primary-foreground hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" />
            Nuova Fattura
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {fattura ? 'Modifica Fattura' : 'Nuova Fattura Sanitaria'}
          </DialogTitle>
          <DialogDescription>
            Compila i dati per generare una fattura conforme alla normativa italiana
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selezione Paziente e Prestazione */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Paziente e Prestazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paziente">Paziente *</Label>
                <Select value={formData.paziente_id} onValueChange={handlePazienteChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona paziente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pazienti.map((paziente) => (
                      <SelectItem key={paziente.id} value={paziente.id}>
                        {paziente.nome} {paziente.cognome} - {paziente.codice_fiscale || 'CF non inserito'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prestazione">Prestazione *</Label>
                <Select value={formData.prestazione_id} onValueChange={(value) => setFormData({...formData, prestazione_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona prestazione" />
                  </SelectTrigger>
                  <SelectContent>
                    {prestazioni.map((prestazione) => (
                      <SelectItem key={prestazione.id} value={prestazione.id}>
                        {prestazione.nome} - €{Number(prestazione.prezzo_unitario).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data_prestazione">Data Prestazione *</Label>
                <Input
                  id="data_prestazione"
                  type="date"
                  value={formData.data_prestazione}
                  onChange={(e) => setFormData({...formData, data_prestazione: e.target.value})}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Dettagli Economici */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Dettagli Economici
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Importo Base</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-lg font-semibold">€ {importoBase.toFixed(2)}</span>
                    <p className="text-xs text-muted-foreground">IVA Esente (Art. 10 n. 18 DPR 633/72)</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ENPAP (2%)</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-lg font-semibold">€ {importoEnpap.toFixed(2)}</span>
                    <p className="text-xs text-muted-foreground">
                      Contributo cassa previdenziale
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Totale Fattura:</span>
                  <span className="text-2xl font-bold text-primary">€ {totaleFinale.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pagamento e Note */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pagamento e Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metodo_pagamento">Metodo di Pagamento *</Label>
                <Select value={formData.metodo_pagamento} onValueChange={(value) => setFormData({...formData, metodo_pagamento: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona metodo" />
                  </SelectTrigger>
                  <SelectContent>
                    {metodiPagamento.map((metodo) => (
                      <SelectItem key={metodo} value={metodo}>{metodo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="note">Note Aggiuntive</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="Note per la fattura (opzionale)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Normative Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-sm space-y-1">
                <p><strong>Normativa Applicata:</strong></p>
                <p>• IVA Esente: Art. 10 n. 18 DPR 633/72</p>
                <p>• Contributo ENPAP: 2% come da normativa vigente</p>
                <p>• GDPR: Trattamento dati sanitari ex art. 9 Reg. UE 679/2016</p>
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
              {fattura ? 'Aggiorna' : 'Crea'} Fattura
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}