import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  CheckCircle, 
  Shield, 
  FileText, 
  Users, 
  Euro, 
  Download,
  Star,
  Clock,
  Globe
} from "lucide-react";

export default function Welcome() {
  const [selectedPlan, setSelectedPlan] = useState("basic");

  const features = [
    {
      icon: Users,
      title: "Gestione Pazienti",
      description: "Anagrafica completa dei tuoi pazienti con dati GDPR conformi"
    },
    {
      icon: FileText,
      title: "Fatturazione Automatica",
      description: "Genera fatture PDF e XML conformi alla normativa italiana"
    },
    {
      icon: Shield,
      title: "IVA Esente",
      description: "Gestione automatica esenzione IVA per prestazioni sanitarie"
    },
    {
      icon: Euro,
      title: "ENPAP Integrato",
      description: "Calcolo automatico contributi previdenziali 2%"
    },
    {
      icon: Download,
      title: "Export SDI",
      description: "XML compatibile Sistema di Interscambio per fatturazione elettronica"
    },
    {
      icon: Globe,
      title: "Cloud Sicuro",
      description: "I tuoi dati sempre al sicuro e accessibili ovunque"
    }
  ];

  const plans = [
    {
      id: "free",
      name: "Gratuito",
      price: "€ 0",
      period: "sempre",
      description: "Perfetto per iniziare",
      features: [
        "Max 5 fatture/mese",
        "3 pazienti attivi",
        "Export PDF",
        "Supporto email",
        "Branding FatturaPsicologo"
      ],
      popular: false,
      cta: "Inizia Gratis"
    },
    {
      id: "basic",
      name: "Basic",
      price: "€ 9",
      period: "/mese",
      description: "Per professionisti attivi",
      features: [
        "Fatture illimitate",
        "Pazienti illimitati",
        "Export PDF + XML",
        "Supporto prioritario",
        "Senza branding",
        "Backup automatico"
      ],
      popular: true,
      cta: "Scegli Basic"
    },
    {
      id: "pro",
      name: "Professional",
      price: "€ 15",
      period: "/mese",
      description: "Funzionalità avanzate",
      features: [
        "Tutto del Basic",
        "Statistiche avanzate",
        "API personalizzate",
        "Supporto telefonico",
        "Backup multipli",
        "White label"
      ],
      popular: false,
      cta: "Scegli Pro"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-success/5">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mx-auto w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-lg">
            <span className="text-primary-foreground font-bold text-3xl">ψ</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            <span className="text-gradient">FatturaPsicologo</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Il software di fatturazione progettato specificamente per psicologi e professionisti sanitari.
            Conforme alla normativa italiana, semplice da usare.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="medical-gradient text-primary-foreground px-8"
              onClick={() => window.location.href = '/login'}
            >
              Accedi / Registrati
            </Button>
            <Button size="lg" variant="outline">
              Guarda la Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Setup in 5 minuti</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-success" />
              <span>Made in Italy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Tutto quello che ti serve
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              FatturaPsicologo è stato progettato specificamente per le esigenze dei professionisti sanitari italiani
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-medical hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Prezzi Semplici e Trasparenti
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Scegli il piano più adatto alla tua attività. Puoi cambiare o disdire in qualsiasi momento.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative shadow-medical hover:shadow-lg transition-all duration-200 ${
                  plan.popular ? 'ring-2 ring-primary shadow-xl' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Più Popolare
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'medical-gradient text-primary-foreground' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground mb-4">
              Tutti i piani includono 30 giorni di prova gratuita
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Cancellazione immediata</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Pagamenti sicuri</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto per iniziare?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unisciti a centinaia di psicologi che hanno già scelto FatturaPsicologo 
            per gestire la loro fatturazione in modo semplice e conforme.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="medical-gradient text-primary-foreground px-8">
              Inizia la Prova Gratuita
            </Button>
            <Button size="lg" variant="outline">
              Contattaci per una Demo
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            Nessuna carta di credito richiesta • Setup guidato incluso • Supporto in italiano
          </p>
        </div>
      </section>
    </div>
  );
}