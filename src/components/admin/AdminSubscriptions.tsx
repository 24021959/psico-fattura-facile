import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Calendar, User, DollarSign } from 'lucide-react';

interface AdminSubscriptionsProps {
  userRole: string | null;
}

interface SubscriptionData {
  id: string;
  user_id: string;
  plan_name: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id: string;
  fatture_count_mensile: number;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export function AdminSubscriptions({ userRole }: AdminSubscriptionsProps) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    canceled: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);

      // Get all subscriptions
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionsError) throw subscriptionsError;

      // Get profiles to match with subscriptions
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, nome, cognome, email');

      if (profilesError) throw profilesError;

      // Combine data
      const subscriptionsWithUserInfo = (subscriptions || []).map(sub => {
        const profile = profiles?.find(p => p.user_id === sub.user_id);
        return {
          ...sub,
          user_email: profile?.email || 'N/A',
          user_name: profile ? `${profile.nome} ${profile.cognome}` : 'N/A'
        };
      });

      setSubscriptions(subscriptionsWithUserInfo);

      // Calculate stats
      const total = subscriptionsWithUserInfo.length;
      const active = subscriptionsWithUserInfo.filter(s => s.status === 'active').length;
      const canceled = subscriptionsWithUserInfo.filter(s => s.status === 'canceled').length;
      
      setStats({
        total,
        active,
        canceled,
        revenue: active * 25 // Assuming €25/month average
      });

    } catch (error) {
      console.error('Errore caricamento abbonamenti:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'FREE':
        return 'bg-gray-100 text-gray-800';
      case 'STANDARD':
        return 'bg-blue-100 text-blue-800';
      case 'PRO':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <div>
        <h1 className="text-3xl font-bold">Gestione Abbonamenti</h1>
        <p className="text-muted-foreground">
          Gestisci abbonamenti e pagamenti degli utenti
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Abbonamenti</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Tutti i piani</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attivi</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Abbonamenti attivi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellati</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.canceled}</div>
            <p className="text-xs text-muted-foreground">Non rinnovati</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Stimato</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">€{stats.revenue}</div>
            <p className="text-xs text-muted-foreground">Mensile stimato</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Abbonamenti ({subscriptions.length})</CardTitle>
          <CardDescription>
            Lista completa degli abbonamenti utenti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utente</TableHead>
                <TableHead>Piano</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Fatture Mensili</TableHead>
                <TableHead>Creato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{subscription.user_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {subscription.user_email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlanBadgeColor(subscription.plan_name)}>
                      {subscription.plan_name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(subscription.status)}>
                      {subscription.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{subscription.fatture_count_mensile || 0}</TableCell>
                  <TableCell>
                    {new Date(subscription.created_at).toLocaleDateString('it-IT')}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      Gestisci
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}