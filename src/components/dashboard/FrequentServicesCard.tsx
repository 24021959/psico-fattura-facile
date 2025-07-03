import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { usePrestazioni } from "@/hooks/usePrestazioni";

export function FrequentServicesCard() {
  const { prestazioni } = usePrestazioni();

  return (
    <Card className="shadow-medical">
      <CardHeader>
        <CardTitle>Prestazioni Più Frequenti</CardTitle>
        <CardDescription>
          Le tipologie di sedute più richieste dai tuoi pazienti
        </CardDescription>
      </CardHeader>
      <CardContent>
        {prestazioni.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {prestazioni.slice(0, 3).map((prestazione, index) => {
              const utilizzo = Math.max(20, Math.random() * 80); // Simula utilizzo
              return (
                <div key={prestazione.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{prestazione.nome}</h4>
                    <span className="text-sm font-medium text-primary">
                      €{Number(prestazione.prezzo_unitario).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {prestazione.descrizione || "Prestazione sanitaria"}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-muted rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-primary' : 
                          index === 1 ? 'bg-success' : 'bg-warning'
                        }`} 
                        style={{ width: `${utilizzo.toFixed(0)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {utilizzo.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nessuna prestazione configurata</p>
            <p className="text-xs">Aggiungi le tue prestazioni per visualizzare le statistiche</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}