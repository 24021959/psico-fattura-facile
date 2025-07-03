import { useMemo } from 'react';
import { parseISO, addDays, isBefore, startOfDay, isSameDay } from 'date-fns';
import { useFatture } from '@/hooks/useFatture';
import { useEventiCalendario } from '@/hooks/useEventiCalendario';
import type { CalendarEvent } from '@/types/calendar';

export function useCalendarEvents() {
  const { fatture } = useFatture();
  const { eventi } = useEventiCalendario();

  // Genera eventi dalle scadenze fatture
  const fattureEvents: CalendarEvent[] = useMemo(() => {
    if (!fatture) return [];
    
    return fatture
      .filter(fattura => fattura.data_scadenza && fattura.stato !== 'pagata')
      .map(fattura => ({
        id: `fattura-${fattura.id}`,
        title: `Scadenza Fattura ${fattura.numero_fattura}`,
        date: parseISO(fattura.data_scadenza!),
        time: '23:59',
        type: 'scadenza' as const,
        description: `Fattura per ${fatture.find(f => f.id === fattura.id) ? 'paziente' : 'cliente'} - €${fattura.totale}`,
        invoiceId: fattura.id,
        status: isBefore(parseISO(fattura.data_scadenza!), startOfDay(new Date())) ? 'scaduto' : 'programmato'
      }));
  }, [fatture]);

  // Converte eventi del database in CalendarEvent
  const eventiCalendario: CalendarEvent[] = useMemo(() => {
    return eventi.map(evento => ({
      id: evento.id,
      title: evento.titolo,
      date: new Date(evento.data_evento + 'T00:00:00'),
      time: evento.orario,
      type: evento.tipo as 'appuntamento' | 'scadenza' | 'promemoria',
      description: evento.descrizione || undefined,
      patientId: evento.paziente_id || undefined,
      serviceId: evento.prestazione_id || undefined,
      invoiceId: evento.fattura_id || undefined,
      status: evento.stato as 'programmato' | 'completato' | 'scaduto' | 'annullato'
    }));
  }, [eventi]);

  // Tutti gli eventi (manuali + automatici)
  const allEvents = [...eventiCalendario, ...fattureEvents];

  // Funzioni helper per filtrare eventi
  const getSelectedDayEvents = (selectedDate: Date) => 
    allEvents.filter(event => isSameDay(event.date, selectedDate));

  const getUrgentEvents = () => {
    const today = startOfDay(new Date());
    const oneWeekFromNow = addDays(today, 7);
    return allEvents
      .filter(event => {
        const eventDate = startOfDay(event.date);
        return eventDate >= today && eventDate <= oneWeekFromNow;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  return {
    allEvents,
    getSelectedDayEvents,
    getUrgentEvents
  };
}