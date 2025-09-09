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
      bulk_imports: {
        Row: {
          admin_user_id: string
          batch_id: string
          completed_at: string | null
          created_at: string
          error_count: number
          errors: Json | null
          filename: string
          id: string
          import_type: string
          metadata: Json | null
          status: string
          success_count: number
          total_records: number
        }
        Insert: {
          admin_user_id: string
          batch_id: string
          completed_at?: string | null
          created_at?: string
          error_count?: number
          errors?: Json | null
          filename: string
          id?: string
          import_type: string
          metadata?: Json | null
          status?: string
          success_count?: number
          total_records?: number
        }
        Update: {
          admin_user_id?: string
          batch_id?: string
          completed_at?: string | null
          created_at?: string
          error_count?: number
          errors?: Json | null
          filename?: string
          id?: string
          import_type?: string
          metadata?: Json | null
          status?: string
          success_count?: number
          total_records?: number
        }
        Relationships: []
      }
      bulk_operations: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          error_count: number
          error_details: Json | null
          id: string
          operation_type: string
          parameters: Json
          processed_items: number
          results: Json | null
          started_at: string | null
          status: string
          success_count: number
          total_items: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          error_count?: number
          error_details?: Json | null
          id?: string
          operation_type: string
          parameters?: Json
          processed_items?: number
          results?: Json | null
          started_at?: string | null
          status?: string
          success_count?: number
          total_items?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          error_count?: number
          error_details?: Json | null
          id?: string
          operation_type?: string
          parameters?: Json
          processed_items?: number
          results?: Json | null
          started_at?: string | null
          status?: string
          success_count?: number
          total_items?: number
        }
        Relationships: []
      }
      config_snapshots: {
        Row: {
          changes_summary: string[] | null
          config_data: Json
          description: string
          id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          changes_summary?: string[] | null
          config_data: Json
          description: string
          id?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          changes_summary?: string[] | null
          config_data?: Json
          description?: string
          id?: string
          timestamp?: string
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
      forum_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          min_verification_level: string | null
          name: string
          required_assessment_type: string | null
          required_integral_levels: string[] | null
          required_personality_types: string[] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_verification_level?: string | null
          name: string
          required_assessment_type?: string | null
          required_integral_levels?: string[] | null
          required_personality_types?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_verification_level?: string | null
          name?: string
          required_assessment_type?: string | null
          required_integral_levels?: string[] | null
          required_personality_types?: string[] | null
        }
        Relationships: []
      }
      forum_memberships: {
        Row: {
          forum_category_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          forum_category_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          forum_category_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_memberships_forum_category_id_fkey"
            columns: ["forum_category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
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
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      personality_overrides: {
        Row: {
          alignment: string | null
          attachment_style: string | null
          big_five_scores: Json | null
          created_at: string
          created_by: string
          enneagram_type: string | null
          holland_code: string | null
          id: string
          integral_level: string | null
          mbti_type: string | null
          socionics_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alignment?: string | null
          attachment_style?: string | null
          big_five_scores?: Json | null
          created_at?: string
          created_by: string
          enneagram_type?: string | null
          holland_code?: string | null
          id?: string
          integral_level?: string | null
          mbti_type?: string | null
          socionics_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alignment?: string | null
          attachment_style?: string | null
          big_five_scores?: Json | null
          created_at?: string
          created_by?: string
          enneagram_type?: string | null
          holland_code?: string | null
          id?: string
          integral_level?: string | null
          mbti_type?: string | null
          socionics_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      privacy_settings: {
        Row: {
          allow_direct_messages: boolean | null
          allow_forum_mentions: boolean | null
          allow_personality_matching: boolean | null
          created_at: string
          data_sharing_consent: boolean | null
          id: string
          show_assessment_results: boolean | null
          show_online_status: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_direct_messages?: boolean | null
          allow_forum_mentions?: boolean | null
          allow_personality_matching?: boolean | null
          created_at?: string
          data_sharing_consent?: boolean | null
          id?: string
          show_assessment_results?: boolean | null
          show_online_status?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_direct_messages?: boolean | null
          allow_forum_mentions?: boolean | null
          allow_personality_matching?: boolean | null
          created_at?: string
          data_sharing_consent?: boolean | null
          id?: string
          show_assessment_results?: boolean | null
          show_online_status?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          display_name: string | null
          id: string
          location: string | null
          personality_visibility: string | null
          profile_visibility: string | null
          updated_at: string
          user_id: string
          username: string | null
          verification_level: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          location?: string | null
          personality_visibility?: string | null
          profile_visibility?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          verification_level?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          location?: string | null
          personality_visibility?: string | null
          profile_visibility?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          verification_level?: string | null
          website?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      scoring_audit_log: {
        Row: {
          action: string
          change_description: string
          framework: string | null
          id: string
          impacted_users: number | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          rollback_data: Json | null
          target: string
          target_id: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          change_description: string
          framework?: string | null
          id?: string
          impacted_users?: number | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          rollback_data?: Json | null
          target: string
          target_id?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          change_description?: string
          framework?: string | null
          id?: string
          impacted_users?: number | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          rollback_data?: Json | null
          target?: string
          target_id?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
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
      test_results: {
        Row: {
          browser_info: Json | null
          completion_percentage: number | null
          created_at: string
          duration_ms: number | null
          end_time: string | null
          errors: Json | null
          id: string
          metadata: Json | null
          performance_metrics: Json | null
          score: number | null
          session_id: string
          start_time: string
          status: string
          test_name: string
          test_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          browser_info?: Json | null
          completion_percentage?: number | null
          created_at?: string
          duration_ms?: number | null
          end_time?: string | null
          errors?: Json | null
          id?: string
          metadata?: Json | null
          performance_metrics?: Json | null
          score?: number | null
          session_id: string
          start_time?: string
          status?: string
          test_name: string
          test_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          browser_info?: Json | null
          completion_percentage?: number | null
          created_at?: string
          duration_ms?: number | null
          end_time?: string | null
          errors?: Json | null
          id?: string
          metadata?: Json | null
          performance_metrics?: Json | null
          score?: number | null
          session_id?: string
          start_time?: string
          status?: string
          test_name?: string
          test_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      test_sessions: {
        Row: {
          completion_percentage: number
          created_at: string
          current_page: number
          expires_at: string
          id: string
          last_activity: string
          metadata: Json
          responses: Json
          session_token: string
          status: string
          test_name: string
          test_type: string
          total_pages: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completion_percentage?: number
          created_at?: string
          current_page?: number
          expires_at: string
          id?: string
          last_activity?: string
          metadata?: Json
          responses?: Json
          session_token: string
          status?: string
          test_name: string
          test_type: string
          total_pages: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completion_percentage?: number
          created_at?: string
          current_page?: number
          expires_at?: string
          id?: string
          last_activity?: string
          metadata?: Json
          responses?: Json
          session_token?: string
          status?: string
          test_name?: string
          test_type?: string
          total_pages?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_connections: {
        Row: {
          connection_type: string | null
          created_at: string
          follower_id: string
          following_id: string
          id: string
          personality_compatibility_score: number | null
        }
        Insert: {
          connection_type?: string | null
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
          personality_compatibility_score?: number | null
        }
        Update: {
          connection_type?: string | null
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
          personality_compatibility_score?: number | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      cleanup_expired_test_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_username: {
        Args: { username_input: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
