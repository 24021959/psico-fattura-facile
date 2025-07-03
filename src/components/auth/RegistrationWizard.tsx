import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ChevronLeft, ChevronRight, User, CreditCard, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { PlanSelector } from "./PlanSelector";
import { useSubscription } from "@/hooks/useSubscription";
interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  nome: string;
  cognome: string;
  acceptTerms: boolean;
  selectedPlan: string;
}
export function RegistrationWizard({
  onClose
}: {
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    register
  } = useAuth();
  const {
    createCheckoutSession
  } = useSubscription();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    password: "",
    confirmPassword: "",
    nome: "",
    cognome: "",
    acceptTerms: false,
    selectedPlan: "FREE"
  });
  const updateFormData = (field: keyof RegistrationData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError("");
  };
  const validateStep1 = () => {
    if (!formData.email || !formData.password || !formData.nome || !formData.cognome) {
      setError("Tutti i campi sono obbligatori");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Le password non coincidono");
      return false;
    }
    if (formData.password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return false;
    }
    if (!formData.acceptTerms) {
      setError("Devi accettare i termini e condizioni");
      return false;
    }
    return true;
  };
  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleCompleteRegistration = async () => {
    setLoading(true);
    setError("");
    try {
      // Prima registra l'utente
      const result = await register(formData.email, formData.password, formData.nome, formData.cognome);
      if (!result.success) {
        setError(result.error || "Errore durante la registrazione");
        setLoading(false);
        return;
      }

      // Se ha scelto un piano gratuito, completa la registrazione
      if (formData.selectedPlan === "FREE") {
        toast({
          title: "Registrazione completata!",
          description: "Controlla la tua email per verificare l'account. Piano FREE attivato."
        });
        navigate("/dashboard");
        return;
      }

      // Se ha scelto un piano a pagamento, avvia Stripe checkout
      try {
        await createCheckoutSession(formData.selectedPlan);
        toast({
          title: "Registrazione completata!",
          description: "Completa il pagamento per attivare il piano scelto. Controlla anche la tua email per verificare l'account."
        });
        navigate("/dashboard");
      } catch (error) {
        // Se il checkout fallisce, l'utente è comunque registrato con piano FREE
        toast({
          title: "Registrazione completata!",
          description: "Errore nel pagamento. Account creato con piano FREE. Controlla la tua email per verificare l'account.",
          variant: "destructive"
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      setError(error.message || "Errore durante la registrazione");
    } finally {
      setLoading(false);
    }
  };
  const steps = [{
    number: 1,
    title: "Dati Personali",
    icon: User
  }, {
    number: 2,
    title: "Scegli Piano",
    icon: CreditCard
  }, {
    number: 3,
    title: "Conferma",
    icon: CheckCircle
  }];
  return <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Crea il tuo account</CardTitle>
        <CardDescription>
          Configura il tuo profilo e scegli il piano perfetto per te
        </CardDescription>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mt-6 gap-4">
          {steps.map((step, index) => <div key={step.number} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                ${currentStep >= step.number ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'}
              `}>
                <step.icon className="h-5 w-5" />
              </div>
              <div className={`ml-2 text-sm font-medium ${currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.title}
              </div>
              {index < steps.length - 1 && <ChevronRight className="mx-4 h-4 w-4 text-muted-foreground" />}
            </div>)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>}

        {/* Step 1: Personal Data */}
        {currentStep === 1 && <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={formData.nome} onChange={e => updateFormData('nome', e.target.value)} placeholder="Mario" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cognome">Cognome</Label>
                <Input id="cognome" value={formData.cognome} onChange={e => updateFormData('cognome', e.target.value)} placeholder="Rossi" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => updateFormData('email', e.target.value)} placeholder="la-tua-email@esempio.it" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={e => updateFormData('password', e.target.value)} placeholder="••••••••" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Conferma Password</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={e => updateFormData('confirmPassword', e.target.value)} placeholder="••••••••" required />
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="terms" checked={formData.acceptTerms} onChange={e => updateFormData('acceptTerms', e.target.checked)} className="rounded" />
              <Label htmlFor="terms" className="text-sm">
                Accetto i <a href="#" className="text-primary underline">termini e condizioni</a>
              </Label>
            </div>
          </div>}

        {/* Step 2: Plan Selection */}
        {currentStep === 2 && <div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Scegli il piano perfetto per te</h3>
              
            </div>
            <PlanSelector selectedPlan={formData.selectedPlan} onPlanSelect={plan => updateFormData('selectedPlan', plan)} />
          </div>}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Conferma la tua registrazione</h3>
              <p className="text-muted-foreground">
                Verifica i tuoi dati prima di completare la registrazione
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
                <p className="font-medium">{formData.nome} {formData.cognome}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="font-medium">{formData.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Piano Scelto</Label>
                <p className="font-medium">{formData.selectedPlan}</p>
              </div>
            </div>

            {formData.selectedPlan !== "FREE" && <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  Dopo la registrazione verrai reindirizzato a Stripe per completare il pagamento del piano {formData.selectedPlan}.
                </AlertDescription>
              </Alert>}
          </div>}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={currentStep === 1 ? onClose : handleBack} disabled={loading}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            {currentStep === 1 ? 'Annulla' : 'Indietro'}
          </Button>

          {currentStep < 3 ? <Button onClick={handleNext} disabled={loading}>
              Avanti
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button> : <Button onClick={handleCompleteRegistration} disabled={loading} className="medical-gradient text-primary-foreground">
              {loading ? "Registrazione..." : "Completa Registrazione"}
            </Button>}
        </div>
      </CardContent>
    </Card>;
}