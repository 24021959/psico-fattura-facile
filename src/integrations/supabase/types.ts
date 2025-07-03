export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      discount_code_usage: {
        Row: {
          discount_code_id: string | null
          id: string
          stripe_session_id: string | null
          used_at: string
          user_id: string | null
        }
        Insert: {
          discount_code_id?: string | null
          id?: string
          stripe_session_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Update: {
          discount_code_id?: string | null
          id?: string
          stripe_session_id?: string | null
          used_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_code_usage_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          applicable_plans: string[] | null
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          id: string
          is_active: boolean
          max_uses: number | null
          type: string
          valid_from: string
          valid_until: string | null
          value: number
        }
        Insert: {
          applicable_plans?: string[] | null
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          type: string
          valid_from?: string
          valid_until?: string | null
          value: number
        }
        Update: {
          applicable_plans?: string[] | null
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          type?: string
          valid_from?: string
          valid_until?: string | null
          value?: number
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          html_template: string
          id: string
          is_active: boolean
          name: string
          subject_template: string
          text_template: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_template: string
          id?: string
          is_active?: boolean
          name: string
          subject_template: string
          text_template: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          html_template?: string
          id?: string
          is_active?: boolean
          name?: string
          subject_template?: string
          text_template?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      eventi_calendario: {
        Row: {
          created_at: string
          data_evento: string
          descrizione: string | null
          fattura_id: string | null
          id: string
          orario: string
          paziente_id: string | null
          prestazione_id: string | null
          stato: string
          tipo: string
          titolo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_evento: string
          descrizione?: string | null
          fattura_id?: string | null
          id?: string
          orario: string
          paziente_id?: string | null
          prestazione_id?: string | null
          stato?: string
          tipo: string
          titolo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_evento?: string
          descrizione?: string | null
          fattura_id?: string | null
          id?: string
          orario?: string
          paziente_id?: string | null
          prestazione_id?: string | null
          stato?: string
          tipo?: string
          titolo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fatture: {
        Row: {
          created_at: string
          data_fattura: string
          data_scadenza: string | null
          id: string
          iva_importo: number
          iva_percentuale: number
          metodo_pagamento: string | null
          note: string | null
          numero_fattura: string
          paziente_id: string
          stato: string
          subtotale: number
          totale: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_fattura?: string
          data_scadenza?: string | null
          id?: string
          iva_importo?: number
          iva_percentuale?: number
          metodo_pagamento?: string | null
          note?: string | null
          numero_fattura: string
          paziente_id: string
          stato?: string
          subtotale?: number
          totale?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_fattura?: string
          data_scadenza?: string | null
          id?: string
          iva_importo?: number
          iva_percentuale?: number
          metodo_pagamento?: string | null
          note?: string | null
          numero_fattura?: string
          paziente_id?: string
          stato?: string
          subtotale?: number
          totale?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fatture_paziente_id_fkey"
            columns: ["paziente_id"]
            isOneToOne: false
            referencedRelation: "pazienti"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_usage: {
        Row: {
          created_at: string
          fatture_count: number | null
          id: string
          month_year: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          fatture_count?: number | null
          id?: string
          month_year: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          fatture_count?: number | null
          id?: string
          month_year?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          email_invoices: boolean
          email_marketing: boolean
          email_reminders: boolean
          email_system_updates: boolean
          id: string
          reminder_days_before: number
          sms_reminders: boolean
          system_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_invoices?: boolean
          email_marketing?: boolean
          email_reminders?: boolean
          email_system_updates?: boolean
          id?: string
          reminder_days_before?: number
          sms_reminders?: boolean
          system_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_invoices?: boolean
          email_marketing?: boolean
          email_reminders?: boolean
          email_system_updates?: boolean
          id?: string
          reminder_days_before?: number
          sms_reminders?: boolean
          system_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          priority: string
          read_at: string | null
          recipient: string
          sent_at: string | null
          status: string
          subject: string | null
          template_used: string | null
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          recipient: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_used?: string | null
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          recipient?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          template_used?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pazienti: {
        Row: {
          cap: string | null
          citta: string | null
          codice_fiscale: string | null
          cognome: string
          created_at: string
          data_nascita: string | null
          email: string | null
          id: string
          indirizzo: string | null
          nome: string
          note: string | null
          prestazione_default_id: string | null
          telefono: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cap?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          cognome: string
          created_at?: string
          data_nascita?: string | null
          email?: string | null
          id?: string
          indirizzo?: string | null
          nome: string
          note?: string | null
          prestazione_default_id?: string | null
          telefono?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cap?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          cognome?: string
          created_at?: string
          data_nascita?: string | null
          email?: string | null
          id?: string
          indirizzo?: string | null
          nome?: string
          note?: string | null
          prestazione_default_id?: string | null
          telefono?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pazienti_prestazione_default_id_fkey"
            columns: ["prestazione_default_id"]
            isOneToOne: false
            referencedRelation: "prestazioni"
            referencedColumns: ["id"]
          },
        ]
      }
      prestazioni: {
        Row: {
          attiva: boolean | null
          created_at: string
          descrizione: string | null
          durata_minuti: number | null
          id: string
          nome: string
          prezzo_unitario: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attiva?: boolean | null
          created_at?: string
          descrizione?: string | null
          durata_minuti?: number | null
          id?: string
          nome: string
          prezzo_unitario: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attiva?: boolean | null
          created_at?: string
          descrizione?: string | null
          durata_minuti?: number | null
          id?: string
          nome?: string
          prezzo_unitario?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cap: string | null
          citta: string | null
          codice_fiscale: string | null
          cognome: string
          created_at: string
          email: string
          enpap_a_paziente: boolean | null
          iban: string | null
          id: string
          indirizzo: string | null
          logo_url: string | null
          nome: string
          numero_iscrizione_albo: string | null
          partita_iva: string | null
          pec: string | null
          percentuale_enpap: number | null
          regime_fiscale: string | null
          telefono: string | null
          titolo: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cap?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          cognome: string
          created_at?: string
          email: string
          enpap_a_paziente?: boolean | null
          iban?: string | null
          id?: string
          indirizzo?: string | null
          logo_url?: string | null
          nome: string
          numero_iscrizione_albo?: string | null
          partita_iva?: string | null
          pec?: string | null
          percentuale_enpap?: number | null
          regime_fiscale?: string | null
          telefono?: string | null
          titolo?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cap?: string | null
          citta?: string | null
          codice_fiscale?: string | null
          cognome?: string
          created_at?: string
          email?: string
          enpap_a_paziente?: boolean | null
          iban?: string | null
          id?: string
          indirizzo?: string | null
          logo_url?: string | null
          nome?: string
          numero_iscrizione_albo?: string | null
          partita_iva?: string | null
          pec?: string | null
          percentuale_enpap?: number | null
          regime_fiscale?: string | null
          telefono?: string | null
          titolo?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      righe_fattura: {
        Row: {
          created_at: string
          descrizione: string
          fattura_id: string
          id: string
          prestazione_id: string | null
          prezzo_unitario: number
          quantita: number
          totale: number
        }
        Insert: {
          created_at?: string
          descrizione: string
          fattura_id: string
          id?: string
          prestazione_id?: string | null
          prezzo_unitario: number
          quantita?: number
          totale: number
        }
        Update: {
          created_at?: string
          descrizione?: string
          fattura_id?: string
          id?: string
          prestazione_id?: string | null
          prezzo_unitario?: number
          quantita?: number
          totale?: number
        }
        Relationships: [
          {
            foreignKeyName: "righe_fattura_fattura_id_fkey"
            columns: ["fattura_id"]
            isOneToOne: false
            referencedRelation: "fatture"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "righe_fattura_prestazione_id_fkey"
            columns: ["prestazione_id"]
            isOneToOne: false
            referencedRelation: "prestazioni"
            referencedColumns: ["id"]
          },
        ]
      }
      sedute_diario: {
        Row: {
          created_at: string
          data_seduta: string
          esercizio_assegnato: string | null
          id: string
          note_criptate: string | null
          paziente_id: string
          titolo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_seduta?: string
          esercizio_assegnato?: string | null
          id?: string
          note_criptate?: string | null
          paziente_id: string
          titolo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_seduta?: string
          esercizio_assegnato?: string | null
          id?: string
          note_criptate?: string | null
          paziente_id?: string
          titolo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sedute_diario_paziente_id_fkey"
            columns: ["paziente_id"]
            isOneToOne: false
            referencedRelation: "pazienti"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          assistenza_prioritaria: boolean | null
          backup_enabled: boolean | null
          created_at: string
          diario_clinico_enabled: boolean | null
          id: string
          max_fatture_mensili: number | null
          name: string
          price_monthly: number
          stripe_price_id: string | null
        }
        Insert: {
          assistenza_prioritaria?: boolean | null
          backup_enabled?: boolean | null
          created_at?: string
          diario_clinico_enabled?: boolean | null
          id?: string
          max_fatture_mensili?: number | null
          name: string
          price_monthly: number
          stripe_price_id?: string | null
        }
        Update: {
          assistenza_prioritaria?: boolean | null
          backup_enabled?: boolean | null
          created_at?: string
          diario_clinico_enabled?: boolean | null
          id?: string
          max_fatture_mensili?: number | null
          name?: string
          price_monthly?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      support_ticket_responses: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean
          message: string
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          description: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          fatture_count_mensile: number | null
          id: string
          plan_name: string
          reset_fatture_data: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          fatture_count_mensile?: number | null
          id?: string
          plan_name: string
          reset_fatture_data?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          fatture_count_mensile?: number | null
          id?: string
          plan_name?: string
          reset_fatture_data?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_role: {
        Args: { user_id: string }
        Returns: string
      }
      increment_monthly_usage: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
