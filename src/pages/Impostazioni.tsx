import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User, Building, CreditCard, FileText, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function Impostazioni() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Impostazioni salvate",
      description: "Le tue impostazioni sono state aggiornate con successo"
    });
  };

  const handleTestXML = () => {
    // Simula test XML
    toast({
      title: "Test XML completato",
      description: "Il file XML è conforme alle specifiche SDI"
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Impostazioni</h1>
            <p className="text-muted-foreground">
              Configura i tuoi dati professionali e le impostazioni di fatturazione
            </p>
          </div>
          <Button onClick={handleSave} className="medical-gradient text-primary-foreground hover:opacity-90">
            Salva Impostazioni
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Dati Professionista */}
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Dati Professionista
              </CardTitle>
              <CardDescription>
                Informazioni anagrafiche per fatturazione
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" defaultValue="Maria" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cognome">Cognome</Label>
                  <Input id="cognome" defaultValue="Rossi" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="codiceFiscale">Codice Fiscale</Label>
                <Input id="codiceFiscale" defaultValue="RSSMRA80A01H501Z" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="partitaIva">Partita IVA</Label>
                <Input id="partitaIva" defaultValue="12345678901" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ordineAlbo">Ordine/Albo</Label>
                <Select defaultValue="psicologi">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="psicologi">Ordine Psicologi</SelectItem>
                    <SelectItem value="medici">Ordine Medici</SelectItem>
                    <SelectItem value="altro">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numeroIscrizione">Numero Iscrizione</Label>
                <Input id="numeroIscrizione" defaultValue="12345" />
              </div>
            </CardContent>
          </Card>

          {/* Studio/Sede */}
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Studio/Sede Legale
              </CardTitle>
              <CardDescription>
                Indirizzo per fatturazione e corrispondenza
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="indirizzo">Indirizzo</Label>
                <Input id="indirizzo" defaultValue="Via Roma, 123" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="citta">Città</Label>
                  <Input id="citta" defaultValue="Milano" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cap">CAP</Label>
                  <Input id="cap" defaultValue="20100" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provincia">Provincia</Label>
                  <Input id="provincia" defaultValue="MI" maxLength={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nazione">Nazione</Label>
                  <Input id="nazione" defaultValue="IT" maxLength={2} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input id="telefono" defaultValue="+39 02 1234567" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="maria.rossi@psicologo.it" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pec">PEC</Label>
                <Input id="pec" type="email" defaultValue="maria.rossi@pec.psicologo.it" />
              </div>
            </CardContent>
          </Card>

          {/* Impostazioni Fiscali */}
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Impostazioni Fiscali
              </CardTitle>
              <CardDescription>
                Configurazione per fatturazione e SDI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="regimeFiscale">Regime Fiscale</Label>
                <Select defaultValue="RF19">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RF01">Ordinario</SelectItem>
                    <SelectItem value="RF19">Regime forfettario</SelectItem>
                    <SelectItem value="RF18">Altro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="codiceDestinatario">Codice Destinatario SDI</Label>
                <Input id="codiceDestinatario" defaultValue="0000000" maxLength={7} />
                <p className="text-xs text-muted-foreground">
                  Per fatturazione elettronica. Usa 0000000 se invii via PEC
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cassePrevidenziali">Cassa Previdenziale</Label>
                <Select defaultValue="ENPAP">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENPAP">ENPAP (Psicologi)</SelectItem>
                    <SelectItem value="ENPAPI">ENPAPI (Infermieri)</SelectItem>
                    <SelectItem value="altro">Altra cassa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="percentualeCassa">Percentuale Cassa (%)</Label>
                <Input id="percentualeCassa" type="number" defaultValue="2" step="0.1" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ENPAP addebitata al paziente</Label>
                  <p className="text-sm text-muted-foreground">
                    Se disattivato, sarà a carico del professionista
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Pagamenti */}
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Dati Bancari
              </CardTitle>
              <CardDescription>
                Informazioni per pagamenti e fatturazione
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input id="iban" defaultValue="IT60 X123 4567 8901 2345 678901" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="banca">Banca</Label>
                <Input id="banca" defaultValue="Banca Esempio" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="swift">Codice SWIFT/BIC</Label>
                <Input id="swift" defaultValue="BCITITMM" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="intestatario">Intestatario Conto</Label>
                <Input id="intestatario" defaultValue="Dott.ssa Maria Rossi" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sezione SDI e XML */}
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Sistema di Interscambio (SDI)
            </CardTitle>
            <CardDescription>
              Configurazione per fatturazione elettronica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Configurazione SDI</h4>
                <div className="space-y-2">
                  <Label htmlFor="progressivoInvio">Progressivo Invio</Label>
                  <Input id="progressivoInvio" defaultValue="00001" />
                  <p className="text-xs text-muted-foreground">
                    Numerazione progressiva per invii SDI
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Fatturazione Elettronica Attiva</Label>
                    <p className="text-sm text-muted-foreground">
                      Genera automaticamente XML per SDI
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Test e Validazione</h4>
                <Button onClick={handleTestXML} variant="outline" className="w-full">
                  Testa Formato XML
                </Button>
                <Button variant="outline" className="w-full">
                  Scarica XML di Test
                </Button>
                <p className="text-xs text-muted-foreground">
                  Testa la validità dei tuoi XML prima dell'invio al SDI
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-medium text-primary mb-2">Informazioni SDI</h4>
              <div className="text-sm space-y-1">
                <p>• <strong>Formato:</strong> FatturaPA v1.2.1</p>
                <p>• <strong>Regime IVA:</strong> Esente per prestazioni sanitarie</p>
                <p>• <strong>Codice Natura:</strong> N2 (Non soggette)</p>
                <p>• <strong>Invio:</strong> Tramite PEC o Codice Destinatario</p>
                <p>• <strong>Conservazione:</strong> Obbligatoria per 10 anni</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Note Template */}
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle>Template Note Fattura</CardTitle>
            <CardDescription>
              Testo standard che apparirà in tutte le fatture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="templateNote">Note Standard</Label>
              <Textarea
                id="templateNote"
                rows={4}
                defaultValue="Prestazione sanitaria esente IVA ai sensi dell'Art. 10 n. 18 DPR 633/72.
Contributo ENPAP 2% come da normativa vigente.
Trattamento dati personali ex art. 9 Reg. UE 679/2016 - GDPR.
Fattura emessa tramite FatturaPsicologo."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}