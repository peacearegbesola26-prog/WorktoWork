export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      account_suspensions: {
        Row: {
          reason: string
          suspended: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          reason?: string
          suspended?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          reason?: string
          suspended?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit: {
        Row: {
          action: string
          actor_id: string
          after_value: Json | null
          before_value: Json | null
          created_at: string
          id: string
          opportunity_id: string
        }
        Insert: {
          action: string
          actor_id: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          opportunity_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          after_value?: Json | null
          before_value?: Json | null
          created_at?: string
          id?: string
          opportunity_id?: string
        }
        Relationships: []
      }
      ai_controls: {
        Row: {
          daily_limit: number
          enabled: boolean
          input_limit: number
          scope: string
          updated_at: string
        }
        Insert: {
          daily_limit?: number
          enabled?: boolean
          input_limit?: number
          scope?: string
          updated_at?: string
        }
        Update: {
          daily_limit?: number
          enabled?: boolean
          input_limit?: number
          scope?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string
          finished_at: string | null
          id: string
          mode: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          finished_at?: string | null
          id?: string
          mode: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          finished_at?: string | null
          id?: string
          mode?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      alert_preferences: {
        Row: {
          countries: string[]
          created_at: string
          enabled: boolean
          id: string
          keywords: string
          name: string
          user_id: string
          work_preference: string
        }
        Insert: {
          countries?: string[]
          created_at?: string
          enabled?: boolean
          id?: string
          keywords?: string
          name: string
          user_id: string
          work_preference?: string
        }
        Update: {
          countries?: string[]
          created_at?: string
          enabled?: boolean
          id?: string
          keywords?: string
          name?: string
          user_id?: string
          work_preference?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          application_instructions: string
          application_url: string | null
          budget: number | null
          closing_date: string | null
          company: string
          country: string | null
          created_at: string
          currency: string | null
          description: string
          discovery_section: string
          id: string
          opportunity_type: string
          origin: string
          posted_at: string | null
          published: boolean
          service_category: string
          skills: string[]
          source_id: string | null
          status: string
          summary: string
          title: string
          updated_at: string
          url: string | null
          work_location: string
        }
        Insert: {
          application_instructions?: string
          application_url?: string | null
          budget?: number | null
          closing_date?: string | null
          company?: string
          country?: string | null
          created_at?: string
          currency?: string | null
          description?: string
          discovery_section?: string
          id?: string
          opportunity_type?: string
          origin?: string
          posted_at?: string | null
          published?: boolean
          service_category?: string
          skills?: string[]
          source_id?: string | null
          status?: string
          summary?: string
          title: string
          updated_at?: string
          url?: string | null
          work_location?: string
        }
        Update: {
          application_instructions?: string
          application_url?: string | null
          budget?: number | null
          closing_date?: string | null
          company?: string
          country?: string | null
          created_at?: string
          currency?: string | null
          description?: string
          discovery_section?: string
          id?: string
          opportunity_type?: string
          origin?: string
          posted_at?: string | null
          published?: boolean
          service_category?: string
          skills?: string[]
          source_id?: string | null
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          url?: string | null
          work_location?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_moderation: {
        Row: {
          duplicate_flag: boolean
          notes: string
          opportunity_id: string
          review_state: string
          updated_at: string
        }
        Insert: {
          duplicate_flag?: boolean
          notes?: string
          opportunity_id: string
          review_state?: string
          updated_at?: string
        }
        Update: {
          duplicate_flag?: boolean
          notes?: string
          opportunity_id?: string
          review_state?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_moderation_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: true
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          preferred_countries: string[]
          services: string[]
          skills: string[]
          work_preference: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string
          preferred_countries?: string[]
          services?: string[]
          skills?: string[]
          work_preference?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          preferred_countries?: string[]
          services?: string[]
          skills?: string[]
          work_preference?: string
        }
        Relationships: []
      }
      resume_ai_access: {
        Row: {
          message: string
          scope: string
          status: number
          updated_at: string
        }
        Insert: {
          message: string
          scope: string
          status: number
          updated_at?: string
        }
        Update: {
          message?: string
          scope?: string
          status?: number
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          content: Json
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_opportunities: {
        Row: {
          created_at: string
          opportunity_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          opportunity_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          opportunity_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_opportunities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
        }
        Relationships: []
      }
      sources: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          integration_configured: boolean
          name: string
          platform: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          integration_configured?: boolean
          name: string
          platform: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          integration_configured?: boolean
          name?: string
          platform?: string
        }
        Relationships: []
      }
      tracked_applications: {
        Row: {
          company: string
          created_at: string
          id: string
          notes: string
          opportunity_id: string | null
          status: Database["public"]["Enums"]["application_status"]
          title: string
          user_id: string
        }
        Insert: {
          company?: string
          created_at?: string
          id?: string
          notes?: string
          opportunity_id?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          title: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          id?: string
          notes?: string
          opportunity_id?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      website_content: {
        Row: {
          draft: Json
          key: string
          published: Json
          revision: number
          updated_at: string
        }
        Insert: {
          draft?: Json
          key: string
          published?: Json
          revision?: number
          updated_at?: string
        }
        Update: {
          draft?: Json
          key?: string
          published?: Json
          revision?: number
          updated_at?: string
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          id: boolean
          updated_at: string
          value: Json
        }
        Insert: {
          id?: boolean
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: boolean
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      website_versions: {
        Row: {
          actor_id: string | null
          content: Json
          created_at: string
          id: string
          key: string
          revision: number
        }
        Insert: {
          actor_id?: string | null
          content: Json
          created_at?: string
          id?: string
          key: string
          revision: number
        }
        Update: {
          actor_id?: string | null
          content?: Json
          created_at?: string
          id?: string
          key?: string
          revision?: number
        }
        Relationships: [
          {
            foreignKeyName: "website_versions_key_fkey"
            columns: ["key"]
            isOneToOne: false
            referencedRelation: "website_content"
            referencedColumns: ["key"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      account_is_active: { Args: never; Returns: boolean }
      admin_overview: { Args: never; Returns: Json }
      admin_users: {
        Args: {
          page_value?: number
          search_value?: string
          status_value?: string
        }
        Returns: Json
      }
      assert_active_account: { Args: never; Returns: undefined }
      finish_resume_ai: {
        Args: { request_id: string; request_status: string }
        Returns: undefined
      }
      has_permission: { Args: { p: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      opportunity_is_active: {
        Args: { o: Database["public"]["Tables"]["opportunities"]["Row"] }
        Returns: boolean
      }
      published_website: { Args: never; Returns: Json }
      reserve_resume_ai: {
        Args: { input_length: number; mode_value: string }
        Returns: string
      }
      set_account_suspension: {
        Args: { is_suspended: boolean; reason_value: string; target: string }
        Returns: undefined
      }
      set_staff_role: {
        Args: {
          grant_role: boolean
          new_role: Database["public"]["Enums"]["app_role"]
          target: string
        }
        Returns: undefined
      }
      staff_directory: {
        Args: never
        Returns: {
          email: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      verified_staff_target: { Args: { address: string }; Returns: string }
      website_available: { Args: never; Returns: boolean }
      website_content_command: {
        Args: {
          action_value: string
          content_value: Json
          expected_revision: number
          key_value: string
          version_id?: string
        }
        Returns: number
      }
      website_settings_command: {
        Args: { settings_value: Json }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "owner" | "moderator"
      application_status:
        | "Saved"
        | "Applied"
        | "Interview"
        | "Offer"
        | "Rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "owner", "moderator"],
      application_status: [
        "Saved",
        "Applied",
        "Interview",
        "Offer",
        "Rejected",
      ],
    },
  },
} as const
