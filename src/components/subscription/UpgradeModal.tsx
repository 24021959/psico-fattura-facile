import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PricingCard } from "./PricingCard";
import { useSubscription } from "@/hooks/useSubscription";
import { X } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function UpgradeModal({ 
  open, 
  onOpenChange, 
  title = "Limite raggiunto", 
  description = "Hai raggiunto il limite di 5 fatture mensili del piano gratuito. Passa a un piano a pagamento per continuare a generare fatture." 
}: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const { plans, createCheckoutSession } = useSubscription();

  const handlePlanSelect = async (planName: string) => {
    if (planName === 'FREE') return;
    
    try {
      setLoading(true);
      await createCheckoutSession(planName);
      onOpenChange(false);
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtra solo i piani a pagamento per l'upgrade
  const paidPlans = plans.filter(plan => plan.name !== 'FREE');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-destructive">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {description}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          {paidPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isPopular={plan.name === 'STANDARD'}
              onSelect={handlePlanSelect}
              loading={loading}
            />
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Puoi modificare o cancellare il tuo abbonamento in qualsiasi momento dalla dashboard.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}