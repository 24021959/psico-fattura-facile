import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateUserRequest {
  userId: string;
  updates: {
    nome?: string;
    cognome?: string;
    email?: string;
    telefono?: string;
    is_active?: boolean;
  };
}

interface UpdateSubscriptionRequest {
  userId: string;
  planName: string;
  status: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'update_user') {
      const { userId, updates }: UpdateUserRequest = await req.json();

      // Update user profile
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }

      // If email is being updated, also update in auth.users
      if (updates.email) {
        const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { email: updates.email }
        );
        
        if (authUpdateError) {
          console.error('Error updating auth email:', authUpdateError);
          // Don't fail completely if auth update fails
        }
      }

      // Log admin activity
      await supabaseAdmin
        .from('admin_activity_log')
        .insert({
          admin_user_id: userData.user.id,
          action: 'update_user_profile',
          target_type: 'user_profile',
          target_id: userId,
          details: { updates }
        });

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (action === 'suspend_user') {
      const { userId } = await req.json();

      // Suspend user in auth
      const { error: suspendError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { banned_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() } // 1 year
      );

      if (suspendError) {
        throw suspendError;
      }

      // Log admin activity
      await supabaseAdmin
        .from('admin_activity_log')
        .insert({
          admin_user_id: userData.user.id,
          action: 'suspend_user',
          target_type: 'user_account',
          target_id: userId,
          details: { reason: 'Admin suspension' }
        });

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (action === 'reactivate_user') {
      const { userId } = await req.json();

      // Reactivate user in auth
      const { error: reactivateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { banned_until: 'none' }
      );

      if (reactivateError) {
        throw reactivateError;
      }

      // Log admin activity
      await supabaseAdmin
        .from('admin_activity_log')
        .insert({
          admin_user_id: userData.user.id,
          action: 'reactivate_user',
          target_type: 'user_account',
          target_id: userId,
          details: { reason: 'Admin reactivation' }
        });

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (action === 'update_subscription') {
      const { userId, planName, status }: UpdateSubscriptionRequest = await req.json();

      // Update user subscription
      const { error: subError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          plan_name: planName,
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (subError) {
        throw subError;
      }

      // Log admin activity
      await supabaseAdmin
        .from('admin_activity_log')
        .insert({
          admin_user_id: userData.user.id,
          action: 'update_user_subscription',
          target_type: 'user_subscription',
          target_id: userId,
          details: { plan_name: planName, status }
        });

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    throw new Error("Invalid action");

  } catch (error) {
    console.error("Error managing user:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});