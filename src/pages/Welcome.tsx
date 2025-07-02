import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  Globe,
  Play,
  Zap,
  Award,
  UserCheck,
  Brain,
  Speech,
  Activity,
  Apple,
  Stethoscope,
  Quote
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("basic");

  const benefits = [
    {
      icon: CheckCircle,
      title: "Esenzione IVA e cassa ENPAP preimpostate",
      description: "Tutti i calcoli fiscali automatici e conformi"
    },
    {
      icon: FileText,
      title: "PDF e XML pronti da inviare",
      description: "Fattura elettronica già formattata per SDI"
    },
    {
      icon: Zap,
      title: "Nessun gestionale complicato",
      description: "Interfaccia semplice, risultati immediati"
    }
  ];

  const professionals = [
    { name: "Psicologi", icon: Brain },
    { name: "Logopedisti", icon: Speech },
    { name: "Fisioterapisti", icon: Activity },
    { name: "Dietisti", icon: Apple },
    { name: "Terapisti TNPEE", icon: Stethoscope }
  ];

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "0",
      period: "€/mese",
      description: "Per iniziare subito",
      features: [
        "5 fatture al mese",
        "Watermark FatturaSanitaria",
        "PDF scaricabile",
        "Supporto email"
      ],
      popular: false,
      cta: "Inizia Gratis",
      highlight: false
    },
    {
      id: "basic",
      name: "Basic",
      price: "9",
      period: "€/mese",
      description: "Per professionisti attivi",
      features: [
        "Fatture illimitate",
        "PDF e XML scaricabili",
        "Senza watermark",
        "Supporto prioritario",
        "Backup automatico"
      ],
      popular: true,
      cta: "Scegli Basic",
      highlight: true
    },
    {
      id: "pro",
      name: "Pro",
      price: "15",
      period: "€/mese",
      description: "Funzionalità avanzate",
      features: [
        "Tutto del Basic",
        "Logo personalizzato",
        "Backup cloud multipli",
        "Supporto telefonico",
        "Analytics avanzate"
      ],
      popular: false,
      cta: "Scegli Pro",
      highlight: false
    }
  ];

  const faqs = [
    {
      question: "Posso inviare la fattura al commercialista?",
      answer: "Sì, scarichi sia il PDF che l'XML per il Sistema di Interscambio. Il formato è compatibile con tutti i software commerciali."
    },
    {
      question: "È valida per ENPAP/ENPAPI?",
      answer: "Sì, con calcolo automatico del 2% ENPAP e diciture preimpostate conformi alla normativa per professionisti sanitari."
    },
    {
      question: "E se sbaglio qualcosa?",
      answer: "Puoi modificare tutti i dati prima della generazione. Una volta creata, puoi sempre scaricare nuovamente la fattura."
    },
    {
      question: "Come funziona l'esenzione IVA?",
      answer: "L'esenzione IVA per prestazioni sanitarie (Art. 10 n.18 DPR 633/72) è già preimpostata. Non devi fare nulla."
    },
    {
      question: "Posso cancellarmi quando voglio?",
      answer: "Sì, nessun vincolo contrattuale. Puoi disdire in qualsiasi momento dal tuo account."
    }
  ];

  const testimonials = [
    {
      text: "Finalmente una fattura sanitaria che non mi fa impazzire. In 3 clic ho tutto pronto!",
      author: "Marta",
      role: "Logopedista",
      rating: 5
    },
    {
      text: "Perfetto per noi psicologi. Calcola tutto automaticamente, risparmio ore di lavoro.",
      author: "Dr. Rossi",
      role: "Psicologo",
      rating: 5
    },
    {
      text: "Semplicissimo da usare. Non potrei più farne a meno per la mia attività.",
      author: "Laura",
      role: "Fisioterapista",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">FatturaSanitaria</h1>
              <p className="text-xs text-gray-500">Software di fatturazione sanitaria</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Accedi / Registrati
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Fatture sanitarie.<br />
                <span className="text-blue-600">In 3 clic.</span><br />
                Nessuna complicazione.
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Crea e scarica fatture a norma per prestazioni sanitarie in pochi secondi. 
                Senza agenda. Senza burocrazia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4"
                  onClick={() => navigate('/login')}
                >
                  Prova gratis – Nessuna carta richiesta
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                  <Play className="mr-2 h-5 w-5" />
                  Guarda la demo
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Setup in 2 minuti</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Conforme normative</span>
                </div>
              </div>
            </div>
            <div className="lg:block hidden">
              <div className="bg-white rounded-xl shadow-2xl p-8 border">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-blue-100 rounded"></div>
                    <div className="h-3 bg-blue-100 rounded w-4/5"></div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="h-3 bg-gray-100 rounded w-1/3 mb-2"></div>
                    <div className="h-6 bg-blue-600 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefici rapidi */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo interattiva */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">Guarda quanto è semplice</h3>
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">1</div>
                <h4 className="font-semibold mb-2">Clicca</h4>
                <p className="text-sm text-gray-600">Scegli il paziente</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">2</div>
                <h4 className="font-semibold mb-2">Seleziona</h4>
                <p className="text-sm text-gray-600">La prestazione sanitaria</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">3</div>
                <h4 className="font-semibold mb-2">Genera</h4>
                <p className="text-sm text-gray-600">PDF e XML pronti</p>
              </div>
            </div>
          </div>
          <Button size="lg" variant="outline" className="text-lg px-8">
            <Play className="mr-2 h-5 w-5" />
            Guarda video demo (15 sec)
          </Button>
        </div>
      </section>

      {/* Chi può usarla */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Pensata per tutti i professionisti sanitari</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Specializzata per le esigenze specifiche dei professionisti sanitari italiani
            </p>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {professionals.map((prof, index) => (
              <div key={index} className="text-center p-6 rounded-lg border hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <prof.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">{prof.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Inizia gratis, cresci quando vuoi</h3>
            <p className="text-gray-600">Nessun costo nascosto, nessun vincolo contrattuale</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${plan.highlight ? 'ring-2 ring-blue-600 shadow-xl scale-105' : 'hover:shadow-lg'} transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Più Popolare
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
                    variant={plan.highlight ? 'default' : 'outline'}
                    onClick={() => navigate('/login')}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">Tutti i piani includono supporto tecnico e aggiornamenti automatici</p>
          </div>
        </div>
      </section>

      {/* Testimonianze */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Cosa dicono i professionisti</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-gray-300 mb-4" />
                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Domande frequenti</h3>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg border px-6">
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA finale */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Inizia ora – 5 fatture gratis. Senza carta.
          </h3>
          <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
            Unisciti a centinaia di professionisti sanitari che hanno semplificato la loro fatturazione
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-xl px-12 py-4 rounded-lg font-semibold"
            onClick={() => navigate('/login')}
          >
            Inizia Subito – È Gratis
          </Button>
          <p className="text-blue-200 text-sm mt-6">
            ✓ Setup in 2 minuti ✓ Nessun impegno ✓ Supporto in italiano
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <div>
                <span className="font-semibold text-lg">FatturaSanitaria</span>
                <p className="text-gray-400 text-sm">Software per professionisti sanitari</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                Conforme alle normative italiane • GDPR compliant
              </p>
              <p className="text-gray-500 text-xs mt-1">
                © 2024 FatturaSanitaria. Tutti i diritti riservati.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky CTA mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50">
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          onClick={() => navigate('/login')}
        >
          Prova Gratis – 5 fatture incluse
        </Button>
      </div>
    </div>
  );
}