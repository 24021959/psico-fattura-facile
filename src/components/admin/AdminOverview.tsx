import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Users, CreditCard, FileText, AlertTriangle, Clock, RefreshCw, Database, Zap } from 'lucide-react';

interface AdminOverviewProps {
  userRole: string | null;
}

interface StatsData {
  totalUsers: number;
  activeSubscriptions: number;
  totalInvoices: number;
  pendingTickets: number;
  newUsersThisMonth: number;
}

interface RecentActivity {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: any;
  created_at: string;
  admin_users: {
    profiles: {
      nome: string;
      cognome: string;
    };
  };
}

interface SystemStatus {
  database: string;
  lastChecked: string;
}

export function AdminOverview({ userRole }: AdminOverviewProps) {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalInvoices: 0,
    pendingTickets: 0,
    newUsersThisMonth: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'checking',
    lastChecked: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('get-admin-stats');
      
      if (error) {
        throw error;
      }
      
      if (data?.stats) {
        setStats(data.stats);
      }
      
      if (data?.recentActivity) {
        setRecentActivity(data.recentActivity);
      }
      
      if (data?.systemStatus) {
        setSystemStatus(data.systemStatus);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to basic stats if edge function fails
      try {
        const [
          { count: totalUsers },
          { count: activeSubscriptions },
          { count: totalInvoices },
          { count: pendingTickets }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('user_subscriptions').select('*', { count: 'exact', head: true })
            .neq('plan_name', 'FREE').eq('status', 'active'),
          supabase.from('fatture').select('*', { count: 'exact', head: true }),
          supabase.from('support_tickets').select('*', { count: 'exact', head: true })
            .in('status', ['open', 'in_progress'])
        ]);

        setStats({
          totalUsers: totalUsers || 0,
          activeSubscriptions: activeSubscriptions || 0,
          totalInvoices: totalInvoices || 0,
          pendingTickets: pendingTickets || 0,
          newUsersThisMonth: 0
        });
      } catch (fallbackError) {
        console.error('Error fetching fallback stats:', fallbackError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Appena ora';
    if (diffInMinutes < 60) return `${diffInMinutes} min fa`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ore fa`;
    return `${Math.floor(diffInMinutes / 1440)} giorni fa`;
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('login') || action.includes('user')) return 'bg-green-500';
    if (action.includes('subscription') || action.includes('payment')) return 'bg-blue-500';
    if (action.includes('ticket') || action.includes('support')) return 'bg-yellow-500';
    if (action.includes('delete') || action.includes('error')) return 'bg-red-500';
    return 'bg-gray-500';
  };

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
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="h-3 w-3 mr-1" />
            {new Date().toLocaleDateString('it-IT')}
          </Badge>
        </div>
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
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 ${getActivityIcon(activity.action)} rounded-full`}></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.action} 
                        {activity.target_type && ` - ${activity.target_type}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.admin_users?.profiles ? 
                          `${activity.admin_users.profiles.nome} ${activity.admin_users.profiles.cognome} • ` : ''
                        }
                        {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Nessuna attività recente</p>
                </div>
              )}
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
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={systemStatus.database === 'online' 
                    ? "text-green-600 border-green-600" 
                    : "text-red-600 border-red-600"
                  }
                >
                  {systemStatus.database === 'online' ? 'Online' : 'Offline'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Edge Functions</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Attive
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ultimo Check</span>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {formatTimeAgo(systemStatus.lastChecked)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}