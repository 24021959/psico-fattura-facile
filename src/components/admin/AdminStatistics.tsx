import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminStatisticsProps {
  userRole: string | null;
}

export function AdminStatistics({ userRole }: AdminStatisticsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Statistiche</h1>
        <p className="text-muted-foreground">
          Analisi dettagliate sull'uso del sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statistiche d'Uso</CardTitle>
          <CardDescription>
            Dashboard analytics in sviluppo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Grafici e statistiche dettagliate saranno disponibili a breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}