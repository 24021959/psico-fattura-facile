import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LogActivityRequest {
  action: string;
  target_type?: string;
  target_id?: string;
  details?: any;
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

    // Parse request body
    const { action, target_type, target_id, details }: LogActivityRequest = await req.json();

    // Get client info for logging
    const userAgent = req.headers.get("User-Agent");
    const forwardedFor = req.headers.get("X-Forwarded-For");
    const realIp = req.headers.get("X-Real-IP");
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Log the activity
    const { error: logError } = await supabaseAdmin
      .from('admin_activity_log')
      .insert({
        admin_user_id: userData.user.id,
        action,
        target_type,
        target_id,
        details,
        user_agent: userAgent,
        ip_address: clientIp
      });

    if (logError) {
      throw logError;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error logging admin activity:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});