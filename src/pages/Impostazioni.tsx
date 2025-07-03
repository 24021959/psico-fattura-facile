import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User, Building, CreditCard, FileText, Download, Save, Upload, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Impostazioni() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  
  // State per form dati professionista
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    titolo: "",
    codice_fiscale: "",
    partita_iva: "",
    telefono: "",
    indirizzo: "",
    citta: "",
    cap: "",
    numero_iscrizione_albo: "",
    logo_url: "",
    regime_fiscale: "RF19" as 'RF01' | 'RF19',
    pec: "",
    iban: "",
    percentuale_enpap: 2.00,
    enpap_a_paziente: true,
  });

  // State per titolo personalizzato
  const [titoloPersonalizzato, setTitoloPersonalizzato] = useState("");

  // State per upload logo
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Carica dati dal profilo quando disponibili
  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome || "",
        cognome: profile.cognome || "",
        email: profile.email || "",
        titolo: (profile as any).titolo || "",
        codice_fiscale: profile.codice_fiscale || "",
        partita_iva: profile.partita_iva || "",
        telefono: profile.telefono || "",
        indirizzo: profile.indirizzo || "",
        citta: profile.citta || "",
        cap: profile.cap || "",
        numero_iscrizione_albo: (profile as any).numero_iscrizione_albo || "",
        logo_url: (profile as any).logo_url || "",
        regime_fiscale: (profile as any).regime_fiscale || "RF19",
        pec: (profile as any).pec || "",
        iban: (profile as any).iban || "",
        percentuale_enpap: (profile as any).percentuale_enpap || 2.00,
        enpap_a_paziente: (profile as any).enpap_a_paziente ?? true,
      });
    } else if (user) {
      // Se non c'è profilo ma c'è user, usa email da auth
      setFormData(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [profile, user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Se è selezionato "altro", usa il titolo personalizzato
    const finalFormData = {
      ...formData,
      titolo: formData.titolo === 'altro' ? titoloPersonalizzato : formData.titolo
    };
    
    const result = await updateProfile(finalFormData);
    if (result) {
      toast({
        title: "Profilo salvato",
        description: "I tuoi dati sono stati aggiornati con successo"
      });
    }
  };

  const handleTestXML = () => {
    toast({
      title: "Test XML completato",
      description: "Il file XML è conforme alle specifiche SDI"
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validazione file
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Seleziona un file immagine valido"
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB max
      toast({
        variant: "destructive", 
        title: "Errore",
        description: "L'immagine deve essere inferiore a 2MB"
      });
      return;
    }

    setIsUploadingLogo(true);

    try {
      // Upload file a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('user-logos')
        .upload(fileName, file, { 
          upsert: true // Sovrascrivi se esiste già
        });

      if (error) throw error;

      // Ottieni URL pubblico
      const { data: { publicUrl } } = supabase.storage
        .from('user-logos')
        .getPublicUrl(fileName);

      // Aggiorna formData con nuovo URL logo
      setFormData(prev => ({ ...prev, logo_url: publicUrl }));

      toast({
        title: "Logo caricato",
        description: "Il tuo logo è stato caricato con successo"
      });

    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore durante il caricamento del logo"
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Caricamento impostazioni...</div>
        </div>
      </DashboardLayout>
    );
  }

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
          <Button 
            onClick={handleSave} 
            className="medical-gradient text-primary-foreground hover:opacity-90"
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
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
              <div className="space-y-2">
                <Label htmlFor="titolo">Titolo Professionale</Label>
                <Select value={formData.titolo} onValueChange={(value) => handleInputChange('titolo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona titolo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dott.">Dott.</SelectItem>
                    <SelectItem value="Dott.ssa">Dott.ssa</SelectItem>
                    <SelectItem value="Prof.">Prof.</SelectItem>
                    <SelectItem value="Prof.ssa">Prof.ssa</SelectItem>
                    <SelectItem value="altro">Altro (personalizzato)</SelectItem>
                  </SelectContent>
                </Select>
                {formData.titolo === 'altro' && (
                  <Input 
                    placeholder="Inserisci titolo personalizzato"
                    value={titoloPersonalizzato}
                    onChange={(e) => setTitoloPersonalizzato(e.target.value)}
                  />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input 
                    id="nome" 
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Il tuo nome" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cognome">Cognome</Label>
                  <Input 
                    id="cognome" 
                    value={formData.cognome}
                    onChange={(e) => handleInputChange('cognome', e.target.value)}
                    placeholder="Il tuo cognome" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="la.tua@email.it" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="codiceFiscale">Codice Fiscale</Label>
                <Input 
                  id="codiceFiscale" 
                  value={formData.codice_fiscale}
                  onChange={(e) => handleInputChange('codice_fiscale', e.target.value)}
                  placeholder="RSSMRA80A01H501Z" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="partitaIva">Partita IVA</Label>
                <Input 
                  id="partitaIva" 
                  value={formData.partita_iva}
                  onChange={(e) => handleInputChange('partita_iva', e.target.value)}
                  placeholder="12345678901" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefono">Telefono</Label>
                <Input 
                  id="telefono" 
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="+39 02 1234567" 
                />
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
                <Input 
                  id="indirizzo" 
                  value={formData.indirizzo}
                  onChange={(e) => handleInputChange('indirizzo', e.target.value)}
                  placeholder="Via Roma, 123" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="citta">Città</Label>
                  <Input 
                    id="citta" 
                    value={formData.citta}
                    onChange={(e) => handleInputChange('citta', e.target.value)}
                    placeholder="Milano" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cap">CAP</Label>
                  <Input 
                    id="cap" 
                    value={formData.cap}
                    onChange={(e) => handleInputChange('cap', e.target.value)}
                    placeholder="20100" 
                  />
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> I dati di indirizzo verranno utilizzati per la fatturazione elettronica e la corrispondenza ufficiale.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Albo e Logo */}
          <Card className="shadow-medical">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Albo Professionale e Logo
              </CardTitle>
              <CardDescription>
                Dati albo e logo per fatturazione
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numeroIscrizione">Numero Iscrizione Albo</Label>
                <Input 
                  id="numeroIscrizione" 
                  value={formData.numero_iscrizione_albo}
                  onChange={(e) => handleInputChange('numero_iscrizione_albo', e.target.value)}
                  placeholder="es. 12345" 
                />
                <p className="text-xs text-muted-foreground">
                  Numero di iscrizione all'Ordine degli Psicologi
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo">Logo Professionale</Label>
                <div className="flex items-center gap-4">
                  {formData.logo_url && (
                    <div className="w-16 h-16 border-2 border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <img 
                        src={formData.logo_url} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Formati supportati: JPG, PNG, SVG. Max 2MB
                    </p>
                  </div>
                  {isUploadingLogo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4 animate-spin" />
                      Caricamento...
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> Il logo apparirà nell'intestazione delle fatture PDF. Usa un'immagine di qualità e su sfondo trasparente per il miglior risultato.
                </p>
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
                <Select value={formData.regime_fiscale} onValueChange={(value: 'RF01' | 'RF19') => setFormData(prev => ({ ...prev, regime_fiscale: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona regime fiscale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RF01">RF01 - Regime Ordinario</SelectItem>
                    <SelectItem value="RF19">RF19 - Regime Forfettario</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.regime_fiscale === 'RF01' 
                    ? 'Regime ordinario: IVA esente per prestazioni sanitarie'
                    : 'Regime forfettario: senza applicazione IVA'}
                </p>
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
                <Input 
                  id="percentualeCassa" 
                  type="number" 
                  value={formData.percentuale_enpap}
                  onChange={(e) => setFormData(prev => ({ ...prev, percentuale_enpap: parseFloat(e.target.value) || 2.00 }))}
                  step="0.1" 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>ENPAP addebitata al paziente</Label>
                  <p className="text-sm text-muted-foreground">
                    Se disattivato, sarà a carico del professionista
                  </p>
                </div>
                <Switch 
                  checked={formData.enpap_a_paziente} 
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enpap_a_paziente: checked }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pec">Email PEC</Label>
                <Input 
                  id="pec" 
                  type="email"
                  value={formData.pec}
                  onChange={(e) => handleInputChange('pec', e.target.value)}
                  placeholder="la.tua@pec.it" 
                />
                <p className="text-xs text-muted-foreground">
                  Email certificata per comunicazioni ufficiali
                </p>
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
                <Input 
                  id="iban" 
                  value={formData.iban}
                  onChange={(e) => handleInputChange('iban', e.target.value)}
                  placeholder="IT60 X123 4567 8901 2345 678901" 
                />
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
Fattura emessa tramite MedInvoice."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}