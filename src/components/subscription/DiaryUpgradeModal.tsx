import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Star, Brain } from "lucide-react";
import { PricingCard } from "@/components/subscription/PricingCard";
import { useSubscription } from "@/hooks/useSubscription";

interface DiaryUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiaryUpgradeModal({ open, onOpenChange }: DiaryUpgradeModalProps) {
  const { plans, createCheckoutSession } = useSubscription();
  
  const paidPlans = plans.filter(plan => plan.name !== 'FREE');

  const handleSelectPlan = async (planName: string) => {
    try {
      await createCheckoutSession(planName);
    } catch (error) {
      console.error('Errore creazione sessione checkout:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Diario Terapeutico</DialogTitle>
          <DialogDescription className="text-lg">
            Il diario terapeutico è una funzionalità avanzata disponibile solo per i piani a pagamento.
            Scegli il piano che fa per te e inizia a gestire i tuoi pazienti in modo professionale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-center">Con il Diario Terapeutico puoi:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Tracciare ogni seduta terapeutica</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Annotare progressi del paziente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Assegnare esercizi personalizzati</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Backup sicuro e crittografato</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {paidPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isPopular={plan.name === 'STANDARD'}
                onSelect={handleSelectPlan}
              />
            ))}
          </div>

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="mt-4"
            >
              Continua con il piano FREE
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}