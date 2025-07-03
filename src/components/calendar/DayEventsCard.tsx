import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  User, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { CalendarEvent } from "@/types/calendar";
import type { Tables } from "@/integrations/supabase/types";

interface DayEventsCardProps {
  selectedDate: Date;
  events: CalendarEvent[];
  pazienti?: Tables<'pazienti'>[];
  onAddEvent: () => void;
  onDeleteEvent: (id: string) => void;
}

export function DayEventsCard({ 
  selectedDate, 
  events, 
  pazienti, 
  onAddEvent, 
  onDeleteEvent 
}: DayEventsCardProps) {
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
          <CalendarIcon className="h-5 w-5" />
          Eventi di {format(selectedDate, 'dd MMMM yyyy', { locale: it })}
        </CardTitle>
        <CardDescription>
          {events.length} eventi programmati per questo giorno
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nessun evento programmato per questo giorno</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={onAddEvent}
            >
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Evento
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {events
              .sort((a, b) => a.time.localeCompare(b.time))
              .map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full ${getEventTypeColor(event.type)}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {event.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </span>
                        {event.patientId && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {pazienti?.find(p => p.id === event.patientId)?.nome} {pazienti?.find(p => p.id === event.patientId)?.cognome}
                          </span>
                        )}
                        {event.invoiceId && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Fattura
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(event.status)}
                    {event.type !== 'scadenza' && !event.invoiceId && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}