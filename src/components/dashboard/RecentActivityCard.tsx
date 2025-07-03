import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useFatture } from "@/hooks/useFatture";

export function RecentActivityCard() {
  const { fatture } = useFatture();
  
  // Ultime fatture per attività recenti
  const ultimeFatture = fatture.slice(0, 4);

  return (
    <Card className="shadow-medical">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Attività Recenti
        </CardTitle>
        <CardDescription>
          Le tue ultime operazioni
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ultimeFatture.length > 0 ? (
          ultimeFatture.map((fattura) => (
            <div key={fattura.id} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${
                fattura.stato === 'pagata' ? 'bg-success' : 
                fattura.stato === 'inviata' ? 'bg-primary' : 
                fattura.stato === 'scaduta' ? 'bg-destructive' : 'bg-warning'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Fattura #{fattura.numero_fattura} {fattura.stato === 'pagata' ? 'pagata' : 'creata'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {fattura.paziente?.nome} {fattura.paziente?.cognome} • 
                  {format(new Date(fattura.created_at), "dd/MM/yyyy", { locale: it })}
                </p>
              </div>
              <span className="text-sm font-medium text-primary">€ {Number(fattura.totale).toFixed(2)}</span>
              {fattura.stato === 'pagata' && <CheckCircle className="h-4 w-4 text-success" />}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nessuna attività recente</p>
            <p className="text-xs">Crea la tua prima fattura per iniziare</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}