import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAdminActivityLogger } from '@/hooks/useAdminActivityLogger';
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Percent, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AdminDiscountCodesProps {
  userRole: string | null;
}

interface DiscountCode {
  id: string;
  code: string;
  type: string;
  value: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  applicable_plans: string[] | null;
  created_at: string;
}

export function AdminDiscountCodes({ userRole }: AdminDiscountCodesProps) {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    max_uses: '',
    valid_from: new Date(),
    valid_until: null as Date | null,
    applicable_plans: [] as string[]
  });
  const { logActivity } = useAdminActivityLogger();

  useEffect(() => {
    fetchDiscountCodes();
    logActivity({
      action: 'view_discount_codes',
      target_type: 'admin_dashboard'
    });
  }, [logActivity]);

  const fetchDiscountCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      console.error('Error fetching discount codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const codeData = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.value,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_from: formData.valid_from.toISOString(),
        valid_until: formData.valid_until?.toISOString() || null,
        applicable_plans: formData.applicable_plans.length > 0 ? formData.applicable_plans : null
      };

      if (editingCode) {
        const { error } = await supabase
          .from('discount_codes')
          .update(codeData)
          .eq('id', editingCode.id);

        if (error) throw error;

        logActivity({
          action: 'update_discount_code',
          target_type: 'discount_code',
          target_id: editingCode.id,
          details: { code: codeData.code }
        });
      } else {
        const { error } = await supabase
          .from('discount_codes')
          .insert(codeData);

        if (error) throw error;

        logActivity({
          action: 'create_discount_code',
          target_type: 'discount_code',
          details: { code: codeData.code }
        });
      }

      fetchDiscountCodes();
      setDialogOpen(false);
      setEditingCode(null);
      setFormData({
        code: '',
        type: 'percentage',
        value: 0,
        max_uses: '',
        valid_from: new Date(),
        valid_until: null,
        applicable_plans: []
      });
    } catch (error) {
      console.error('Error saving discount code:', error);
    }
  };

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      type: code.type,
      value: code.value,
      max_uses: code.max_uses?.toString() || '',
      valid_from: new Date(code.valid_from),
      valid_until: code.valid_until ? new Date(code.valid_until) : null,
      applicable_plans: code.applicable_plans || []
    });
    setDialogOpen(true);
  };

  const handleToggleActive = async (codeId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: !isActive })
        .eq('id', codeId);

      if (error) throw error;

      logActivity({
        action: isActive ? 'deactivate_discount_code' : 'activate_discount_code',
        target_type: 'discount_code',
        target_id: codeId
      });

      fetchDiscountCodes();
    } catch (error) {
      console.error('Error toggling discount code:', error);
    }
  };

  const getCodeBadgeColor = (isActive: boolean, validUntil: string | null) => {
    if (!isActive) return 'bg-gray-100 text-gray-800';
    if (validUntil && new Date(validUntil) < new Date()) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  const getUsagePercentage = (currentUses: number, maxUses: number | null) => {
    if (!maxUses) return 0;
    return (currentUses / maxUses) * 100;
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Codici Sconto</h1>
          <p className="text-muted-foreground">
            Gestisci i codici sconto per le sottoscrizioni
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCode(null);
              setFormData({
                code: '',
                type: 'percentage',
                value: 0,
                max_uses: '',
                valid_from: new Date(),
                valid_until: null,
                applicable_plans: []
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Codice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCode ? 'Modifica Codice Sconto' : 'Nuovo Codice Sconto'}
              </DialogTitle>
              <DialogDescription>
                Configura i parametri del codice sconto
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Codice</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="SCONTO20"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentuale</SelectItem>
                      <SelectItem value="fixed">Fisso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="value">Valore</Label>
                  <div className="relative">
                    {formData.type === 'percentage' ? (
                      <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    )}
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      className="pl-10"
                      min="0"
                      max={formData.type === 'percentage' ? 100 : undefined}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_uses">Utilizzi Massimi (opzionale)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                  placeholder="Illimitato"
                  min="1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Inizio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !formData.valid_from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.valid_from ? format(formData.valid_from, "dd/MM/yyyy", { locale: it }) : "Seleziona data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.valid_from}
                        onSelect={(date) => setFormData(prev => ({ ...prev, valid_from: date || new Date() }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Data Fine (opzionale)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !formData.valid_until && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.valid_until ? format(formData.valid_until, "dd/MM/yyyy", { locale: it }) : "Nessuna scadenza"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.valid_until}
                        onSelect={(date) => setFormData(prev => ({ ...prev, valid_until: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit">
                  {editingCode ? 'Aggiorna' : 'Crea'} Codice
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Codici Sconto ({codes.length})</CardTitle>
          <CardDescription>
            Lista completa dei codici sconto configurati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codice</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valore</TableHead>
                <TableHead>Utilizzi</TableHead>
                <TableHead>Validità</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell>
                    <div className="font-mono font-medium">{code.code}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {code.type === 'percentage' ? 'Percentuale' : 'Fisso'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {code.type === 'percentage' ? `${code.value}%` : `€${code.value}`}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        {code.current_uses} / {code.max_uses || '∞'}
                      </div>
                      {code.max_uses && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${getUsagePercentage(code.current_uses, code.max_uses)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Dal {format(new Date(code.valid_from), "dd/MM/yyyy", { locale: it })}</div>
                      {code.valid_until && (
                        <div>Al {format(new Date(code.valid_until), "dd/MM/yyyy", { locale: it })}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCodeBadgeColor(code.is_active, code.valid_until)}>
                      {!code.is_active 
                        ? 'Disattivo' 
                        : code.valid_until && new Date(code.valid_until) < new Date()
                        ? 'Scaduto'
                        : 'Attivo'
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(code)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant={code.is_active ? "destructive" : "default"}
                        onClick={() => handleToggleActive(code.id, code.is_active)}
                      >
                        {code.is_active ? 'Disattiva' : 'Attiva'}
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