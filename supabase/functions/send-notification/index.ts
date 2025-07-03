import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'email' | 'system';
  recipient: string;
  template: string;
  data: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Unauthorized");
    }

    const { type, recipient, template, data, priority = 'normal' }: NotificationRequest = await req.json();

    // Get email templates
    const emailTemplates: Record<string, EmailTemplate> = {
      invoice_created: {
        subject: `Nuova Fattura #${data.invoiceNumber} - ${data.clinicName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #2563eb; margin: 0;">Psico Fattura Facile</h1>
            </div>
            <div style="padding: 30px 20px;">
              <h2 style="color: #1f2937;">Nuova Fattura Disponibile</h2>
              <p>Gentile ${data.patientName},</p>
              <p>È stata emessa una nuova fattura per le prestazioni ricevute:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; font-weight: bold;">Numero Fattura:</td><td style="padding: 8px 0;">#${data.invoiceNumber}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Data:</td><td style="padding: 8px 0;">${data.invoiceDate}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Importo:</td><td style="padding: 8px 0; font-size: 18px; color: #059669;">€${data.amount}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Scadenza:</td><td style="padding: 8px 0;">${data.dueDate || 'Immediata'}</td></tr>
                </table>
              </div>
              
              <p>La fattura è disponibile per il download e può essere utilizzata per eventuali rimborsi assicurativi.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.downloadUrl || '#'}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Scarica Fattura PDF
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #6b7280;">
                Cordiali saluti,<br>
                <strong>${data.clinicName}</strong><br>
                ${data.clinicAddress || ''}<br>
                ${data.clinicPhone || ''} | ${data.clinicEmail || ''}
              </p>
            </div>
            <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
              Questa email è stata generata automaticamente da Psico Fattura Facile
            </div>
          </div>
        `,
        text: `
Nuova Fattura Disponibile

Gentile ${data.patientName},

È stata emessa una nuova fattura per le prestazioni ricevute:

Numero Fattura: #${data.invoiceNumber}
Data: ${data.invoiceDate}
Importo: €${data.amount}
Scadenza: ${data.dueDate || 'Immediata'}

La fattura è disponibile per il download e può essere utilizzata per eventuali rimborsi assicurativi.

Cordiali saluti,
${data.clinicName}
${data.clinicAddress || ''}
${data.clinicPhone || ''} | ${data.clinicEmail || ''}
        `
      },
      payment_reminder: {
        subject: `Promemoria Pagamento - Fattura #${data.invoiceNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #fef3c7; padding: 20px; text-align: center;">
              <h1 style="color: #d97706; margin: 0;">Promemoria Pagamento</h1>
            </div>
            <div style="padding: 30px 20px;">
              <h2 style="color: #1f2937;">Fattura in Scadenza</h2>
              <p>Gentile ${data.patientName},</p>
              <p>Le ricordiamo che la seguente fattura è in scadenza:</p>
              
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d97706;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; font-weight: bold;">Numero Fattura:</td><td style="padding: 8px 0;">#${data.invoiceNumber}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Data Emissione:</td><td style="padding: 8px 0;">${data.invoiceDate}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Importo:</td><td style="padding: 8px 0; font-size: 18px; color: #d97706;">€${data.amount}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold;">Scadenza:</td><td style="padding: 8px 0; color: #dc2626;"><strong>${data.dueDate}</strong></td></tr>
                </table>
              </div>
              
              <p>La preghiamo di provvedere al pagamento entro la data di scadenza per evitare eventuali inconvenienti.</p>
              
              ${data.paymentInstructions ? `
                <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #374151;">Modalità di Pagamento:</h3>
                  <p style="margin-bottom: 0;">${data.paymentInstructions}</p>
                </div>
              ` : ''}
              
              <p style="font-size: 14px; color: #6b7280;">
                Per qualsiasi chiarimento, non esiti a contattarci.<br><br>
                Cordiali saluti,<br>
                <strong>${data.clinicName}</strong>
              </p>
            </div>
          </div>
        `,
        text: `
Promemoria Pagamento

Gentile ${data.patientName},

Le ricordiamo che la seguente fattura è in scadenza:

Numero Fattura: #${data.invoiceNumber}
Data Emissione: ${data.invoiceDate}
Importo: €${data.amount}
Scadenza: ${data.dueDate}

La preghiamo di provvedere al pagamento entro la data di scadenza.

${data.paymentInstructions ? `Modalità di Pagamento: ${data.paymentInstructions}` : ''}

Cordiali saluti,
${data.clinicName}
        `
      },
      subscription_expiring: {
        subject: `Il tuo abbonamento sta per scadere - Psico Fattura Facile`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #fef2f2; padding: 20px; text-align: center;">
              <h1 style="color: #dc2626; margin: 0;">Abbonamento in Scadenza</h1>
            </div>
            <div style="padding: 30px 20px;">
              <h2 style="color: #1f2937;">Rinnova il tuo abbonamento</h2>
              <p>Ciao ${data.userName},</p>
              <p>Il tuo abbonamento <strong>${data.planName}</strong> scadrà il <strong>${data.expiryDate}</strong>.</p>
              
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <h3 style="margin-top: 0; color: #dc2626;">Cosa succede alla scadenza?</h3>
                <ul style="margin-bottom: 0;">
                  <li>Non potrai più creare nuove fatture</li>
                  <li>L'accesso alle funzioni premium sarà limitato</li>
                  <li>I tuoi dati rimarranno al sicuro per 30 giorni</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.renewUrl}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Rinnova Ora
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">
                Grazie per aver scelto Psico Fattura Facile!
              </p>
            </div>
          </div>
        `,
        text: `
Abbonamento in Scadenza

Ciao ${data.userName},

Il tuo abbonamento ${data.planName} scadrà il ${data.expiryDate}.

Cosa succede alla scadenza?
- Non potrai più creare nuove fatture
- L'accesso alle funzioni premium sarà limitato
- I tuoi dati rimarranno al sicuro per 30 giorni

Rinnova il tuo abbonamento: ${data.renewUrl}

Grazie per aver scelto Psico Fattura Facile!
        `
      }
    };

    if (type === 'email') {
      const emailTemplate = emailTemplates[template];
      if (!emailTemplate) {
        throw new Error(`Email template '${template}' not found`);
      }

      // For demo purposes, we'll just log the email instead of actually sending it
      // In production, you would integrate with a service like SendGrid, Mailgun, etc.
      console.log('📧 Email would be sent:', {
        to: recipient,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        priority
      });

      // Store notification in database
      const { error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: userData.user.id,
          type: 'email',
          recipient,
          subject: emailTemplate.subject,
          content: emailTemplate.text,
          template_used: template,
          status: 'sent',
          priority,
          metadata: data
        });

      if (notificationError) {
        console.error('Error storing notification:', notificationError);
      }

    } else if (type === 'system') {
      // Store system notification
      const { error: notificationError } = await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: recipient, // For system notifications, recipient is user_id
          type: 'system',
          subject: data.title,
          content: data.message,
          status: 'unread',
          priority,
          metadata: data
        });

      if (notificationError) {
        throw notificationError;
      }
    }

    // Log activity
    await supabaseAdmin
      .from('admin_activity_log')
      .insert({
        admin_user_id: userData.user.id,
        action: 'send_notification',
        target_type: 'notification',
        details: { type, template, recipient, priority }
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${type} notification sent successfully` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});