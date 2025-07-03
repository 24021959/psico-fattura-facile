import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { format, isSameDay, parseISO, addDays, isBefore, startOfDay } from "date-fns";
import { it } from "date-fns/locale";
import { useFatture } from "@/hooks/useFatture";
import { usePazienti } from "@/hooks/usePazienti";
import { usePrestazioni } from "@/hooks/usePrestazioni";
import { useEventiCalendario } from "@/hooks/useEventiCalendario";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
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

export default function Calendario() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    time: string;
    type: 'appuntamento' | 'scadenza' | 'promemoria';
    description: string;
    patientId: string;
    serviceId: string;
  }>({
    title: '',
    time: '',
    type: 'appuntamento',
    description: '',
    patientId: '',
    serviceId: ''
  });

  const { fatture } = useFatture();
  const { pazienti } = usePazienti();
  const { prestazioni } = usePrestazioni();
  const { eventi, createEvento, deleteEvento } = useEventiCalendario();
  const { toast } = useToast();

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

  // Eventi del giorno selezionato
  const selectedDayEvents = allEvents.filter(event => 
    isSameDay(event.date, selectedDate)
  );

  // Eventi urgenti (prossimi 7 giorni)
  const urgentEvents = allEvents.filter(event => {
    const eventDate = startOfDay(event.date);
    const today = startOfDay(new Date());
    const oneWeekFromNow = addDays(today, 7);
    return eventDate >= today && eventDate <= oneWeekFromNow;
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

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

  const daysWithEvents = allEvents.map(event => event.date);

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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="medical-gradient text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                Nuovo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nuovo Evento</DialogTitle>
                <DialogDescription>
                  Aggiungi un nuovo evento per {format(selectedDate, 'dd MMMM yyyy', { locale: it })}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titolo</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Titolo dell'evento"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Orario</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(value: 'appuntamento' | 'scadenza' | 'promemoria') => 
                        setNewEvent(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appuntamento">Appuntamento</SelectItem>
                        <SelectItem value="promemoria">Promemoria</SelectItem>
                        <SelectItem value="scadenza">Scadenza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newEvent.type === 'appuntamento' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="patient">Paziente</Label>
                      <Select
                        value={newEvent.patientId}
                        onValueChange={(value) => setNewEvent(prev => ({ ...prev, patientId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona paziente" />
                        </SelectTrigger>
                        <SelectContent>
                          {pazienti?.map(paziente => (
                            <SelectItem key={paziente.id} value={paziente.id}>
                              {paziente.nome} {paziente.cognome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="service">Prestazione</Label>
                      <Select
                        value={newEvent.serviceId}
                        onValueChange={(value) => setNewEvent(prev => ({ ...prev, serviceId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona prestazione" />
                        </SelectTrigger>
                        <SelectContent>
                          {prestazioni?.filter(p => p.attiva).map(prestazione => (
                            <SelectItem key={prestazione.id} value={prestazione.id}>
                              {prestazione.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="description">Note</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Note aggiuntive..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button onClick={handleAddEvent} className="flex-1">
                    Aggiungi Evento
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendario */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {format(selectedDate, 'MMMM yyyy', { locale: it })}
              </CardTitle>
              <CardDescription>
                Clicca su una data per visualizzare o aggiungere eventi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border w-full"
                modifiers={{
                  hasEvent: daysWithEvents
                }}
                modifiersStyles={{
                  hasEvent: { 
                    backgroundColor: 'hsl(var(--primary))', 
                    color: 'hsl(var(--primary-foreground))',
                    fontWeight: 'bold'
                  }
                }}
                locale={it}
              />
            </CardContent>
          </Card>

          {/* Eventi urgenti */}
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
                {urgentEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nessun evento programmato nei prossimi giorni
                  </p>
                ) : (
                  urgentEvents.slice(0, 5).map(event => (
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
        </div>

        {/* Eventi del giorno selezionato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Eventi di {format(selectedDate, 'dd MMMM yyyy', { locale: it })}
            </CardTitle>
            <CardDescription>
              {selectedDayEvents.length} eventi programmati per questo giorno
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nessun evento programmato per questo giorno</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi Evento
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayEvents
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
                               onClick={() => deleteEvento(event.id)}
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
      </div>
    </DashboardLayout>
  );
}