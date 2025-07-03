import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UpdateTicketRequest {
  ticketId: string;
  status?: string;
  assignedTo?: string;
}

interface AddResponseRequest {
  ticketId: string;
  message: string;
  isInternal?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for admin operations
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

    if (action === 'update_status') {
      const { ticketId, status, assignedTo }: UpdateTicketRequest = await req.json();

      const updateData: any = {};
      if (status) updateData.status = status;
      if (assignedTo) updateData.assigned_to = assignedTo;
      if (status === 'closed') updateData.closed_at = new Date().toISOString();

      const { error: updateError } = await supabaseAdmin
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (updateError) {
        throw updateError;
      }

      // Log admin activity
      await supabaseAdmin
        .from('admin_activity_log')
        .insert({
          admin_user_id: userData.user.id,
          action: 'update_support_ticket',
          target_type: 'support_ticket',
          target_id: ticketId,
          details: { updateData }
        });

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (action === 'add_response') {
      const { ticketId, message, isInternal = false }: AddResponseRequest = await req.json();

      const { error: responseError } = await supabaseAdmin
        .from('support_ticket_responses')
        .insert({
          ticket_id: ticketId,
          user_id: userData.user.id,
          message,
          is_internal: isInternal
        });

      if (responseError) {
        throw responseError;
      }

      // Update ticket's updated_at timestamp
      await supabaseAdmin
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      // Log admin activity
      await supabaseAdmin
        .from('admin_activity_log')
        .insert({
          admin_user_id: userData.user.id,
          action: 'add_ticket_response',
          target_type: 'support_ticket',
          target_id: ticketId,
          details: { message_length: message.length, is_internal: isInternal }
        });

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        }
      );
    }

    throw new Error("Invalid action");

  } catch (error) {
    console.error("Error managing support ticket:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});