import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger';
import { UserCog, Shield, CreditCard, Mail, AlertTriangle, CheckCircle, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string | null;
  created_at: string;
  plan_name?: string;
  status?: string;
  fatture_count?: number;
  user_id: string;
}

interface UserManagementDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function UserManagementDialog({ user, open, onOpenChange, onUserUpdated }: UserManagementDialogProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'account'>('profile');
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: ''
  });
  const [subscriptionData, setSubscriptionData] = useState({
    planName: '',
    status: ''
  });
  const { logActivity } = useAdminActivityLogger();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        cognome: user.cognome || '',
        email: user.email || '',
        telefono: user.telefono || ''
      });
      setSubscriptionData({
        planName: user.plan_name || 'FREE',
        status: user.status || 'active'
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('manage-user', {
        body: {
          userId: user.user_id,
          updates: formData
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Profilo utente aggiornato con successo.",
      });

      onUserUpdated();
      
      logActivity({
        action: 'update_user_profile',
        target_type: 'user_profile',
        target_id: user.user_id,
        details: formData
      });

    } catch (error: any) {
      console.error('Error updating user profile:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare il profilo utente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'update_subscription',
          userId: user.user_id,
          planName: subscriptionData.planName,
          status: subscriptionData.status
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: "Abbonamento aggiornato con successo.",
      });

      onUserUpdated();
      
      logActivity({
        action: 'update_user_subscription',
        target_type: 'user_subscription',
        target_id: user.user_id,
        details: subscriptionData
      });

    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare l'abbonamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'suspend_user',
          userId: user.user_id
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;

      toast({
        title: "Utente Sospeso",
        description: "L'account è stato sospeso con successo.",
      });

      onUserUpdated();
      
      logActivity({
        action: 'suspend_user',
        target_type: 'user_account',
        target_id: user.user_id
      });

    } catch (error: any) {
      console.error('Error suspending user:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile sospendere l'utente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReactivateUser = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'reactivate_user',
          userId: user.user_id
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;

      toast({
        title: "Utente Riattivato",
        description: "L'account è stato riattivato con successo.",
      });

      onUserUpdated();
      
      logActivity({
        action: 'reactivate_user',
        target_type: 'user_account',
        target_id: user.user_id
      });

    } catch (error: any) {
      console.error('Error reactivating user:', error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile riattivare l'utente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Gestione Utente
          </DialogTitle>
          <DialogDescription>
            {user.nome} {user.cognome} - {user.email}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserCog className="h-4 w-4 inline mr-2" />
            Profilo
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'subscription' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard className="h-4 w-4 inline mr-2" />
            Abbonamento
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'account' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Account
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="cognome">Cognome</Label>
                <Input
                  id="cognome"
                  value={formData.cognome}
                  onChange={(e) => setFormData(prev => ({ ...prev, cognome: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? 'Aggiornamento...' : 'Aggiorna Profilo'}
              </Button>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="planName">Piano</Label>
                <Select 
                  value={subscriptionData.planName} 
                  onValueChange={(value) => setSubscriptionData(prev => ({ ...prev, planName: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona piano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">FREE</SelectItem>
                    <SelectItem value="STANDARD">STANDARD</SelectItem>
                    <SelectItem value="PRO">PRO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={subscriptionData.status} 
                  onValueChange={(value) => setSubscriptionData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Attivo</SelectItem>
                    <SelectItem value="canceled">Cancellato</SelectItem>
                    <SelectItem value="past_due">Scaduto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Statistiche Utente</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Fatture Generate</span>
                  <div className="text-lg font-semibold">{user.fatture_count || 0}</div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Membro dal</span>
                  <div className="text-lg font-semibold">
                    {new Date(user.created_at).toLocaleDateString('it-IT')}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpdateSubscription} disabled={loading}>
                {loading ? 'Aggiornamento...' : 'Aggiorna Abbonamento'}
              </Button>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Controlli Account
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Gestisci lo stato dell'account utente. Queste azioni sono permanenti.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Sospendi Account</div>
                    <div className="text-sm text-muted-foreground">
                      L'utente non potrà più accedere al sistema
                    </div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleSuspendUser}
                    disabled={loading}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Sospendi
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Riattiva Account</div>
                    <div className="text-sm text-muted-foreground">
                      Ripristina l'accesso completo al sistema
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleReactivateUser}
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Riattiva
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Attenzione</h4>
                  <p className="text-sm text-yellow-700">
                    Le modifiche all'account sono permanenti. Assicurati di aver verificato 
                    la necessità prima di procedere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}