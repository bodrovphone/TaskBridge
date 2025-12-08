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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          availability_date: string | null
          created_at: string | null
          estimated_duration_hours: number | null
          id: string
          message: string
          professional_id: string
          proposed_price_bgn: number
          rejection_reason: string | null
          responded_at: string | null
          status: string | null
          task_id: string
          updated_at: string | null
          withdrawal_reason: string | null
          withdrawn_at: string | null
        }
        Insert: {
          availability_date?: string | null
          created_at?: string | null
          estimated_duration_hours?: number | null
          id?: string
          message: string
          professional_id: string
          proposed_price_bgn: number
          rejection_reason?: string | null
          responded_at?: string | null
          status?: string | null
          task_id: string
          updated_at?: string | null
          withdrawal_reason?: string | null
          withdrawn_at?: string | null
        }
        Update: {
          availability_date?: string | null
          created_at?: string | null
          estimated_duration_hours?: number | null
          id?: string
          message?: string
          professional_id?: string
          proposed_price_bgn?: number
          rejection_reason?: string | null
          responded_at?: string | null
          status?: string | null
          task_id?: string
          updated_at?: string | null
          withdrawal_reason?: string | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          is_system_message: boolean | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          task_id: string
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_system_message?: boolean | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          task_id: string
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_system_message?: boolean | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          channel: string
          cost_euros: number | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          notification_type: string
          status: string
          user_id: string | null
        }
        Insert: {
          channel: string
          cost_euros?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          status: string
          user_id?: string | null
        }
        Update: {
          channel?: string
          cost_euros?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          application_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          sent_via_email: boolean | null
          sent_via_push: boolean | null
          sent_via_sms: boolean | null
          task_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          application_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          sent_via_email?: boolean | null
          sent_via_push?: boolean | null
          sent_via_sms?: boolean | null
          task_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          application_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          sent_via_email?: boolean | null
          sent_via_push?: boolean | null
          sent_via_sms?: boolean | null
          task_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
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
      reviews: {
        Row: {
          comment: string | null
          communication_rating: number | null
          created_at: string | null
          flag_reason: string | null
          id: string
          is_flagged: boolean | null
          is_hidden: boolean | null
          professionalism_rating: number | null
          quality_rating: number | null
          rating: number
          responded_at: string | null
          response: string | null
          review_type: string
          reviewee_id: string
          reviewer_id: string
          task_id: string
          timeliness_rating: number | null
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          professionalism_rating?: number | null
          quality_rating?: number | null
          rating: number
          responded_at?: string | null
          response?: string | null
          review_type: string
          reviewee_id: string
          reviewer_id: string
          task_id: string
          timeliness_rating?: number | null
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          professionalism_rating?: number | null
          quality_rating?: number | null
          rating?: number
          responded_at?: string | null
          response?: string | null
          review_type?: string
          reviewee_id?: string
          reviewer_id?: string
          task_id?: string
          timeliness_rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_reports: {
        Row: {
          action_details: string | null
          action_taken: string | null
          created_at: string | null
          description: string
          evidence_urls: string[] | null
          id: string
          report_type: string
          reported_user_id: string
          reporter_id: string
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          task_id: string | null
        }
        Insert: {
          action_details?: string | null
          action_taken?: string | null
          created_at?: string | null
          description: string
          evidence_urls?: string[] | null
          id?: string
          report_type: string
          reported_user_id: string
          reporter_id: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          task_id?: string | null
        }
        Update: {
          action_details?: string | null
          action_taken?: string | null
          created_at?: string | null
          description?: string
          evidence_urls?: string[] | null
          id?: string
          report_type?: string
          reported_user_id?: string
          reporter_id?: string
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_reports_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          accepted_application_id: string | null
          address: string | null
          applications_count: number | null
          budget_max_bgn: number | null
          budget_min_bgn: number | null
          budget_type: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          category: string
          city: string
          completed_at: string | null
          completed_by_professional_at: string | null
          confirmed_by_customer_at: string | null
          created_at: string | null
          customer_id: string
          deadline: string | null
          description: string
          documents: string[] | null
          estimated_duration_hours: number | null
          id: string
          images: string[] | null
          is_urgent: boolean | null
          location_notes: string | null
          neighborhood: string | null
          requires_insurance: boolean | null
          requires_license: boolean | null
          reviewed_by_customer: boolean | null
          reviewed_by_professional: boolean | null
          selected_professional_id: string | null
          status: string | null
          subcategory: string | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          accepted_application_id?: string | null
          address?: string | null
          applications_count?: number | null
          budget_max_bgn?: number | null
          budget_min_bgn?: number | null
          budget_type?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category: string
          city: string
          completed_at?: string | null
          completed_by_professional_at?: string | null
          confirmed_by_customer_at?: string | null
          created_at?: string | null
          customer_id: string
          deadline?: string | null
          description: string
          documents?: string[] | null
          estimated_duration_hours?: number | null
          id?: string
          images?: string[] | null
          is_urgent?: boolean | null
          location_notes?: string | null
          neighborhood?: string | null
          requires_insurance?: boolean | null
          requires_license?: boolean | null
          reviewed_by_customer?: boolean | null
          reviewed_by_professional?: boolean | null
          selected_professional_id?: string | null
          status?: string | null
          subcategory?: string | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          accepted_application_id?: string | null
          address?: string | null
          applications_count?: number | null
          budget_max_bgn?: number | null
          budget_min_bgn?: number | null
          budget_type?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category?: string
          city?: string
          completed_at?: string | null
          completed_by_professional_at?: string | null
          confirmed_by_customer_at?: string | null
          created_at?: string | null
          customer_id?: string
          deadline?: string | null
          description?: string
          documents?: string[] | null
          estimated_duration_hours?: number | null
          id?: string
          images?: string[] | null
          is_urgent?: boolean | null
          location_notes?: string | null
          neighborhood?: string | null
          requires_insurance?: boolean | null
          requires_license?: boolean | null
          reviewed_by_customer?: boolean | null
          reviewed_by_professional?: boolean | null
          selected_professional_id?: string | null
          status?: string | null
          subcategory?: string | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_selected_professional_id_fkey"
            columns: ["selected_professional_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_connection_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          used: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          used?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          used?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_connection_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          acceptance_rate: number | null
          availability_status: string | null
          avatar_url: string | null
          average_rating: number | null
          ban_reason: string | null
          banned_at: string | null
          bio: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          email_verified_at: string | null
          full_name: string | null
          hourly_rate_bgn: number | null
          id: string
          is_banned: boolean | null
          is_email_verified: boolean | null
          is_phone_verified: boolean | null
          is_vat_verified: boolean | null
          languages: string[] | null
          last_active_at: string | null
          neighborhood: string | null
          notification_preferences: Json | null
          payment_methods: string[] | null
          phone: string | null
          phone_verified_at: string | null
          portfolio: Json | null
          preferred_contact: string | null
          services: Json | null
          preferred_language: string | null
          preferred_notification_channel: string | null
          privacy_settings: Json | null
          professional_title: string | null
          profile_views: number | null
          response_time_hours: number | null
          service_area_cities: string[] | null
          service_categories: string[] | null
          tasks_completed: number | null
          telegram_first_name: string | null
          telegram_id: number | null
          telegram_last_name: string | null
          telegram_photo_url: string | null
          telegram_username: string | null
          total_earnings_bgn: number | null
          total_reviews: number | null
          total_spent_bgn: number | null
          updated_at: string | null
          user_type: string | null
          vat_number: string | null
          vat_verified_at: string | null
          weekday_hours: Json | null
          weekend_hours: Json | null
          years_experience: number | null
        }
        Insert: {
          acceptance_rate?: number | null
          availability_status?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          email_verified_at?: string | null
          full_name?: string | null
          hourly_rate_bgn?: number | null
          id?: string
          is_banned?: boolean | null
          is_email_verified?: boolean | null
          is_phone_verified?: boolean | null
          is_vat_verified?: boolean | null
          languages?: string[] | null
          last_active_at?: string | null
          neighborhood?: string | null
          notification_preferences?: Json | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_verified_at?: string | null
          portfolio?: Json | null
          preferred_contact?: string | null
          services?: Json | null
          preferred_language?: string | null
          preferred_notification_channel?: string | null
          privacy_settings?: Json | null
          professional_title?: string | null
          profile_views?: number | null
          response_time_hours?: number | null
          service_area_cities?: string[] | null
          service_categories?: string[] | null
          tasks_completed?: number | null
          telegram_first_name?: string | null
          telegram_id?: number | null
          telegram_last_name?: string | null
          telegram_photo_url?: string | null
          telegram_username?: string | null
          total_earnings_bgn?: number | null
          total_reviews?: number | null
          total_spent_bgn?: number | null
          updated_at?: string | null
          user_type?: string | null
          vat_number?: string | null
          vat_verified_at?: string | null
          weekday_hours?: Json | null
          weekend_hours?: Json | null
          years_experience?: number | null
        }
        Update: {
          acceptance_rate?: number | null
          availability_status?: string | null
          avatar_url?: string | null
          average_rating?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          email_verified_at?: string | null
          full_name?: string | null
          hourly_rate_bgn?: number | null
          id?: string
          is_banned?: boolean | null
          is_email_verified?: boolean | null
          is_phone_verified?: boolean | null
          is_vat_verified?: boolean | null
          languages?: string[] | null
          last_active_at?: string | null
          neighborhood?: string | null
          notification_preferences?: Json | null
          payment_methods?: string[] | null
          phone?: string | null
          phone_verified_at?: string | null
          portfolio?: Json | null
          preferred_contact?: string | null
          services?: Json | null
          preferred_language?: string | null
          preferred_notification_channel?: string | null
          privacy_settings?: Json | null
          professional_title?: string | null
          profile_views?: number | null
          response_time_hours?: number | null
          service_area_cities?: string[] | null
          service_categories?: string[] | null
          tasks_completed?: number | null
          telegram_first_name?: string | null
          telegram_id?: number | null
          telegram_last_name?: string | null
          telegram_photo_url?: string | null
          telegram_username?: string | null
          total_earnings_bgn?: number | null
          total_reviews?: number | null
          total_spent_bgn?: number | null
          updated_at?: string | null
          user_type?: string | null
          vat_number?: string | null
          vat_verified_at?: string | null
          weekday_hours?: Json | null
          weekend_hours?: Json | null
          years_experience?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_applications_count: {
        Args: { task_id: string }
        Returns: undefined
      }
      has_applied_to_task: { Args: { task_id_param: string }; Returns: boolean }
      increment_applications_count: {
        Args: { task_id: string }
        Returns: undefined
      }
      is_task_owner: { Args: { task_id_param: string }; Returns: boolean }
      recalculate_applications_count: {
        Args: { task_id: string }
        Returns: number
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
