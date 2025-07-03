import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, UserCog, Mail, Calendar, CreditCard } from 'lucide-react';

interface AdminUsersProps {
  userRole: string | null;
}

interface UserData {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  created_at: string;
  plan_name?: string;
  status?: string;
  fatture_count?: number;
}

export function AdminUsers({ userRole }: AdminUsersProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
        // Get users with their subscription data
        const { data: usersData, error } = await supabase
          .from('profiles')
          .select(`
            *,
            user_subscriptions (
              plan_name,
              status
            )
          `);

        if (error) throw error;

        // Get invoice counts for each user
        const usersWithStats = await Promise.all(
          (usersData || []).map(async (user: any) => {
            const { count: fattureCount } = await supabase
              .from('fatture')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.user_id);

            const subscriptions = Array.isArray(user.user_subscriptions) ? user.user_subscriptions : [];

            return {
              ...user,
              plan_name: subscriptions[0]?.plan_name || 'FREE',
              status: subscriptions[0]?.status || 'active',
              fatture_count: fattureCount || 0
            };
          })
        );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cognome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = planFilter === 'all' || user.plan_name === planFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestione Utenti</h1>
        <p className="text-muted-foreground">
          Gestisci tutti gli utenti registrati nel sistema
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cerca</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Piano</label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti i piani" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i piani</SelectItem>
                  <SelectItem value="FREE">FREE</SelectItem>
                  <SelectItem value="STANDARD">STANDARD</SelectItem>
                  <SelectItem value="PRO">PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stato</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="active">Attivo</SelectItem>
                  <SelectItem value="canceled">Cancellato</SelectItem>
                  <SelectItem value="past_due">Scaduto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchUsers} variant="outline" className="w-full">
                Aggiorna
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Utenti ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Lista completa degli utenti registrati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utente</TableHead>
                <TableHead>Piano</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Fatture</TableHead>
                <TableHead>Registrato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.nome} {user.cognome}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlanBadgeColor(user.plan_name || 'FREE')}>
                      {user.plan_name || 'FREE'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(user.status || 'active')}>
                      {user.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.fatture_count}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('it-IT')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <UserCog className="h-3 w-3 mr-1" />
                        Gestisci
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                    </div>
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