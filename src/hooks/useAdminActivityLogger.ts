import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LogActivityParams {
  action: string;
  target_type?: string;
  target_id?: string;
  details?: any;
}

export function useAdminActivityLogger() {
  const logActivity = useCallback(async (params: LogActivityParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('log-admin-activity', {
        body: params
      });

      if (error) {
        console.error('Error logging admin activity:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Error logging admin activity:', error);
      return false;
    }
  }, []);

  return { logActivity };
}