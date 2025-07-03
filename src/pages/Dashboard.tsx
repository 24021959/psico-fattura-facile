import { Euro, Users, FileText, Plus, Calendar } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Button } from "@/components/ui/button";
import { FatturaForm } from "@/components/forms/FatturaForm";
import { useFatture } from "@/hooks/useFatture";
import { usePazienti } from "@/hooks/usePazienti";
import { usePrestazioni } from "@/hooks/usePrestazioni";
import { useProfile } from "@/hooks/useProfile";
import { PlanStatusCard } from "@/components/dashboard/PlanStatusCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { FrequentServicesCard } from "@/components/dashboard/FrequentServicesCard";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
export default function Dashboard() {
  const navigate = useNavigate();
  const {
    fatture
  } = useFatture();
  const {
    pazienti
  } = usePazienti();
  const {
    prestazioni
  } = usePrestazioni();
  const { profile } = useProfile();

  // Funzione per determinare il genere dal nome
  const getGenderFromName = (nome: string): 'M' | 'F' => {
    const femaleNames = [
      'alessandra', 'anna', 'barbara', 'carla', 'chiara', 'cristina', 'elena', 'francesca', 
      'giulia', 'laura', 'maria', 'monica', 'paola', 'roberta', 'sara', 'silvia', 'valentina',
      'federica', 'giovanna', 'lucia', 'emanuela', 'lorena', 'daniela', 'claudia', 'veronica',
      'sabrina', 'antonella', 'patrizia', 'manuela', 'elisa', 'raffaella', 'teresa', 'grazia',
      'caterina', 'elisabetta', 'rosa', 'angela', 'franca', 'rita', 'donatella', 'simona'
    ];
    return femaleNames.includes(nome.toLowerCase()) ? 'F' : 'M';
  };

  // Genera messaggio di benvenuto personalizzato
  const getWelcomeMessage = () => {
    if (!profile?.nome) return "Benvenuto nel tuo gestionale sanitario";
    
    const gender = getGenderFromName(profile.nome);
    const title = gender === 'F' ? 'Dott.ssa' : 'Dott.';
    const welcome = gender === 'F' ? 'Benvenuta' : 'Benvenuto';
    
    return `${welcome} ${title} ${profile.nome}`;
  };

  // Calcoli per statistiche aggiornate
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const fattureMensili = fatture.filter(f => {
    const dataFattura = new Date(f.data_fattura);
    return dataFattura.getMonth() === currentMonth && dataFattura.getFullYear() === currentYear;
  });
  const fatturato = fattureMensili.reduce((sum, f) => sum + Number(f.totale), 0);
  const prestazioniAttive = prestazioni.filter(p => p.attiva).length;
  return <div className="space-y-6">
      {/* Plan Status */}
      <PlanStatusCard />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {getWelcomeMessage()}
          </p>
        </div>
        <div className="flex gap-3">
          <FatturaForm trigger={<Button size="lg" className="medical-gradient text-primary-foreground hover:opacity-90">
              <Plus className="mr-2 h-5 w-5" />
              Nuova Fattura
            </Button>} />
          
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Fatturato Mensile" value={`€ ${fatturato.toFixed(2)}`} subtitle={format(new Date(), "MMMM yyyy", {
        locale: it
      })} icon={Euro} variant="primary" />
        <StatsCard title="Pazienti Totali" value={pazienti.length.toString()} subtitle="Pazienti registrati" icon={Users} variant="success" />
        <StatsCard title="Fatture Emesse" value={fattureMensili.length.toString()} subtitle={format(new Date(), "MMMM yyyy", {
        locale: it
      })} icon={FileText} />
        <StatsCard title="Sedute Attive" value={prestazioniAttive.toString()} subtitle="Servizi disponibili" icon={Calendar} variant="warning" />
      </div>

      {/* Charts and Lists */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivityCard />
        <QuickActionsCard />
      </div>

      {/* Frequent Services */}
      <FrequentServicesCard />
    </div>;
}