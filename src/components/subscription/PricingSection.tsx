import { useSubscription } from "@/hooks/useSubscription";
import { PricingCard } from "./PricingCard";
import { useState } from "react";

interface PricingSectionProps {
  showTitle?: boolean;
  onPlanSelect?: (planName: string) => void;
}

export function PricingSection({ showTitle = true, onPlanSelect }: PricingSectionProps) {
  const [loading, setLoading] = useState(false);
  const { plans, userSubscription, createCheckoutSession } = useSubscription();

  const handlePlanSelect = async (planName: string) => {
    if (planName === 'FREE') return;
    
    try {
      setLoading(true);
      if (onPlanSelect) {
        onPlanSelect(planName);
      } else {
        await createCheckoutSession(planName);
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Scegli il piano perfetto per te</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Inizia con il piano gratuito e aggiorna quando hai bisogno di più funzionalità.
              Tutti i piani includono fatture PDF a norma di legge.
            </p>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={userSubscription?.plan_name === plan.name}
              isPopular={plan.name === 'STANDARD'}
              onSelect={handlePlanSelect}
              loading={loading}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Tutti i prezzi sono IVA inclusa. Puoi modificare o cancellare il tuo abbonamento in qualsiasi momento.
          </p>
        </div>
      </div>
    </section>
  );
}