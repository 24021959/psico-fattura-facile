import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, FileText, Users, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FatturaForm } from "@/components/forms/FatturaForm";
import { PazienteForm } from "@/components/forms/PazienteForm";

export function QuickActionsCard() {
  const navigate = useNavigate();

  return (
    <Card className="shadow-medical bg-pastel-yellow-light border-pastel-yellow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Azioni Rapide
        </CardTitle>
        <CardDescription>
          Operazioni frequenti per la tua attività
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <FatturaForm trigger={
          <Button variant="outline" className="w-full justify-start" size="lg">
            <FileText className="mr-2 h-5 w-5" />
            Crea Nuova Fattura
          </Button>
        } />
        <PazienteForm trigger={
          <Button variant="outline" className="w-full justify-start" size="lg">
            <Users className="mr-2 h-5 w-5" />
            Inserisci Nuovo Paziente
          </Button>
        } />
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          size="lg"
          onClick={() => navigate('/prestazioni')}
        >
          <Calendar className="mr-2 h-5 w-5" />
          Gestisci Sedute Terapeutiche
        </Button>
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          size="lg"
          onClick={() => navigate('/statistiche')}
        >
          <TrendingUp className="mr-2 h-5 w-5" />
          Visualizza Report
        </Button>
      </CardContent>
    </Card>
  );
}