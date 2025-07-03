import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, RefreshCw, Shield, Database, Mail, Bell } from 'lucide-react';

interface AdminSystemSettingsProps {
  userRole: string | null;
}

interface AppSetting {
  id: string;
  key: string;
  value: any;
  description: string | null;
  updated_at: string;
}

export function AdminSystemSettings({ userRole }: AdminSystemSettingsProps) {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { logActivity } = useAdminActivityLogger();
  const { toast } = useToast();

  const defaultSettings = [
    {
      key: 'maintenance_mode',
      value: false,
      description: 'Attiva la modalità manutenzione per l\'applicazione',
      type: 'boolean',
      category: 'Sistema',
      icon: Shield
    },
    {
      key: 'max_invoices_free_plan',
      value: 5,
      description: 'Numero massimo di fatture per il piano gratuito',
      type: 'number',
      category: 'Abbonamenti',
      icon: Database
    },
    {
      key: 'support_email',
      value: 'support@medinvoice.com',
      description: 'Email di supporto tecnico',
      type: 'email',
      category: 'Supporto',
      icon: Mail
    },
    {
      key: 'email_notifications_enabled',
      value: true,
      description: 'Abilita notifiche email per gli utenti',
      type: 'boolean',
      category: 'Notifiche',
      icon: Bell
    },
    {
      key: 'app_version',
      value: '1.0.0',
      description: 'Versione corrente dell\'applicazione',
      type: 'text',
      category: 'Sistema',
      icon: Settings
    },
    {
      key: 'backup_retention_days',
      value: 30,
      description: 'Giorni di conservazione dei backup',
      type: 'number',
      category: 'Sistema',
      icon: Database
    }
  ];

  useEffect(() => {
    fetchSettings();
    logActivity({
      action: 'view_system_settings',
      target_type: 'admin_dashboard'
    });
  }, [logActivity]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('key');

      if (error) throw error;

      // Merge with default settings
      const existingKeys = new Set(data?.map(s => s.key) || []);
      const mergedSettings = [
        ...(data || []),
        ...defaultSettings
          .filter(ds => !existingKeys.has(ds.key))
          .map(ds => ({
            id: `default-${ds.key}`,
            key: ds.key,
            value: ds.value,
            description: ds.description,
            updated_at: new Date().toISOString()
          }))
      ];

      setSettings(mergedSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le impostazioni",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    setSaving(key);
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key,
          value,
          description: defaultSettings.find(ds => ds.key === key)?.description || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      logActivity({
        action: 'update_system_setting',
        target_type: 'app_setting',
        details: { key, value }
      });

      toast({
        title: "Impostazione aggiornata",
        description: `${key} è stato aggiornato con successo`,
      });

      fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'impostazione",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const getSettingConfig = (key: string) => {
    return defaultSettings.find(ds => ds.key === key);
  };

  const renderSettingInput = (setting: AppSetting) => {
    const config = getSettingConfig(setting.key);
    const isDefault = setting.id.startsWith('default-');

    if (config?.type === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={setting.key}
            checked={Boolean(setting.value)}
            onCheckedChange={(checked) => updateSetting(setting.key, checked)}
            disabled={saving === setting.key}
          />
          <Label htmlFor={setting.key} className="text-sm">
            {Boolean(setting.value) ? 'Attivo' : 'Disattivo'}
          </Label>
        </div>
      );
    }

    if (config?.type === 'number') {
      return (
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => {
              const newValue = parseInt(e.target.value) || 0;
              updateSetting(setting.key, newValue);
            }}
            className="w-32"
            disabled={saving === setting.key}
          />
          {saving === setting.key && <RefreshCw className="h-4 w-4 animate-spin" />}
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <Input
          type={config?.type === 'email' ? 'email' : 'text'}
          value={setting.value}
          onChange={(e) => updateSetting(setting.key, e.target.value)}
          className="flex-1"
          disabled={saving === setting.key}
        />
        {saving === setting.key && <RefreshCw className="h-4 w-4 animate-spin" />}
      </div>
    );
  };

  const groupedSettings = defaultSettings.reduce((acc, ds) => {
    if (!acc[ds.category]) {
      acc[ds.category] = [];
    }
    const setting = settings.find(s => s.key === ds.key);
    if (setting) {
      acc[ds.category].push({ ...setting, config: ds });
    }
    return acc;
  }, {} as Record<string, Array<AppSetting & { config: any }>>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
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
        <h1 className="text-3xl font-bold">Impostazioni Sistema</h1>
        <p className="text-muted-foreground">
          Configura le impostazioni globali dell'applicazione
        </p>
      </div>

      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {category}
            </CardTitle>
            <CardDescription>
              Configurazioni per la categoria {category.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {categorySettings.map((setting, index) => {
              const Icon = setting.config.icon;
              return (
                <div key={setting.key}>
                  {index > 0 && <Separator className="mb-6" />}
                  <div className="flex items-start justify-between space-x-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">
                            {setting.key.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </Label>
                          {setting.id.startsWith('default-') && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {setting.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ultimo aggiornamento: {new Date(setting.updated_at).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      {renderSettingInput(setting)}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Informazioni Sistema
          </CardTitle>
          <CardDescription>
            Stato e informazioni generali del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Stato Database</Label>
              <Badge className="bg-green-100 text-green-800">Connesso</Badge>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium">Ambiente</Label>
              <Badge variant="outline">Produzione</Badge>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium">Utenti Totali</Label>
              <p className="text-sm font-mono">{settings.length > 0 ? '...' : 'Caricamento...'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium">Storage Utilizzato</Label>
              <p className="text-sm font-mono">... MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}