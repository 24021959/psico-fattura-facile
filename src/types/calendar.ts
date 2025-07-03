export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'appuntamento' | 'scadenza' | 'promemoria';
  description?: string;
  patientId?: string;
  serviceId?: string;
  invoiceId?: string;
  status: 'programmato' | 'completato' | 'scaduto' | 'annullato';
}

export interface NewEventForm {
  title: string;
  time: string;
  type: 'appuntamento' | 'scadenza' | 'promemoria';
  description: string;
  patientId: string;
  serviceId: string;
}