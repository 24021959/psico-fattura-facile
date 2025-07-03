import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Eye, EyeOff, Heart, Mail } from "lucide-react";
import { RegistrationWizard } from "@/components/auth/RegistrationWizard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const {
    login,
    register,
    resetPassword,
    isLoading
  } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const {
    toast
  } = useToast();

  // Stati form login
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Stati form registrazione
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nome: "",
    cognome: "",
    acceptTerms: false
  });

  // Reset password
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  
  // Registration wizard
  const [showRegistrationWizard, setShowRegistrationWizard] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginData.email || !loginData.password) {
      setError("Inserisci email e password");
      return;
    }
    const result = await login(loginData.email, loginData.password);
    if (!result.success) {
      if (result.error?.includes("Email not confirmed")) {
        setError("Devi confermare la tua email prima di accedere. Controlla la tua casella di posta (anche spam) e clicca sul link di verifica.");
      } else {
        setError(result.error || "Errore durante l'accesso");
      }
    } else {
      // Login successful - redirect to dashboard
      navigate("/");
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!registerData.email || !registerData.password || !registerData.nome || !registerData.cognome) {
      setError("Tutti i campi sono obbligatori");
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    if (registerData.password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }
    if (!registerData.acceptTerms) {
      setError("Devi accettare i termini e condizioni");
      return;
    }
    const result = await register(registerData.email, registerData.password, registerData.nome, registerData.cognome);
    if (result.success) {
      toast({
        title: "Registrazione completata",
        description: "Controlla la tua email per verificare l'account"
      });
    } else {
      setError(result.error || "Errore durante la registrazione");
    }
  };
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Inserisci la tua email");
      return;
    }
    const result = await resetPassword(resetEmail);
    if (result.success) {
      toast({
        title: "Email inviata",
        description: "Controlla la tua casella email per le istruzioni di reset"
      });
      setShowResetForm(false);
      setResetEmail("");
    } else {
      setError(result.error || "Errore durante l'invio dell'email");
    }
  };
  if (showRegistrationWizard) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-success/5 flex items-center justify-center p-4">
      <RegistrationWizard onClose={() => setShowRegistrationWizard(false)} />
    </div>;
  }

  if (showResetForm) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-success/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <span className="text-primary-foreground font-bold text-xl">ψ</span>
            </div>
            <CardTitle>Recupera Password</CardTitle>
            <CardDescription>
              Inserisci la tua email per ricevere le istruzioni
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>}
              
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input id="resetEmail" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="la-tua-email@esempio.it" required />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowResetForm(false)}>
                  Annulla
                </Button>
                <Button type="submit" className="flex-1 medical-gradient text-primary-foreground" disabled={isLoading}>
                  {isLoading ? "Invio..." : "Invia"}
                  <Mail className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-success/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold text-2xl">ψ</span>
          </div>
          <CardTitle className="text-2xl">MedInvoice</CardTitle>
          <CardDescription>
            Software di fatturazione per professionisti sanitari
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="login">Accedi</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={loginData.email} onChange={e => setLoginData({
                  ...loginData,
                  email: e.target.value
                })} placeholder="la-tua-email@esempio.it" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} value={loginData.password} onChange={e => setLoginData({
                    ...loginData,
                    password: e.target.value
                  })} placeholder="••••••••" required />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full medical-gradient text-primary-foreground" disabled={isLoading}>
                  {isLoading ? "Accesso..." : "Accedi"}
                </Button>

                <Button type="button" variant="link" className="w-full" onClick={() => setShowResetForm(true)}>
                  Password dimenticata?
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Non hai ancora un account?
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowRegistrationWizard(true)}
            >
              Crea un nuovo account
            </Button>
          </div>

          
        </CardContent>
      </Card>
    </div>;
}