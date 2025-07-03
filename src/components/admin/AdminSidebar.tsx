import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  BarChart2, 
  Users, 
  CreditCard, 
  FileText, 
  Mail, 
  Settings, 
  LogOut,
  Activity,
  Home,
  BadgePercent
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: string | null;
}

export function AdminSidebar({ activeSection, onSectionChange, userRole }: AdminSidebarProps) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navigationItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: Home,
      roles: ['super_admin', 'admin', 'support', 'marketing']
    },
    {
      id: 'users',
      label: 'Gestione Utenti',
      icon: Users,
      roles: ['super_admin', 'admin', 'support']
    },
    {
      id: 'subscriptions',
      label: 'Abbonamenti',
      icon: CreditCard,
      roles: ['super_admin', 'admin']
    },
    {
      id: 'statistics',
      label: 'Statistiche',
      icon: BarChart2,
      roles: ['super_admin', 'admin', 'marketing']
    },
    {
      id: 'invoices',
      label: 'Fatture',
      icon: FileText,
      roles: ['super_admin', 'admin']
    },
    {
      id: 'support',
      label: 'Supporto',
      icon: Mail,
      roles: ['super_admin', 'admin', 'support']
    },
    {
      id: 'discount-codes',
      label: 'Codici Sconto',
      icon: BadgePercent,
      roles: ['super_admin', 'admin', 'marketing']
    },
    {
      id: 'system-settings',
      label: 'Sistema',
      icon: Settings,
      roles: ['super_admin']
    },
    {
      id: 'audit',
      label: 'Log Attività',
      icon: Activity,
      roles: ['super_admin', 'admin']
    }
  ];

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-500 text-white';
      case 'admin':
        return 'bg-blue-500 text-white';
      case 'support':
        return 'bg-green-500 text-white';
      case 'marketing':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const filteredItems = navigationItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">Psico Fattura Facile</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="space-y-2">
          <p className="text-sm font-medium">{user?.email}</p>
          <Badge className={getRoleBadgeColor(userRole)}>
            {userRole?.replace('_', ' ').toUpperCase() || 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Esci
        </Button>
      </div>
    </div>
  );
}