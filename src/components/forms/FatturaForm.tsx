import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, X, FileText, Calculator, User, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFatture } from "@/hooks/useFatture";
import { useProfile } from "@/hooks/useProfile";
import type { Tables } from "@/integrations/supabase/types";

type Fattura = Tables<'fatture'>;

interface FatturaFormProps {
  fattura?: Fattura;
  trigger?: React.ReactNode;
  pazientePreselezionato?: string;
}

interface PrestazioneRiga {
  prestazione_id: string;
  quantita: number;
  descrizione_personalizzata?: string;
}

export function FatturaForm({ fattura, trigger, pazientePreselezionato }: FatturaFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    paziente_id: pazientePreselezionato || fattura?.paziente_id || "",
    prestazioni: [{ prestazione_id: "", quantita: 1, descrizione_personalizzata: "" }] as PrestazioneRiga[],
    data_prestazione: new Date().toISOString().split('T')[0],
    metodo_pagamento: "",
    note: ""
  });
  
  const { pazienti, prestazioni, createFattura } = useFatture();
  const { profile } = useProfile();
  const { toast } = useToast();

  const metodiPagamento = [
    "Contanti",
    "Bonifico Bancario", 
    "Carta di Credito",
    "Assegno",
    "POS",
    "PayPal"
  ];

  const pazienteSelezionato = pazienti.find(p => p.id === formData.paziente_id);

  // Auto-seleziona prestazione default quando si cambia paziente
  const handlePazienteChange = (pazienteId: string) => {
    const paziente = pazienti.find(p => p.id === pazienteId);
    const prestazioneDefault = (paziente as any)?.prestazione_default_id;
    
    if (prestazioneDefault && formData.prestazioni[0].prestazione_id === "") {
      setFormData({
        ...formData, 
        paziente_id: pazienteId,
        prestazioni: [{ prestazione_id: prestazioneDefault, quantita: 1, descrizione_personalizzata: "" }]
      });
    } else {
      setFormData({
        ...formData, 
        paziente_id: pazienteId
      });
    }
  };

  const aggiungiPrestazione = () => {
    setFormData({
      ...formData,
      prestazioni: [...formData.prestazioni, { prestazione_id: "", quantita: 1, descrizione_personalizzata: "" }]
    });
  };

  const rimuoviPrestazione = (index: number) => {
    if (formData.prestazioni.length > 1) {
      const nuovePrestazioni = formData.prestazioni.filter((_, i) => i !== index);
      setFormData({ ...formData, prestazioni: nuovePrestazioni });
    }
  };

  const aggiornaPrestazione = (index: number, campo: keyof PrestazioneRiga, valore: any) => {
    const nuovePrestazioni = [...formData.prestazioni];
    nuovePrestazioni[index] = { ...nuovePrestazioni[index], [campo]: valore };
    setFormData({ ...formData, prestazioni: nuovePrestazioni });
  };

  // Calcoli automatici
  const totaleDettagliato = formData.prestazioni.reduce((acc, riga) => {
    const prestazione = prestazioni.find(p => p.id === riga.prestazione_id);
    if (prestazione) {
      const importo = Number(prestazione.prezzo_unitario) * riga.quantita;
      acc.imponibile += importo;
    }
    return acc;
  }, { imponibile: 0 });

  const percentualeEnpap = profile?.percentuale_enpap || 2;
  const importoEnpap = totaleDettagliato.imponibile * percentualeEnpap / 100;
  const totaleFinale = totaleDettagliato.imponibile + importoEnpap;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const prestazioniValide = formData.prestazioni.filter(p => p.prestazione_id);
    
    if (!formData.paziente_id || prestazioniValide.length === 0 || !formData.metodo_pagamento) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Paziente, almeno una prestazione e metodo di pagamento sono obbligatori"
      });
      return;
    }

    try {
      const result = await createFattura({
        paziente_id: formData.paziente_id,
        prestazioni: prestazioniValide,
        data_prestazione: formData.data_prestazione,
        metodo_pagamento: formData.metodo_pagamento,
        note: formData.note || undefined
      });
      
      if (result) {
        setOpen(false);
        
        // Reset form
        if (!pazientePreselezionato) {
          setFormData({
            paziente_id: "",
            prestazioni: [{ prestazione_id: "", quantita: 1, descrizione_personalizzata: "" }],
            data_prestazione: new Date().toISOString().split('T')[0],
            metodo_pagamento: "",
            note: ""
          });
        } else {
          setFormData({
            paziente_id: pazientePreselezionato,
            prestazioni: [{ prestazione_id: "", quantita: 1, descrizione_personalizzata: "" }],
            data_prestazione: new Date().toISOString().split('T')[0],
            metodo_pagamento: "",
            note: ""
          });
        }
      }
    } catch (error) {
      console.error('Errore invio form fattura:', error);
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
          {/* Selezione Paziente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Paziente
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

          {/* Prestazioni */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Prestazioni
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.prestazioni.map((riga, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Prestazione {index + 1}</h4>
                    {formData.prestazioni.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => rimuoviPrestazione(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prestazione *</Label>
                      <Select 
                        value={riga.prestazione_id} 
                        onValueChange={(value) => aggiornaPrestazione(index, 'prestazione_id', value)}
                      >
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
                      <Label>Quantità</Label>
                      <Input
                        type="number"
                        min="1"
                        value={riga.quantita}
                        onChange={(e) => aggiornaPrestazione(index, 'quantita', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Descrizione personalizzata (opzionale)</Label>
                    <Textarea
                      value={riga.descrizione_personalizzata || ""}
                      onChange={(e) => aggiornaPrestazione(index, 'descrizione_personalizzata', e.target.value)}
                      placeholder="Descrizione specifica per questa prestazione"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={aggiungiPrestazione}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Prestazione
              </Button>
            </CardContent>
          </Card>

          {/* Dettagli Economici */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Riepilogo Economico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Totale Prestazioni</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-lg font-semibold">€ {totaleDettagliato.imponibile.toFixed(2)}</span>
                    <p className="text-xs text-muted-foreground">IVA Esente (Art. 10 n. 18 DPR 633/72)</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ENPAP ({percentualeEnpap}%)</Label>
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
                <p>• Contributo ENPAP: {percentualeEnpap}% come da normativa vigente</p>
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