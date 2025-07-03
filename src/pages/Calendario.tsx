import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EventDialog } from "@/components/calendar/EventDialog";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { UpcomingEventsCard } from "@/components/calendar/UpcomingEventsCard";
import { DayEventsCard } from "@/components/calendar/DayEventsCard";
import { usePazienti } from "@/hooks/usePazienti";
import { usePrestazioni } from "@/hooks/usePrestazioni";
import { useEventiCalendario } from "@/hooks/useEventiCalendario";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useToast } from "@/hooks/use-toast";
import type { NewEventForm } from "@/types/calendar";

export default function Calendario() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEventForm>({
    title: '',
    time: '',
    type: 'appuntamento',
    description: '',
    patientId: '',
    serviceId: ''
  });

  const { pazienti } = usePazienti();
  const { prestazioni } = usePrestazioni();
  const { createEvento, deleteEvento } = useEventiCalendario();
  const { allEvents, getSelectedDayEvents, getUrgentEvents } = useCalendarEvents();
  const { toast } = useToast();

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.time) {
      toast({
        title: "Errore",
        description: "Inserisci almeno titolo e orario",
        variant: "destructive"
      });
      return;
    }

    const success = await createEvento({
      titolo: newEvent.title,
      data_evento: selectedDate.toISOString().split('T')[0],
      orario: newEvent.time,
      tipo: newEvent.type,
      descrizione: newEvent.description || undefined,
      paziente_id: newEvent.patientId || undefined,
      prestazione_id: newEvent.serviceId || undefined
    });

    if (success) {
      setNewEvent({
        title: '',
        time: '',
        type: 'appuntamento',
        description: '',
        patientId: '',
        serviceId: ''
      });
      setIsDialogOpen(false);
    }
  };

  const selectedDayEvents = getSelectedDayEvents(selectedDate);
  const urgentEvents = getUrgentEvents();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
            <p className="text-muted-foreground">
              Gestisci appuntamenti, scadenze e promemoria
            </p>
          </div>
          
          <EventDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            selectedDate={selectedDate}
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            onAddEvent={handleAddEvent}
            pazienti={pazienti}
            prestazioni={prestazioni}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <CalendarGrid
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onDateClick={(date) => {
              setSelectedDate(date);
              setIsDialogOpen(true);
            }}
            events={allEvents}
          />
          
          <UpcomingEventsCard events={urgentEvents} pazienti={pazienti} />
        </div>

        <DayEventsCard
          selectedDate={selectedDate}
          events={selectedDayEvents}
          pazienti={pazienti}
          onAddEvent={() => setIsDialogOpen(true)}
          onDeleteEvent={deleteEvento}
        />
      </div>
    </DashboardLayout>
  );
}