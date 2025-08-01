export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          request_id: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs_2025_01: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          request_id: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs_2025_02: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          request_id: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs_2025_03: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          request_id: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs_2025_04: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          request_id: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs_2025_05: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          request_id: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs_2025_06: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          request_id: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          request_id?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      client_organizations: {
        Row: {
          client_id: string
          id: string
          joined_at: string | null
          last_visit_at: string | null
          membership_status: string | null
          notes: string | null
          organization_id: string
          visit_count: number | null
        }
        Insert: {
          client_id: string
          id?: string
          joined_at?: string | null
          last_visit_at?: string | null
          membership_status?: string | null
          notes?: string | null
          organization_id: string
          visit_count?: number | null
        }
        Update: {
          client_id?: string
          id?: string
          joined_at?: string | null
          last_visit_at?: string | null
          membership_status?: string | null
          notes?: string | null
          organization_id?: string
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_organizations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          gender: string | null
          id: string
          medical_conditions: string | null
          preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          medical_conditions?: string | null
          preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          gender?: string | null
          id?: string
          medical_conditions?: string | null
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          attended_at: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          checked_in_at: string | null
          checked_in_by: string | null
          client_id: string | null
          event_id: string
          id: string
          notes: string | null
          payment_amount: number | null
          payment_status: string | null
          registered_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          attended_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          client_id?: string | null
          event_id: string
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          registered_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          attended_at?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          checked_in_at?: string | null
          checked_in_by?: string | null
          client_id?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          registered_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          currency: string | null
          current_participants: number | null
          description: string | null
          duration_minutes: number | null
          end_time: string
          event_type: string
          id: string
          instructor_id: string | null
          is_recurring: boolean | null
          is_virtual: boolean | null
          lead_source: string | null
          location: string | null
          max_participants: number | null
          meeting_link: string | null
          metadata: Json | null
          organization_id: string
          parent_event_id: string | null
          price: number | null
          recurring_pattern: Json | null
          room_number: string | null
          start_time: string
          status: string | null
          title: string
          tour_type: string | null
          updated_at: string | null
          waitlist_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number | null
          end_time: string
          event_type: string
          id?: string
          instructor_id?: string | null
          is_recurring?: boolean | null
          is_virtual?: boolean | null
          lead_source?: string | null
          location?: string | null
          max_participants?: number | null
          meeting_link?: string | null
          metadata?: Json | null
          organization_id: string
          parent_event_id?: string | null
          price?: number | null
          recurring_pattern?: Json | null
          room_number?: string | null
          start_time: string
          status?: string | null
          title: string
          tour_type?: string | null
          updated_at?: string | null
          waitlist_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string
          event_type?: string
          id?: string
          instructor_id?: string | null
          is_recurring?: boolean | null
          is_virtual?: boolean | null
          lead_source?: string | null
          location?: string | null
          max_participants?: number | null
          meeting_link?: string | null
          metadata?: Json | null
          organization_id?: string
          parent_event_id?: string | null
          price?: number | null
          recurring_pattern?: Json | null
          room_number?: string | null
          start_time?: string
          status?: string | null
          title?: string
          tour_type?: string | null
          updated_at?: string | null
          waitlist_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          access_all_locations: boolean | null
          allowed_locations: string[] | null
          billing_period: string
          class_limit: number | null
          class_limit_period: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_visible: boolean | null
          metadata: Json | null
          name: string
          organization_id: string
          price: number
          trial_days: number | null
          updated_at: string | null
        }
        Insert: {
          access_all_locations?: boolean | null
          allowed_locations?: string[] | null
          billing_period: string
          class_limit?: number | null
          class_limit_period?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_visible?: boolean | null
          metadata?: Json | null
          name: string
          organization_id: string
          price: number
          trial_days?: number | null
          updated_at?: string | null
        }
        Update: {
          access_all_locations?: boolean | null
          allowed_locations?: string[] | null
          billing_period?: string
          class_limit?: number | null
          class_limit_period?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_visible?: boolean | null
          metadata?: Json | null
          name?: string
          organization_id?: string
          price?: number
          trial_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_usage: {
        Row: {
          event_id: string
          id: string
          membership_id: string
          notes: string | null
          usage_type: string | null
          used_at: string | null
        }
        Insert: {
          event_id: string
          id?: string
          membership_id: string
          notes?: string | null
          usage_type?: string | null
          used_at?: string | null
        }
        Update: {
          event_id?: string
          id?: string
          membership_id?: string
          notes?: string | null
          usage_type?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_usage_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_usage_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          auto_renew: boolean | null
          cancellation_date: string | null
          cancellation_reason: string | null
          classes_remaining: number | null
          classes_used: number | null
          client_id: string
          contract_end_date: string | null
          contract_length: number | null
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          last_payment_date: string | null
          membership_plan_id: string
          metadata: Json | null
          next_billing_date: string | null
          notes: string | null
          organization_id: string
          pause_date: string | null
          payment_method: string | null
          resume_date: string | null
          start_date: string
          status: string | null
          updated_at: string | null
          usage_reset_date: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          classes_remaining?: number | null
          classes_used?: number | null
          client_id: string
          contract_end_date?: string | null
          contract_length?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          last_payment_date?: string | null
          membership_plan_id: string
          metadata?: Json | null
          next_billing_date?: string | null
          notes?: string | null
          organization_id: string
          pause_date?: string | null
          payment_method?: string | null
          resume_date?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
          usage_reset_date?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          cancellation_date?: string | null
          cancellation_reason?: string | null
          classes_remaining?: number | null
          classes_used?: number | null
          client_id?: string
          contract_end_date?: string | null
          contract_length?: number | null
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          last_payment_date?: string | null
          membership_plan_id?: string
          metadata?: Json | null
          next_billing_date?: string | null
          notes?: string | null
          organization_id?: string
          pause_date?: string | null
          payment_method?: string | null
          resume_date?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
          usage_reset_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          all_notifications_enabled: boolean | null
          created_at: string | null
          id: string
          organization_id: string | null
          preferences: Json | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          all_notifications_enabled?: boolean | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          preferences?: Json | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          all_notifications_enabled?: boolean | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          preferences?: Json | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string | null
          email_sent: boolean | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          organization_id: string | null
          push_sent: boolean | null
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          sms_sent: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          email_sent?: boolean | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          organization_id?: string | null
          push_sent?: boolean | null
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          sms_sent?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string | null
          email_sent?: boolean | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          organization_id?: string | null
          push_sent?: boolean | null
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          sms_sent?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      taggables: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          tag_id: string
          taggable_id: string
          taggable_type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          tag_id: string
          taggable_id: string
          taggable_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          tag_id?: string
          taggable_id?: string
          taggable_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "taggables_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taggables_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organizations: {
        Row: {
          id: string
          is_primary: boolean | null
          joined_at: string | null
          organization_id: string
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          is_primary?: boolean | null
          joined_at?: string | null
          organization_id: string
          permissions?: Json | null
          role: string
          user_id: string
        }
        Update: {
          id?: string
          is_primary?: boolean | null
          joined_at?: string | null
          organization_id?: string
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_organizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          metadata: Json | null
          phone: string | null
          updated_at: string | null
          user_type: string
          workos_user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          updated_at?: string | null
          user_type: string
          workos_user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          phone?: string | null
          updated_at?: string | null
          user_type?: string
          workos_user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { p_token: string; p_name: string; p_password: string }
        Returns: Json
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_invitation: {
        Args: { p_email: string; p_role: string; p_created_by_id?: string }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type: string
          p_organization_id?: string
          p_action_url?: string
          p_related_entity_id?: string
          p_related_entity_type?: string
          p_metadata?: Json
        }
        Returns: string
      }
      expire_old_invitations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_entity_tags: {
        Args: { entity_id: string; entity_type: string }
        Returns: {
          tag_id: string
          tag_name: string
          tag_type: string
          tag_color: string
          tag_icon: string
        }[]
      }
      get_unread_notification_count: {
        Args: { p_user_id: string; p_organization_id?: string }
        Returns: number
      }
      get_user_claims: {
        Args: { user_id: string }
        Returns: Json
      }
      get_user_gym_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_entity_type: string
          p_entity_id: string
          p_old_values?: Json
          p_new_values?: Json
          p_metadata?: Json
        }
        Returns: string
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      user_has_role: {
        Args: { required_role: string }
        Returns: boolean
      }
      validate_role_assignment: {
        Args: { user_id: string; new_role: string; target_gym_id: string }
        Returns: boolean
      }
      validate_user_gym_access: {
        Args: { user_id: string; target_gym_id: string }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const