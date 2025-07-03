import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Unauthorized");
    }

    // Verify user is admin
    const { data: isAdmin, error: adminError } = await supabaseAdmin.rpc('is_admin_user', {
      user_id: userData.user.id
    });

    if (adminError || !isAdmin) {
      throw new Error("Not authorized as admin");
    }

    // Get comprehensive stats
    const [
      { count: totalUsers },
      { count: activeSubscriptions },
      { count: totalInvoices },
      { count: pendingTickets },
      { data: recentActivity },
      { data: systemHealth }
    ] = await Promise.all([
      // Total users
      supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
      
      // Active subscriptions (non-FREE plans)
      supabaseAdmin
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .neq('plan_name', 'FREE')
        .eq('status', 'active'),
      
      // Total invoices
      supabaseAdmin
        .from('fatture')
        .select('*', { count: 'exact', head: true }),
      
      // Pending support tickets
      supabaseAdmin
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']),
      
      // Recent admin activity
      supabaseAdmin
        .from('admin_activity_log')
        .select(`
          id,
          action,
          target_type,
          target_id,
          details,
          created_at,
          admin_users!inner(
            user_id,
            profiles!inner(nome, cognome)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10),
      
      // System health check
      supabaseAdmin
        .from('profiles')
        .select('id')
        .limit(1)
    ]);

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newUsersThisMonth } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Database connectivity check
    const databaseOnline = systemHealth !== null;

    return new Response(
      JSON.stringify({
        stats: {
          totalUsers: totalUsers || 0,
          activeSubscriptions: activeSubscriptions || 0,
          totalInvoices: totalInvoices || 0,
          pendingTickets: pendingTickets || 0,
          newUsersThisMonth: newUsersThisMonth || 0
        },
        recentActivity: recentActivity || [],
        systemStatus: {
          database: databaseOnline ? 'online' : 'offline',
          lastChecked: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error getting admin stats:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});