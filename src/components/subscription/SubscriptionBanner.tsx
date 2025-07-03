import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { Crown, Star, Settings, AlertCircle } from "lucide-react";
import { useState } from "react";
import { UpgradeModal } from "./UpgradeModal";

export function SubscriptionBanner() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { 
    userSubscription, 
    currentUsage, 
    getCurrentPlan, 
    getRemainingFatture,
    createCustomerPortalSession,
    loading 
  } = useSubscription();

  if (loading || !userSubscription) return null;

  const currentPlan = getCurrentPlan();
  const remainingFatture = getRemainingFatture();
  const isFreePlan = userSubscription.plan_name === 'FREE';
  const isLimitReached = remainingFatture === 0 && isFreePlan;

  const getPlanIcon = () => {
    if (userSubscription.plan_name === 'PRO') return <Crown className="h-4 w-4 text-amber-500" />;
    if (userSubscription.plan_name === 'STANDARD') return <Star className="h-4 w-4 text-blue-500" />;
    return null;
  };

  const getPlanColor = () => {
    if (userSubscription.plan_name === 'PRO') return 'from-amber-50 to-orange-50 border-amber-200';
    if (userSubscription.plan_name === 'STANDARD') return 'from-blue-50 to-blue-50 border-blue-200';
    return 'from-muted/20 to-muted/20 border-border';
  };

  return (
    <>
      <Card className={`bg-gradient-to-r ${getPlanColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getPlanIcon()}
                <Badge variant={isFreePlan ? "secondary" : "default"}>
                  Piano {userSubscription.plan_name}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {isFreePlan ? (
                  <div className="flex items-center gap-1">
                    {isLimitReached && <AlertCircle className="h-4 w-4 text-destructive" />}
                    <span className={isLimitReached ? "text-destructive font-medium" : ""}>
                      {currentUsage?.fatture_count || 0}/5 fatture questo mese
                    </span>
                  </div>
                ) : (
                  <span>
                    {currentUsage?.fatture_count || 0} fatture questo mese • Fatture illimitate
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isFreePlan && (
                <Button
                  size="sm"
                  onClick={() => setShowUpgradeModal(true)}
                  className="medical-gradient text-primary-foreground"
                >
                  Aggiorna Piano
                </Button>
              )}
              
              {!isFreePlan && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createCustomerPortalSession}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Gestisci
                </Button>
              )}
            </div>
          </div>

          {isFreePlan && remainingFatture <= 2 && (
            <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-md">
              <p className="text-sm text-warning-foreground">
                {remainingFatture === 0 
                  ? "⚠️ Hai raggiunto il limite mensile. Aggiorna il piano per continuare."
                  : `⚠️ Ti rimangono solo ${remainingFatture} fatture questo mese.`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <UpgradeModal 
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        title="Aggiorna il tuo piano"
        description="Passa a un piano a pagamento per sbloccare tutte le funzionalità e rimuovere i limiti."
      />
    </>
  );
}