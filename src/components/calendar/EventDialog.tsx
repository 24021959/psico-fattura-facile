import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { NewEventForm } from "@/types/calendar";
import type { Tables } from "@/integrations/supabase/types";

interface EventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  newEvent: NewEventForm;
  setNewEvent: React.Dispatch<React.SetStateAction<NewEventForm>>;
  onAddEvent: () => void;
  pazienti?: Tables<'pazienti'>[];
  prestazioni?: Tables<'prestazioni'>[];
}

export function EventDialog({
  isOpen,
  onOpenChange,
  selectedDate,
  newEvent,
  setNewEvent,
  onAddEvent,
  pazienti,
  prestazioni
}: EventDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button onClick={onAddEvent} className="flex-1">
              Aggiungi Evento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}