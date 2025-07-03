import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, CreditCard, Calendar, TrendingUp, RefreshCw, BarChart3 } from 'lucide-react';

interface AdminStatisticsProps {
  userRole: string | null;
}

interface StatData {
  totalUsers: number;
  totalInvoices: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  userGrowth: Array<{ month: string; users: number }>;
  planDistribution: Array<{ name: string; value: number; color: string }>;
  invoiceStats: Array<{ month: string; count: number; amount: number }>;
}

export function AdminStatistics({ userRole }: AdminStatisticsProps) {
  const [stats, setStats] = useState<StatData>({
    totalUsers: 0,
    totalInvoices: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    userGrowth: [],
    planDistribution: [],
    invoiceStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Get basic counts
      const [
        { count: totalUsers },
        { count: totalInvoices },
        { count: activeSubscriptions }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('fatture').select('*', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true })
          .neq('plan_name', 'FREE').eq('status', 'active')
      ]);

      // Get monthly user growth
      const { data: monthlyUsers } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      const userGrowth = processMonthlyData(monthlyUsers || [], 'created_at');

      // Get plan distribution
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('plan_name');

      const planCounts = (subscriptions || []).reduce((acc, sub) => {
        acc[sub.plan_name] = (acc[sub.plan_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const planDistribution = [
        { name: 'FREE', value: planCounts.FREE || 0, color: '#6b7280' },
        { name: 'STANDARD', value: planCounts.STANDARD || 0, color: '#3b82f6' },
        { name: 'PRO', value: planCounts.PRO || 0, color: '#8b5cf6' }
      ];

      // Get invoice statistics
      const { data: invoices } = await supabase
        .from('fatture')
        .select('created_at, totale')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      const invoiceStats = processInvoiceData(invoices || []);

      setStats({
        totalUsers: totalUsers || 0,
        totalInvoices: totalInvoices || 0,
        activeSubscriptions: activeSubscriptions || 0,
        monthlyRevenue: (activeSubscriptions || 0) * 25, // Stima €25/mese
        userGrowth,
        planDistribution,
        invoiceStats
      });

    } catch (error) {
      console.error('Errore caricamento statistiche:', error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (data: any[], dateField: string) => {
    const monthlyData: Record<string, number> = {};
    
    data.forEach(item => {
      const date = new Date(item[dateField]);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, users]) => ({
        month: new Date(month + '-01').toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
        users
      }));
  };

  const processInvoiceData = (invoices: any[]) => {
    const monthlyData: Record<string, { count: number; amount: number }> = {};
    
    invoices.forEach(invoice => {
      const date = new Date(invoice.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, amount: 0 };
      }
      
      monthlyData[monthKey].count += 1;
      monthlyData[monthKey].amount += Number(invoice.totale || 0);
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
        count: data.count,
        amount: data.amount
      }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistiche</h1>
          <p className="text-muted-foreground">
            Analisi dettagliate sull'uso del sistema
          </p>
        </div>
        <Button variant="outline" onClick={fetchStatistics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Aggiorna
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registrazioni totali</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fatture Generate</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">Documenti totali</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abbonamenti Attivi</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Piani a pagamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Mensile</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.monthlyRevenue}</div>
            <p className="text-xs text-muted-foreground">Stima corrente</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Crescita Utenti</CardTitle>
            <CardDescription>Ultimi 6 mesi - Trend crescita</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.userGrowth.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.month}</span>
                  <div className="flex items-center gap-3 flex-1 ml-4">
                    <Progress 
                      value={(item.users / Math.max(...stats.userGrowth.map(g => g.users))) * 100} 
                      className="flex-1"
                    />
                    <Badge variant="outline">{item.users}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuzione Piani</CardTitle>
            <CardDescription>Tipologie abbonamento attive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.planDistribution.map((plan, index) => {
                const total = stats.planDistribution.reduce((sum, p) => sum + p.value, 0);
                const percentage = total > 0 ? (plan.value / total) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: plan.color }}
                      ></div>
                      <span className="text-sm font-medium">{plan.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <Progress 
                        value={percentage}
                        className="flex-1"
                      />
                      <Badge variant="outline">{plan.value} ({percentage.toFixed(1)}%)</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fatture Generate</CardTitle>
          <CardDescription>Trend mensile fatturazione - Volume e valore</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.invoiceStats.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.month}</span>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      {item.count} fatture
                    </Badge>
                    <Badge variant="outline">
                      €{item.amount.toFixed(2)}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Volume</div>
                    <Progress 
                      value={(item.count / Math.max(...stats.invoiceStats.map(s => s.count))) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Valore</div>
                    <Progress 
                      value={(item.amount / Math.max(...stats.invoiceStats.map(s => s.amount))) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}