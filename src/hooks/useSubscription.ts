import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  stripe_price_id?: string;
  max_fatture_mensili?: number;
  diario_clinico_enabled: boolean;
  backup_enabled: boolean;
  assistenza_prioritaria: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_name: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  fatture_count_mensile: number;
  reset_fatture_data: string;
}

export interface MonthlyUsage {
  id: string;
  user_id: string;
  month_year: string;
  fatture_count: number;
}

export function useSubscription() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [currentUsage, setCurrentUsage] = useState<MonthlyUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i piani di abbonamento",
        variant: "destructive",
      });
    }
  };

  const fetchUserSubscription = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserSubscription(data);
    } catch (error) {
      console.error('Error fetching user subscription:', error);
    }
  };

  const fetchCurrentUsage = async () => {
    if (!user) return;

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    try {
      const { data, error } = await supabase
        .from('monthly_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentUsage(data);
    } catch (error) {
      console.error('Error fetching current usage:', error);
    }
  };

  const incrementUsage = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase.rpc('increment_monthly_usage', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      // Refresh usage data
      await fetchCurrentUsage();
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  const canCreateFattura = () => {
    if (!userSubscription || !currentUsage) return false;
    
    const currentPlan = plans.find(p => p.name === userSubscription.plan_name);
    if (!currentPlan) return false;
    
    // Se il piano ha limite illimitato (NULL), può sempre creare
    if (currentPlan.max_fatture_mensili === null) return true;
    
    // Altrimenti controlla se ha raggiunto il limite
    return currentUsage.fatture_count < currentPlan.max_fatture_mensili;
  };

  const getRemainingFatture = () => {
    if (!userSubscription || !currentUsage) return 0;
    
    const currentPlan = plans.find(p => p.name === userSubscription.plan_name);
    if (!currentPlan || currentPlan.max_fatture_mensili === null) return Infinity;
    
    return Math.max(0, currentPlan.max_fatture_mensili - currentUsage.fatture_count);
  };

  const getCurrentPlan = () => {
    if (!userSubscription) return null;
    return plans.find(p => p.name === userSubscription.plan_name) || null;
  };

  const createCheckoutSession = async (planName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { planName }
      });

      if (error) throw error;
      
      // Apri Stripe checkout in una nuova tab
      if (data?.url) {
        window.open(data.url, '_blank');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Errore",
        description: "Impossibile avviare il processo di pagamento",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createCustomerPortalSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {});

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      toast({
        title: "Errore",
        description: "Impossibile aprire la gestione abbonamento",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPlans(),
        fetchUserSubscription(),
        fetchCurrentUsage()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    plans,
    userSubscription,
    currentUsage,
    loading,
    canCreateFattura,
    getRemainingFatture,
    getCurrentPlan,
    incrementUsage,
    createCheckoutSession,
    createCustomerPortalSession,
    refetch: () => {
      fetchUserSubscription();
      fetchCurrentUsage();
    }
  };
}