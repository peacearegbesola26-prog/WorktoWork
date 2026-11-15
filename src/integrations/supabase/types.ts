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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_overview: { Args: never; Returns: Json }
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
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
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
