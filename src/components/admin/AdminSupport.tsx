import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminSupportProps {
  userRole: string | null;
}

export function AdminSupport({ userRole }: AdminSupportProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestione Supporto</h1>
        <p className="text-muted-foreground">
          Gestisci ticket e richieste di supporto clienti
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket di Supporto</CardTitle>
          <CardDescription>
            Sistema di ticketing in sviluppo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema di gestione ticket di supporto sarà disponibile a breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}