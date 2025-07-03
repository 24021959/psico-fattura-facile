import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, CreditCard, FileText, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

interface AdminOverviewProps {
  userRole: string | null;
}

interface StatsData {
  totalUsers: number;
  activeSubscriptions: number;
  totalInvoices: number;
  monthlyRevenue: number;
  pendingTickets: number;
  newUsersThisMonth: number;
}

export function AdminOverview({ userRole }: AdminOverviewProps) {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalInvoices: 0,
    monthlyRevenue: 0,
    pendingTickets: 0,
    newUsersThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get active subscriptions
        const { count: activeSubscriptions } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .neq('plan_name', 'FREE')
          .eq('status', 'active');

        // Get total invoices
        const { count: totalInvoices } = await supabase
          .from('fatture')
          .select('*', { count: 'exact', head: true });

        // Get pending support tickets
        const { count: pendingTickets } = await supabase
          .from('support_tickets')
          .select('*', { count: 'exact', head: true })
          .in('status', ['open', 'in_progress']);

        // Get new users this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: newUsersThisMonth } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString());

        setStats({
          totalUsers: totalUsers || 0,
          activeSubscriptions: activeSubscriptions || 0,
          totalInvoices: totalInvoices || 0,
          monthlyRevenue: 0, // TODO: Calculate from Stripe data
          pendingTickets: pendingTickets || 0,
          newUsersThisMonth: newUsersThisMonth || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Utenti Totali',
      value: stats.totalUsers,
      description: `+${stats.newUsersThisMonth} questo mese`,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Abbonamenti Attivi',
      value: stats.activeSubscriptions,
      description: 'Piani a pagamento',
      icon: CreditCard,
      color: 'text-green-600'
    },
    {
      title: 'Fatture Generate',
      value: stats.totalInvoices,
      description: 'Totale sistema',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      title: 'Ticket Aperti',
      value: stats.pendingTickets,
      description: 'Richieste supporto',
      icon: AlertTriangle,
      color: stats.pendingTickets > 0 ? 'text-red-600' : 'text-gray-600'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Amministratore</h1>
          <p className="text-muted-foreground">
            Panoramica generale del sistema Psico Fattura Facile
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Clock className="h-3 w-3 mr-1" />
          {new Date().toLocaleDateString('it-IT')}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attività Recente</CardTitle>
            <CardDescription>
              Ultimi eventi del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Nuovo utente registrato</p>
                  <p className="text-xs text-muted-foreground">2 ore fa</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Nuovo abbonamento Standard</p>
                  <p className="text-xs text-muted-foreground">4 ore fa</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Ticket supporto aperto</p>
                  <p className="text-xs text-muted-foreground">6 ore fa</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sistema</CardTitle>
            <CardDescription>
              Stato generale del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Stripe</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Connesso
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Service</span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Attivo
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Backup</span>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Ultimo: oggi
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}