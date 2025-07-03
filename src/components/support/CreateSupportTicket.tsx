import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateSupportTicketProps {
  onTicketCreated?: () => void;
}

export function CreateSupportTicket({ onTicketCreated }: CreateSupportTicketProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium'
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast({
        title: "Errore",
        description: "Oggetto e descrizione sono obbligatori.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-support-ticket', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Ticket di supporto creato con successo. Ti contatteremo presto!",
      });

      // Reset form
      setFormData({
        subject: '',
        description: '',
        priority: 'medium'
      });

      setIsOpen(false);
      onTicketCreated?.();

    } catch (error: any) {
      console.error('Error creating support ticket:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile creare il ticket di supporto.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Contatta Supporto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Crea Ticket di Supporto
          </DialogTitle>
          <DialogDescription>
            Descrivi il tuo problema o la tua richiesta. Il nostro team ti risponderà il prima possibile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Oggetto *</Label>
            <Input
              id="subject"
              placeholder="Descrivi brevemente il problema..."
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priorità</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona priorità" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Bassa - Domanda generale</SelectItem>
                <SelectItem value="medium">Media - Problema non bloccante</SelectItem>
                <SelectItem value="high">Alta - Problema che blocca il lavoro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione *</Label>
            <Textarea
              id="description"
              placeholder="Descrivi in dettaglio il problema o la richiesta. Includi tutti i passaggi che hai seguito e eventuali messaggi di errore."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={6}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Invio in corso...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Invia Ticket
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}