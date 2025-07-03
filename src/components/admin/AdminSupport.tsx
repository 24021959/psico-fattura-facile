import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger';
import { MessageSquare, Clock, User, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminSupportProps {
  userRole: string | null;
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  assigned_to: string | null;
  user_id: string;
  profiles: {
    nome: string;
    cognome: string;
    email: string;
  } | null;
  responses_count: number;
}

interface TicketResponse {
  id: string;
  message: string;
  created_at: string;
  is_internal: boolean;
  profiles: {
    nome: string;
    cognome: string;
  } | null;
}

export function AdminSupport({ userRole }: AdminSupportProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { logActivity } = useAdminActivityLogger();
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
    logActivity({
      action: 'view_support_tickets',
      target_type: 'admin_dashboard'
    });
  }, [logActivity]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles(nome, cognome, email),
          support_ticket_responses(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ticketsWithCount = (data || []).map(ticket => ({
        ...ticket,
        profiles: ticket.profiles || null,
        responses_count: Array.isArray(ticket.support_ticket_responses) ? ticket.support_ticket_responses.length : 0
      })) as any;

      setTickets(ticketsWithCount);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i ticket di supporto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketResponses = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_ticket_responses')
        .select(`
          *,
          profiles(nome, cognome)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setResponses((data || []).map(r => ({ ...r, profiles: r.profiles || null })) as any);
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase.functions.invoke('manage-support-ticket', {
        body: { ticketId, status },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;

      await fetchTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }

      toast({
        title: "Successo",
        description: "Status del ticket aggiornato con successo.",
      });

      logActivity({
        action: 'update_ticket_status',
        target_type: 'support_ticket',
        target_id: ticketId,
        details: { new_status: status }
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo status del ticket.",
        variant: "destructive",
      });
    }
  };

  const addResponse = async () => {
    if (!selectedTicket || !newResponse.trim()) return;

    try {
      const { error } = await supabase.functions.invoke('manage-support-ticket', {
        body: {
          action: 'add_response',
          ticketId: selectedTicket.id,
          message: newResponse,
          isInternal
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;

      await fetchTicketResponses(selectedTicket.id);
      setNewResponse('');
      setIsInternal(false);

      toast({
        title: "Successo",
        description: "Risposta aggiunta con successo.",
      });

      logActivity({
        action: 'add_ticket_response',
        target_type: 'support_ticket',
        target_id: selectedTicket.id
      });
    } catch (error) {
      console.error('Error adding response:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la risposta.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('it-IT');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestione Supporto</h1>
          <p className="text-muted-foreground">
            Gestisci ticket e richieste di supporto clienti
          </p>
        </div>
        <Button onClick={fetchTickets} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Aggiorna
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Aperti</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'open').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Lavorazione</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risolti</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status === 'closed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket di Supporto</CardTitle>
          <CardDescription>
            Lista completa dei ticket di supporto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Oggetto</TableHead>
                <TableHead>Utente</TableHead>
                <TableHead>Priorità</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risposte</TableHead>
                <TableHead>Creato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ticket.subject}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {ticket.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {ticket.profiles?.nome} {ticket.profiles?.cognome}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ticket.profiles?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.responses_count}</TableCell>
                  <TableCell>{formatDate(ticket.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog open={dialogOpen && selectedTicket?.id === ticket.id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (open) {
                          setSelectedTicket(ticket);
                          fetchTicketResponses(ticket.id);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Gestisci
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{ticket.subject}</DialogTitle>
                            <DialogDescription>
                              Ticket #{ticket.id.slice(0, 8)} - {ticket.profiles?.nome} {ticket.profiles?.cognome}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {/* Ticket Details */}
                            <div className="p-4 border rounded-lg bg-gray-50">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <Badge className={getPriorityColor(ticket.priority)}>
                                    {ticket.priority}
                                  </Badge>
                                  <Badge className={getStatusColor(ticket.status)} style={{ marginLeft: '8px' }}>
                                    {ticket.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(ticket.created_at)}
                                </div>
                              </div>
                              <p className="text-sm">{ticket.description}</p>
                            </div>

                            {/* Status Update */}
                            <div className="flex items-center gap-2">
                              <Select 
                                value={ticket.status} 
                                onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Aperto</SelectItem>
                                  <SelectItem value="in_progress">In Lavorazione</SelectItem>
                                  <SelectItem value="closed">Chiuso</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Responses */}
                            <div className="space-y-2">
                              <h4 className="font-medium">Risposte</h4>
                              <div className="max-h-60 overflow-y-auto space-y-2">
                                {responses.map((response) => (
                                  <div key={response.id} className={`p-3 rounded-lg ${
                                    response.is_internal ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-blue-50'
                                  }`}>
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="font-medium text-sm">
                                        {response.profiles?.nome} {response.profiles?.cognome}
                                        {response.is_internal && (
                                          <Badge variant="outline" className="ml-2 text-xs">
                                            Interno
                                          </Badge>
                                        )}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(response.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-sm">{response.message}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Add Response */}
                            <div className="space-y-2">
                              <h4 className="font-medium">Aggiungi Risposta</h4>
                              <Textarea
                                placeholder="Scrivi la tua risposta..."
                                value={newResponse}
                                onChange={(e) => setNewResponse(e.target.value)}
                                rows={3}
                              />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="internal"
                                    checked={isInternal}
                                    onChange={(e) => setIsInternal(e.target.checked)}
                                  />
                                  <label htmlFor="internal" className="text-sm">
                                    Nota interna (non visibile al cliente)
                                  </label>
                                </div>
                                <Button onClick={addResponse} disabled={!newResponse.trim()}>
                                  Invia Risposta
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {tickets.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun ticket</h3>
              <p className="text-gray-500">Non ci sono ticket di supporto al momento.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}