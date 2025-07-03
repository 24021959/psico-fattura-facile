import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateTicketRequest {
  subject: string;
  description: string;
  priority?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Unauthorized");
    }

    const { subject, description, priority = 'medium' }: CreateTicketRequest = await req.json();

    if (!subject || !description) {
      throw new Error("Subject and description are required");
    }

    // Create the support ticket
    const { data: ticket, error: ticketError } = await supabaseClient
      .from('support_tickets')
      .insert({
        user_id: userData.user.id,
        subject,
        description,
        priority,
        status: 'open'
      })
      .select()
      .single();

    if (ticketError) {
      throw ticketError;
    }

    // Log admin activity about new ticket (for admin notifications)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseAdmin
      .from('admin_activity_log')
      .insert({
        admin_user_id: null, // This is a user action, not admin
        action: 'new_support_ticket_created',
        target_type: 'support_ticket',
        target_id: ticket.id,
        details: {
          subject,
          priority,
          user_id: userData.user.id
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        ticket: {
          id: ticket.id,
          subject: ticket.subject,
          status: ticket.status,
          priority: ticket.priority,
          created_at: ticket.created_at
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      }
    );

  } catch (error) {
    console.error("Error creating support ticket:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});