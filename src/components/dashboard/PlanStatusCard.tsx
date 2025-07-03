import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { Crown, Star, Settings } from "lucide-react";
import { useState } from "react";
import { PricingSection } from "@/components/subscription/PricingSection";

export function PlanStatusCard() {
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
    return <Star className="h-5 w-5 text-muted-foreground" />;
  };

  const getPlanColor = () => {
    if (userSubscription.plan_name === 'PRO') return 'bg-pastel-yellow-light border-pastel-yellow';
    if (userSubscription.plan_name === 'STANDARD') return 'bg-pastel-blue-light border-pastel-blue';
    return 'bg-pastel-purple-light border-pastel-purple';
  };

  return (
    <>
      <Card className={`shadow-medical ${getPlanColor()}`}>
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
              {!isFreePlan && (
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
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Scegli il Piano Perfetto</h3>
              <p className="text-sm text-muted-foreground">
                Confronta i nostri piani e trova quello più adatto alle tue esigenze
              </p>
            </div>
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