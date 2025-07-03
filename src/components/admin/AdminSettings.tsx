import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminSettingsProps {
  userRole: string | null;
}

export function AdminSettings({ userRole }: AdminSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Impostazioni Sistema</h1>
        <p className="text-muted-foreground">
          Configura impostazioni generali dell'applicazione
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurazione</CardTitle>
          <CardDescription>
            Impostazioni generali del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Pannello di configurazione in sviluppo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}