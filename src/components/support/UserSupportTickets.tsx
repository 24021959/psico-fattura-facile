import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { CreateSupportTicket } from '@/components/support/CreateSupportTicket';
import { MessageSquare, Clock, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
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

export function UserSupportTickets() {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const fetchUserTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          support_ticket_responses!inner(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ticketsWithCount = data?.map(ticket => ({
        ...ticket,
        responses_count: ticket.support_ticket_responses?.[0]?.count || 0
      })) || [];

      setTickets(ticketsWithCount);
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i tuoi ticket di supporto.",
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
        .eq('is_internal', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setResponses((data || []).map(r => ({ ...r, profiles: r.profiles || null })) as any);
    } catch (error) {
      console.error('Error fetching responses:', error);
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Aperto';
      case 'in_progress': return 'In lavorazione';
      case 'closed': return 'Chiuso';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Bassa';
      default: return priority;
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
              {[1, 2, 3].map((i) => (
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
          <h2 className="text-2xl font-bold">I tuoi Ticket di Supporto</h2>
          <p className="text-muted-foreground">
            Gestisci le tue richieste di assistenza
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchUserTickets} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Aggiorna
          </Button>
          <CreateSupportTicket onTicketCreated={fetchUserTickets} />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Totale Ticket</CardTitle>
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
          <CardTitle>Storico Ticket</CardTitle>
          <CardDescription>
            Lista di tutti i tuoi ticket di supporto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tickets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Oggetto</TableHead>
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
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.responses_count}</TableCell>
                    <TableCell>{formatDate(ticket.created_at)}</TableCell>
                    <TableCell>
                      <Dialog open={dialogOpen && selectedTicket?.id === ticket.id} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (open) {
                          setSelectedTicket(ticket);
                          fetchTicketResponses(ticket.id);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Visualizza
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{ticket.subject}</DialogTitle>
                            <DialogDescription>
                              Ticket #{ticket.id.slice(0, 8)} - Creato il {formatDate(ticket.created_at)}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {/* Ticket Details */}
                            <div className="p-4 border rounded-lg bg-gray-50">
                              <div className="flex justify-between items-start mb-2">
                                <div className="space-x-2">
                                  <Badge className={getPriorityColor(ticket.priority)}>
                                    Priorità: {getPriorityLabel(ticket.priority)}
                                  </Badge>
                                  <Badge className={getStatusColor(ticket.status)}>
                                    {getStatusLabel(ticket.status)}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Ultimo aggiornamento: {formatDate(ticket.updated_at)}
                                </div>
                              </div>
                              <div className="mt-3">
                                <h4 className="font-medium mb-2">Descrizione:</h4>
                                <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                              </div>
                            </div>

                            {/* Responses */}
                            <div className="space-y-2">
                              <h4 className="font-medium">Risposte del Supporto</h4>
                              {responses.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                  {responses.map((response) => (
                                    <div key={response.id} className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-400">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-sm">
                                          {response.profiles?.nome} {response.profiles?.cognome} (Supporto)
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {formatDate(response.created_at)}
                                        </span>
                                      </div>
                                      <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">Non ci sono ancora risposte dal supporto.</p>
                                  <p className="text-xs">Ti contatteremo il prima possibile!</p>
                                </div>
                              )}
                            </div>

                            {ticket.status === 'closed' && (
                              <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
                                <p className="text-sm text-green-800">
                                  <strong>Ticket chiuso</strong> - Se hai ancora bisogno di assistenza, 
                                  puoi aprire un nuovo ticket.
                                </p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun ticket</h3>
              <p className="text-gray-500 mb-4">Non hai ancora creato ticket di supporto.</p>
              <CreateSupportTicket onTicketCreated={fetchUserTickets} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}