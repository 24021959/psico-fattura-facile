import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminSubscriptionsProps {
  userRole: string | null;
}

export function AdminSubscriptions({ userRole }: AdminSubscriptionsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestione Abbonamenti</h1>
        <p className="text-muted-foreground">
          Gestisci abbonamenti e pagamenti degli utenti
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Abbonamenti Attivi</CardTitle>
          <CardDescription>
            Funzionalità in sviluppo - integrazione Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Questa sezione sarà disponibile dopo l'integrazione completa con Stripe.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}