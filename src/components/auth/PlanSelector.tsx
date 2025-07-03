import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PlanSelectorProps {
  selectedPlan: string;
  onPlanSelect: (planName: string) => void;
}

export function PlanSelector({ selectedPlan, onPlanSelect }: PlanSelectorProps) {
  const { plans } = useSubscription();

  const getFeatures = (planName: string) => {
    switch (planName) {
      case 'FREE':
        return [
          'Max 5 fatture/mese',
          'Fatture PDF a norma',
          'Dashboard base',
          'Supporto email'
        ];
      case 'STANDARD':
        return [
          'Fatture illimitate',
          'Tutte le funzionalità fiscali',
          'Archivio annuale',
          'Supporto email',
          'PDF e XML scaricabili'
        ];
      case 'PRO':
        return [
          'Fatture illimitate',
          'Diario paziente completo',
          'Backup automatico',
          'Assistenza prioritaria',
          'Tutte le funzionalità fiscali'
        ];
      default:
        return [];
    }
  };

  const getIcon = (planName: string) => {
    if (planName === 'PRO') return <Crown className="h-5 w-5 text-amber-500" />;
    if (planName === 'STANDARD') return <Star className="h-5 w-5 text-blue-500" />;
    return null;
  };

  const getDescription = (planName: string) => {
    switch (planName) {
      case 'FREE':
        return 'Perfetto per iniziare';
      case 'STANDARD':
        return 'Il più scelto dai professionisti';
      case 'PRO':
        return 'Soluzione professionale completa';
      default:
        return '';
    }
  };

  if (!plans.length) {
    return <div>Caricamento piani...</div>;
  }

  return (
    <RadioGroup
      value={selectedPlan}
      onValueChange={onPlanSelect}
      className="grid gap-4 md:grid-cols-3"
    >
      {plans.map((plan) => {
        const features = getFeatures(plan.name);
        const isSelected = selectedPlan === plan.name;
        const isPopular = plan.name === 'STANDARD';

        return (
          <div key={plan.id} className="relative">
            <Label htmlFor={plan.name} className="cursor-pointer">
              <Card className={`
                h-full transition-all
                ${isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md'}
                ${isPopular ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''}
              `}>
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Più Scelto
                  </Badge>
                )}
                
                {plan.name === 'PRO' && (
                  <Badge className="absolute -top-3 right-4 bg-amber-500 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getIcon(plan.name)}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{getDescription(plan.name)}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">€{plan.price_monthly.toFixed(2)}</span>
                    <span className="text-muted-foreground">/mese</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-center pt-4">
                    <RadioGroupItem
                      value={plan.name}
                      id={plan.name}
                      className="sr-only"
                    />
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${isSelected 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground'
                      }
                    `}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}