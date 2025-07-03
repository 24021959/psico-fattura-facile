import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Check if user is admin
        const { data: adminCheck, error } = await supabase.rpc('is_admin_user', {
          user_id: user.id
        });

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(adminCheck);
          
          if (adminCheck) {
            // Get admin role
            const { data: roleData, error: roleError } = await supabase.rpc('get_admin_role', {
              user_id: user.id
            });
            
            if (!roleError && roleData) {
              setAdminRole(roleData);
            }
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Verificando accesso amministratore...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Accesso Negato</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Non hai i permessi necessari per accedere al pannello di amministrazione.
            </p>
            <p className="text-sm text-muted-foreground">
              Contatta un amministratore se pensi che questo sia un errore.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard userRole={adminRole} />;
}