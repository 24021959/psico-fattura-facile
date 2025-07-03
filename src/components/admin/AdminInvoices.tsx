import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminInvoicesProps {
  userRole: string | null;
}

export function AdminInvoices({ userRole }: AdminInvoicesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestione Fatture</h1>
        <p className="text-muted-foreground">
          Panoramica fatture generate dagli utenti (solo dati fiscali)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fatture Sistema</CardTitle>
          <CardDescription>
            Visualizzazione dati fiscali delle fatture (senza contenuto sensibile)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sezione in sviluppo - rispetto privacy dati pazienti.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}