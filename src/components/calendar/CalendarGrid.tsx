import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { CalendarEvent } from "@/types/calendar";

interface CalendarGridProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events: CalendarEvent[];
}

export function CalendarGrid({ selectedDate, onSelectDate, events }: CalendarGridProps) {
  const daysWithEvents = events.map(event => event.date);

  return (
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
          onSelect={(date) => date && onSelectDate(date)}
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
  );
}