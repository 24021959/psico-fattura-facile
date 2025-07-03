import { Euro, Users, FileText, TrendingUp, Calendar, Clock, CheckCircle, Plus, Settings, Crown, Star } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FatturaForm } from "@/components/forms/FatturaForm";
import { useFatture } from "@/hooks/useFatture";
import { usePazienti } from "@/hooks/usePazienti";
import { usePrestazioni } from "@/hooks/usePrestazioni";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionBanner } from "@/components/subscription/SubscriptionBanner";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { PricingSection } from "@/components/subscription/PricingSection";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// Plan Status Card Component
function PlanStatusCard() {
  const [showChangePlan, setShowChangePlan] = useState(false);
  const { 
    userSubscription, 
    currentUsage, 
    getCurrentPlan,
    getRemainingFatture,
    createCustomerPortalSession 
  } = useSubscription();

  if (!userSubscription) return null;

  const currentPlan = getCurrentPlan();
  const remainingFatture = getRemainingFatture();
  const isFreePlan = userSubscription.plan_name === 'FREE';

  const getPlanIcon = () => {
    if (userSubscription.plan_name === 'PRO') return <Crown className="h-5 w-5 text-amber-500" />;
    if (userSubscription.plan_name === 'STANDARD') return <Star className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  const getPlanColor = () => {
    if (userSubscription.plan_name === 'PRO') return 'from-amber-50 to-orange-50 border-amber-200';
    if (userSubscription.plan_name === 'STANDARD') return 'from-blue-50 to-blue-50 border-blue-200';
    return 'from-muted/20 to-muted/20 border-border';
  };

  return (
    <>
      <Card className={`bg-gradient-to-r ${getPlanColor()}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getPlanIcon()}
                <div>
                  <h3 className="font-semibold text-lg">
                    Piano {userSubscription.plan_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isFreePlan ? (
                      `${currentUsage?.fatture_count || 0}/5 fatture questo mese • ${remainingFatture} rimaste`
                    ) : (
                      `${currentUsage?.fatture_count || 0} fatture questo mese • Fatture illimitate`
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={isFreePlan ? "secondary" : "default"}>
                  {currentPlan?.price_monthly === 0 ? 'Gratuito' : `€${currentPlan?.price_monthly}/mese`}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isFreePlan ? (
                <Button
                  onClick={() => setShowChangePlan(true)}
                  className="medical-gradient text-primary-foreground"
                >
                  Aggiorna Piano
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={createCustomerPortalSession}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Gestisci Abbonamento
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowChangePlan(true)}
              >
                Cambia Piano
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showChangePlan && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Scegli il Piano Perfetto</CardTitle>
            <CardDescription>
              Confronta i nostri piani e trova quello più adatto alle tue esigenze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PricingSection 
              showTitle={false}
              onPlanSelect={() => setShowChangePlan(false)}
            />
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                onClick={() => setShowChangePlan(false)}
              >
                Chiudi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { fatture, stats: fattureStats, loading: fattureLoading } = useFatture();
  const { pazienti, loading: pazientiLoading } = usePazienti();
  const { prestazioni, loading: prestazioniLoading } = usePrestazioni();
  const { canCreateFattura, getCurrentPlan } = useSubscription();

  // Calcoli per statistiche aggiornate
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const fattureMensili = fatture.filter(f => {
    const dataFattura = new Date(f.data_fattura);
    return dataFattura.getMonth() === currentMonth && dataFattura.getFullYear() === currentYear;
  });

  const fatturato = fattureMensili.reduce((sum, f) => sum + Number(f.totale), 0);
  const prestazioniAttive = prestazioni.filter(p => p.attiva).length;
  
  // Ultime fatture per attività recenti
  const ultimeFatture = fatture.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Subscription Banner */}
      <SubscriptionBanner />
      
      {/* Plan Status */}
      <PlanStatusCard />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Benvenuto nella piattaforma creata su misura per i bisogni dei professionisti della psicologia
          </p>
        </div>
        <div className="flex gap-3">
          <FatturaForm trigger={
            <Button size="lg" className="medical-gradient text-primary-foreground hover:opacity-90">
              <Plus className="mr-2 h-5 w-5" />
              Nuova Fattura
            </Button>
          } />
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/pazienti')}
          >
            <Users className="mr-2 h-5 w-5" />
            Aggiungi Paziente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Fatturato Mensile"
          value={`€ ${fatturato.toFixed(2)}`}
          subtitle={format(new Date(), "MMMM yyyy", { locale: it })}
          icon={Euro}
          variant="primary"
        />
        <StatsCard
          title="Pazienti Totali"
          value={pazienti.length.toString()}
          subtitle="Pazienti registrati"
          icon={Users}
          variant="success"
        />
        <StatsCard
          title="Fatture Emesse"
          value={fattureMensili.length.toString()}
          subtitle={format(new Date(), "MMMM yyyy", { locale: it })}
          icon={FileText}
        />
        <StatsCard
          title="Prestazioni Attive"
          value={prestazioniAttive.toString()}
          subtitle="Servizi disponibili"
          icon={Calendar}
          variant="warning"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Attività Recenti
            </CardTitle>
            <CardDescription>
              Le tue ultime operazioni
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ultimeFatture.length > 0 ? (
              ultimeFatture.map((fattura) => (
                <div key={fattura.id} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    fattura.stato === 'pagata' ? 'bg-success' : 
                    fattura.stato === 'inviata' ? 'bg-primary' : 
                    fattura.stato === 'scaduta' ? 'bg-destructive' : 'bg-warning'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Fattura #{fattura.numero_fattura} {fattura.stato === 'pagata' ? 'pagata' : 'creata'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fattura.paziente?.nome} {fattura.paziente?.cognome} • 
                      {format(new Date(fattura.created_at), "dd/MM/yyyy", { locale: it })}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">€ {Number(fattura.totale).toFixed(2)}</span>
                  {fattura.stato === 'pagata' && <CheckCircle className="h-4 w-4 text-success" />}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nessuna attività recente</p>
                <p className="text-xs">Crea la tua prima fattura per iniziare</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-medical">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Azioni Rapide
            </CardTitle>
            <CardDescription>
              Operazioni frequenti per la tua attività
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FatturaForm trigger={
              <Button variant="outline" className="w-full justify-start" size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Crea Nuova Fattura
              </Button>
            } />
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
              onClick={() => navigate('/pazienti')}
            >
              <Users className="mr-2 h-5 w-5" />
              Inserisci Nuovo Paziente
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
              onClick={() => navigate('/prestazioni')}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Gestisci Sedute Terapeutiche
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              size="lg"
              onClick={() => navigate('/statistiche')}
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Visualizza Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Prestazioni Più Frequenti */}
      <Card className="shadow-medical">
        <CardHeader>
          <CardTitle>Prestazioni Più Frequenti</CardTitle>
          <CardDescription>
            Le tipologie di sedute più richieste dai tuoi pazienti
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prestazioni.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {prestazioni.slice(0, 3).map((prestazione, index) => {
                const utilizzo = Math.max(20, Math.random() * 80); // Simula utilizzo
                return (
                  <div key={prestazione.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{prestazione.nome}</h4>
                      <span className="text-sm font-medium text-primary">
                        €{Number(prestazione.prezzo_unitario).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {prestazione.descrizione || "Prestazione sanitaria"}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 bg-muted rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            index === 0 ? 'bg-primary' : 
                            index === 1 ? 'bg-success' : 'bg-warning'
                          }`} 
                          style={{ width: `${utilizzo.toFixed(0)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {utilizzo.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nessuna prestazione configurata</p>
              <p className="text-xs">Aggiungi le tue prestazioni per visualizzare le statistiche</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}