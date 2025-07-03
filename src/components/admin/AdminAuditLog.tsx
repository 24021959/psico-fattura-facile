import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminAuditLogProps {
  userRole: string | null;
}

export function AdminAuditLog({ userRole }: AdminAuditLogProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Log delle Attività</h1>
        <p className="text-muted-foreground">
          Traccia tutte le attività amministrative
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>
            Registro delle attività degli amministratori
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sistema di audit logging in sviluppo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}