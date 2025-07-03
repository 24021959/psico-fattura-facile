import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown } from "lucide-react";
import { SubscriptionPlan } from "@/hooks/useSubscription";

interface PricingCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelect: (planName: string) => void;
  loading?: boolean;
}

export function PricingCard({ plan, isCurrentPlan, isPopular, onSelect, loading }: PricingCardProps) {
  const getFeatures = (plan: SubscriptionPlan) => {
    const features = [];
    
    if (plan.name === 'FREE') {
      features.push('Max 5 fatture/mese');
      features.push('Fatture PDF a norma');
      features.push('Dashboard base');
    } else if (plan.name === 'STANDARD') {
      features.push('Fatture illimitate');
      features.push('Tutte le funzionalità fiscali');
      features.push('Archivio annuale');
      features.push('Supporto email');
    } else if (plan.name === 'PRO') {
      features.push('Fatture illimitate');
      features.push('Diario paziente completo');
      features.push('Backup automatico');
      features.push('Assistenza prioritaria');
    }
    
    return features;
  };

  const getIcon = () => {
    if (plan.name === 'PRO') return <Crown className="h-5 w-5 text-amber-500" />;
    if (plan.name === 'STANDARD') return <Star className="h-5 w-5 text-blue-500" />;
    return null;
  };

  const getPlanDescription = () => {
    if (plan.name === 'FREE') return 'Perfetto per iniziare';
    if (plan.name === 'STANDARD') return 'Il più scelto dai professionisti';
    if (plan.name === 'PRO') return 'Soluzione completa e professionale';
    return '';
  };

  const features = getFeatures(plan);

  return (
    <Card className={`relative h-full flex flex-col ${
      isCurrentPlan ? 'ring-2 ring-primary' : ''
    } ${
      isPopular ? 'ring-2 ring-blue-500 scale-105' : ''
    }`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
          Più scelto
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
          Piano attuale
        </Badge>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getIcon()}
          <CardTitle className="text-xl">{plan.name}</CardTitle>
        </div>
        <CardDescription>{getPlanDescription()}</CardDescription>
        <div className="mt-4">
          <span className="text-3xl font-bold">€{plan.price_monthly.toFixed(2)}</span>
          <span className="text-muted-foreground">/mese</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        {plan.name === 'FREE' ? (
          <Button 
            variant="outline" 
            className="w-full"
            disabled={isCurrentPlan}
          >
            {isCurrentPlan ? 'Piano attuale' : 'Prova Gratis'}
          </Button>
        ) : (
          <Button 
            className={`w-full ${
              plan.name === 'PRO' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                : plan.name === 'STANDARD'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                : ''
            }`}
            onClick={() => onSelect(plan.name)}
            disabled={loading || isCurrentPlan}
          >
            {loading ? 'Caricamento...' : isCurrentPlan ? 'Piano attuale' : `Scegli ${plan.name}`}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}