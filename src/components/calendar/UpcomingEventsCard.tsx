import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { CalendarEvent } from "@/types/calendar";

interface UpcomingEventsCardProps {
  events: CalendarEvent[];
}

export function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'appuntamento': return 'bg-primary';
      case 'scadenza': return 'bg-destructive';
      case 'promemoria': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completato': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'scaduto': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'annullato': return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default: return <Clock className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          Prossimi Eventi
        </CardTitle>
        <CardDescription>
          Eventi nei prossimi 7 giorni
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nessun evento programmato nei prossimi giorni
            </p>
          ) : (
            events.slice(0, 5).map(event => (
              <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(event.date, 'dd MMM', { locale: it })} alle {event.time}
                  </p>
                </div>
                {getStatusIcon(event.status)}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}