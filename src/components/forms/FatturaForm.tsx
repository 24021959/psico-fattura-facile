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

interface FatturaFormProps {
  onSave?: (fattura: any) => void;
  fattura?: any;
  trigger?: React.ReactNode;
}

export function FatturaForm({ onSave, fattura, trigger }: FatturaFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    pazienteId: fattura?.pazienteId || "",
    prestazioneId: fattura?.prestazioneId || "",
    dataPrestazione: fattura?.dataPrestazione || new Date().toISOString().split('T')[0],
    metodoPagamento: fattura?.metodoPagamento || "",
    note: fattura?.note || "",
    importo: fattura?.importo || 0,
    percentualeEnpap: fattura?.percentualeEnpap || 2,
    enpapAddebitata: fattura?.enpapAddebitata ?? true
  });
  const { toast } = useToast();

  // Mock data - in un'app reale verrebbe da API/database
  const pazienti = [
    { id: "1", nome: "Maria", cognome: "Bianchi", codiceFiscale: "BNCMRA85T65H501Z" },
    { id: "2", nome: "Giuseppe", cognome: "Verdi", codiceFiscale: "VRDGPP75L12F205K" },
    { id: "3", nome: "Anna", cognome: "Rossi", codiceFiscale: "RSSANN90P45B963L" }
  ];

  const prestazioni = [
    { id: "1", nome: "Seduta Individuale", codice: "93.29.10", prezzo: 80 },
    { id: "2", nome: "Seduta di Coppia", codice: "93.29.20", prezzo: 120 },
    { id: "3", nome: "Consulenza Online", codice: "93.29.30", prezzo: 70 },
    { id: "4", nome: "Prima Visita", codice: "93.29.40", prezzo: 100 },
    { id: "5", nome: "Test Psicodiagnostici", codice: "93.29.50", prezzo: 150 }
  ];

  const metodiPagamento = [
    "Contanti",
    "Bonifico Bancario", 
    "Carta di Credito",
    "Assegno",
    "POS",
    "Paypal"
  ];

  const prestazioneSelezionata = prestazioni.find(p => p.id === formData.prestazioneId);
  const pazienteSelezionato = pazienti.find(p => p.id === formData.pazienteId);

  // Calcoli automatici
  const importoBase = prestazioneSelezionata?.prezzo || 0;
  const importoEnpap = formData.enpapAddebitata ? (importoBase * formData.percentualeEnpap / 100) : 0;
  const totaleFinale = importoBase + importoEnpap;

  const handlePrestazioneChange = (prestazioneId: string) => {
    const prestazione = prestazioni.find(p => p.id === prestazioneId);
    setFormData({
      ...formData,
      prestazioneId,
      importo: prestazione?.prezzo || 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pazienteId || !formData.prestazioneId || !formData.metodoPagamento) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Paziente, prestazione e metodo di pagamento sono obbligatori"
      });
      return;
    }

    const fatturaData = {
      ...formData,
      id: fattura?.id || `2024-${String(Date.now()).slice(-3)}`,
      numero: fattura?.numero || String(Date.now()).slice(-3),
      anno: "2024",
      data: formData.dataPrestazione,
      paziente: pazienteSelezionato,
      prestazione: prestazioneSelezionata,
      importo: importoBase,
      enpap: importoEnpap,
      totale: totaleFinale,
      stato: "emessa"
    };

    onSave?.(fatturaData);
    
    toast({
      title: "Successo",
      description: `Fattura ${fattura ? 'aggiornata' : 'creata'} correttamente`
    });
    
    setOpen(false);
    
    if (!fattura) {
      setFormData({
        pazienteId: "",
        prestazioneId: "",
        dataPrestazione: new Date().toISOString().split('T')[0],
        metodoPagamento: "",
        note: "",
        importo: 0,
        percentualeEnpap: 2,
        enpapAddebitata: true
      });
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
                <Select value={formData.pazienteId} onValueChange={(value) => setFormData({...formData, pazienteId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona paziente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pazienti.map((paziente) => (
                      <SelectItem key={paziente.id} value={paziente.id}>
                        {paziente.nome} {paziente.cognome} - {paziente.codiceFiscale}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prestazione">Prestazione *</Label>
                <Select value={formData.prestazioneId} onValueChange={handlePrestazioneChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona prestazione" />
                  </SelectTrigger>
                  <SelectContent>
                    {prestazioni.map((prestazione) => (
                      <SelectItem key={prestazione.id} value={prestazione.id}>
                        {prestazione.nome} - €{prestazione.prezzo} ({prestazione.codice})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dataPrestazione">Data Prestazione *</Label>
                <Input
                  id="dataPrestazione"
                  type="date"
                  value={formData.dataPrestazione}
                  onChange={(e) => setFormData({...formData, dataPrestazione: e.target.value})}
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
                  <Label>ENPAP ({formData.percentualeEnpap}%)</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="text-lg font-semibold">€ {importoEnpap.toFixed(2)}</span>
                    <p className="text-xs text-muted-foreground">
                      {formData.enpapAddebitata ? "Addebitata al cliente" : "A carico professionista"}
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
                <Label htmlFor="metodoPagamento">Metodo di Pagamento *</Label>
                <Select value={formData.metodoPagamento} onValueChange={(value) => setFormData({...formData, metodoPagamento: value})}>
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