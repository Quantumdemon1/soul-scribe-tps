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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          access_count: number | null
          assessment_id: string | null
          cache_key: string | null
          content: Json
          created_at: string
          id: string
          insight_type: string
          last_accessed_at: string | null
          model_used: string | null
          section_name: string | null
          user_id: string | null
          version: number
        }
        Insert: {
          access_count?: number | null
          assessment_id?: string | null
          cache_key?: string | null
          content: Json
          created_at?: string
          id?: string
          insight_type: string
          last_accessed_at?: string | null
          model_used?: string | null
          section_name?: string | null
          user_id?: string | null
          version?: number
        }
        Update: {
          access_count?: number | null
          assessment_id?: string | null
          cache_key?: string | null
          content?: Json
          created_at?: string
          id?: string
          insight_type?: string
          last_accessed_at?: string | null
          model_used?: string | null
          section_name?: string | null
          user_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          created_at: string
          id: string
          profile: Json
          responses: Json | null
          updated_at: string
          user_id: string
          variant: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile: Json
          responses?: Json | null
          updated_at?: string
          user_id: string
          variant?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile?: Json
          responses?: Json | null
          updated_at?: string
          user_id?: string
          variant?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          insight_content: Json
          section_name: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          insight_content: Json
          section_name: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          insight_content?: Json
          section_name?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          context: Json | null
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          severity: string
          timestamp: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          severity: string
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          severity?: string
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      insight_comparisons: {
        Row: {
          baseline_assessment_id: string
          changes_detected: Json
          comparison_assessment_id: string
          confidence_change: number | null
          created_at: string
          id: string
          section_name: string
          user_id: string
        }
        Insert: {
          baseline_assessment_id: string
          changes_detected: Json
          comparison_assessment_id: string
          confidence_change?: number | null
          created_at?: string
          id?: string
          section_name: string
          user_id: string
        }
        Update: {
          baseline_assessment_id?: string
          changes_detected?: Json
          comparison_assessment_id?: string
          confidence_change?: number | null
          created_at?: string
          id?: string
          section_name?: string
          user_id?: string
        }
        Relationships: []
      }
      llm_config: {
        Row: {
          config: Json
          created_at: string
          id: string
          mapping_weights: Json
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          mapping_weights?: Json
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          mapping_weights?: Json
          updated_at?: string
        }
        Relationships: []
      }
      mentor_conversations: {
        Row: {
          assessment_id: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_conversations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "mentor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      socratic_sessions: {
        Row: {
          conversations: Json
          created_at: string
          cusps: Json
          final_scores: Json
          id: string
          initial_scores: Json
          user_id: string | null
        }
        Insert: {
          conversations?: Json
          created_at?: string
          cusps: Json
          final_scores: Json
          id?: string
          initial_scores: Json
          user_id?: string | null
        }
        Update: {
          conversations?: Json
          created_at?: string
          cusps?: Json
          final_scores?: Json
          id?: string
          initial_scores?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          dashboard_layout: Json | null
          hidden_sections: string[] | null
          id: string
          insight_detail_level: string | null
          notification_settings: Json | null
          theme_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboard_layout?: Json | null
          hidden_sections?: string[] | null
          id?: string
          insight_detail_level?: string | null
          notification_settings?: Json | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboard_layout?: Json | null
          hidden_sections?: string[] | null
          id?: string
          insight_detail_level?: string | null
          notification_settings?: Json | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
