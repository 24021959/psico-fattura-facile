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
import type { NewEventForm, CalendarEvent } from "@/types/calendar";

export default function Calendario() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
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
  const { createEvento, deleteEvento, updateEvento } = useEventiCalendario();
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

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      time: event.time,
      type: event.type,
      description: event.description || '',
      patientId: event.patientId || '',
      serviceId: event.serviceId || ''
    });
    setIsDialogOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent || !newEvent.title || !newEvent.time) {
      toast({
        title: "Errore",
        description: "Inserisci almeno titolo e orario",
        variant: "destructive"
      });
      return;
    }

    const success = await updateEvento(editingEvent.id, {
      titolo: newEvent.title,
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
      setEditingEvent(null);
      setIsDialogOpen(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingEvent(null);
      setNewEvent({
        title: '',
        time: '',
        type: 'appuntamento',
        description: '',
        patientId: '',
        serviceId: ''
      });
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
            onOpenChange={handleDialogChange}
            selectedDate={selectedDate}
            newEvent={newEvent}
            setNewEvent={setNewEvent}
            onAddEvent={editingEvent ? handleUpdateEvent : handleAddEvent}
            pazienti={pazienti}
            prestazioni={prestazioni}
            isEditing={!!editingEvent}
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
          onEditEvent={handleEditEvent}
        />
      </div>
    </DashboardLayout>
  );
}