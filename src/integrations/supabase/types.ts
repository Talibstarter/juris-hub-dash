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
      audit_log: {
        Row: {
          actor_id: number | null
          actor_type: string
          case_id: number | null
          created_at: string | null
          data: Json | null
          event: string
          id: number
        }
        Insert: {
          actor_id?: number | null
          actor_type: string
          case_id?: number | null
          created_at?: string | null
          data?: Json | null
          event: string
          id?: number
        }
        Update: {
          actor_id?: number | null
          actor_type?: string
          case_id?: number | null
          created_at?: string | null
          data?: Json | null
          event?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_lookup: {
        Row: {
          active: boolean | null
          case_id: number | null
          id: number
          national_id: string | null
          phone_e164: string | null
        }
        Insert: {
          active?: boolean | null
          case_id?: number | null
          id?: number
          national_id?: string | null
          phone_e164?: string | null
        }
        Update: {
          active?: boolean | null
          case_id?: number | null
          id?: number
          national_id?: string | null
          phone_e164?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_lookup_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_processes: {
        Row: {
          assigned_lawyer_id: number | null
          case_id: number | null
          created_at: string | null
          due_date: string | null
          id: number
          priority: number | null
          process_id: number | null
          status: Database["public"]["Enums"]["case_status"] | null
          updated_at: string | null
        }
        Insert: {
          assigned_lawyer_id?: number | null
          case_id?: number | null
          created_at?: string | null
          due_date?: string | null
          id?: never
          priority?: number | null
          process_id?: number | null
          status?: Database["public"]["Enums"]["case_status"] | null
          updated_at?: string | null
        }
        Update: {
          assigned_lawyer_id?: number | null
          case_id?: number | null
          created_at?: string | null
          due_date?: string | null
          id?: never
          priority?: number | null
          process_id?: number | null
          status?: Database["public"]["Enums"]["case_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_processes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_processes_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          active: boolean | null
          appeal: boolean | null
          application_type: string | null
          biometrics_date: string | null
          category: string | null
          client_name: string | null
          created_at: string | null
          date_of_birth: string | null
          decision: string | null
          expedite_request: boolean | null
          id: number
          inspector: string | null
          notes: string | null
          office: string | null
          payment_amount: number | null
          payment_status: string | null
          phone_e164: string | null
          postal_code: string | null
          public_case_id: string
          review_date: string | null
          status: Database["public"]["Enums"]["case_status"]
          tags: string[] | null
          telegram_id: number | null
          telegram_number: string | null
          type_of_stay: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          active?: boolean | null
          appeal?: boolean | null
          application_type?: string | null
          biometrics_date?: string | null
          category?: string | null
          client_name?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          decision?: string | null
          expedite_request?: boolean | null
          id?: number
          inspector?: string | null
          notes?: string | null
          office?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          phone_e164?: string | null
          postal_code?: string | null
          public_case_id: string
          review_date?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          tags?: string[] | null
          telegram_id?: number | null
          telegram_number?: string | null
          type_of_stay?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          active?: boolean | null
          appeal?: boolean | null
          application_type?: string | null
          biometrics_date?: string | null
          category?: string | null
          client_name?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          decision?: string | null
          expedite_request?: boolean | null
          id?: number
          inspector?: string | null
          notes?: string | null
          office?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          phone_e164?: string | null
          postal_code?: string | null
          public_case_id?: string
          review_date?: string | null
          status?: Database["public"]["Enums"]["case_status"]
          tags?: string[] | null
          telegram_id?: number | null
          telegram_number?: string | null
          type_of_stay?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      documents: {
        Row: {
          case_id: number | null
          created_at: string | null
          id: number
          mime_type: string | null
          original_name: string | null
          size_bytes: number | null
          storage_key: string
          telegram_file_id: string | null
        }
        Insert: {
          case_id?: number | null
          created_at?: string | null
          id?: number
          mime_type?: string | null
          original_name?: string | null
          size_bytes?: number | null
          storage_key: string
          telegram_file_id?: string | null
        }
        Update: {
          case_id?: number | null
          created_at?: string | null
          id?: number
          mime_type?: string | null
          original_name?: string | null
          size_bytes?: number | null
          storage_key?: string
          telegram_file_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      faq: {
        Row: {
          answer: string
          answer_pl: string | null
          answer_ru: string | null
          author_id: number | null
          category: string | null
          created_at: string | null
          id: number
          is_published: boolean | null
          language: string | null
          question: string
          question_pl: string | null
          question_ru: string | null
          updated_at: string | null
        }
        Insert: {
          answer: string
          answer_pl?: string | null
          answer_ru?: string | null
          author_id?: number | null
          category?: string | null
          created_at?: string | null
          id?: never
          is_published?: boolean | null
          language?: string | null
          question: string
          question_pl?: string | null
          question_ru?: string | null
          updated_at?: string | null
        }
        Update: {
          answer?: string
          answer_pl?: string | null
          answer_ru?: string | null
          author_id?: number | null
          category?: string | null
          created_at?: string | null
          id?: never
          is_published?: boolean | null
          language?: string | null
          question?: string
          question_pl?: string | null
          question_ru?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          case_id: number | null
          content: string
          created_at: string | null
          id: number
          is_read: boolean | null
          language: string | null
          message_type: Database["public"]["Enums"]["message_type"] | null
          parent_message_id: number | null
          recipient_id: number | null
          sender_id: number | null
          type: string | null
        }
        Insert: {
          case_id?: number | null
          content: string
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          language?: string | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          parent_message_id?: number | null
          recipient_id?: number | null
          sender_id?: number | null
          type?: string | null
        }
        Update: {
          case_id?: number | null
          content?: string
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          language?: string | null
          message_type?: Database["public"]["Enums"]["message_type"] | null
          parent_message_id?: number | null
          recipient_id?: number | null
          sender_id?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      notes: {
        Row: {
          body: string
          case_id: number | null
          created_at: string | null
          expert_id: number | null
          id: number
          visibility: Database["public"]["Enums"]["visibility"]
        }
        Insert: {
          body: string
          case_id?: number | null
          created_at?: string | null
          expert_id?: number | null
          id?: number
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Update: {
          body?: string
          case_id?: number | null
          created_at?: string | null
          expert_id?: number | null
          id?: number
          visibility?: Database["public"]["Enums"]["visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          created_at: string | null
          id: number
          required_fields: Json | null
          template_text: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          required_fields?: Json | null
          template_text: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: number
          required_fields?: Json | null
          template_text?: string
          type?: string
        }
        Relationships: []
      }
      processes: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_duration_days: number | null
          id: number
          is_active: boolean | null
          name: string
          required_documents: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_duration_days?: number | null
          id?: never
          is_active?: boolean | null
          name: string
          required_documents?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_duration_days?: number | null
          id?: never
          is_active?: boolean | null
          name?: string
          required_documents?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: number | null
          case_id: number | null
          created_at: string | null
          id: number
          lang: string
          status: Database["public"]["Enums"]["question_status"]
          telegram_id: number
          text: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: number | null
          case_id?: number | null
          created_at?: string | null
          id?: number
          lang?: string
          status?: Database["public"]["Enums"]["question_status"]
          telegram_id: number
          text: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: number | null
          case_id?: number | null
          created_at?: string | null
          id?: number
          lang?: string
          status?: Database["public"]["Enums"]["question_status"]
          telegram_id?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_telegram_id_fkey"
            columns: ["telegram_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["telegram_id"]
          },
        ]
      }
      templates: {
        Row: {
          author_id: number | null
          category: string | null
          content: string
          created_at: string | null
          id: number
          is_active: boolean | null
          language: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          author_id?: number | null
          category?: string | null
          content: string
          created_at?: string | null
          id?: never
          is_active?: boolean | null
          language?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          author_id?: number | null
          category?: string | null
          content?: string
          created_at?: string | null
          id?: never
          is_active?: boolean | null
          language?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          case_id: number | null
          comments: string | null
          created_at: string | null
          document_id: number | null
          id: number
          is_required: boolean | null
          reviewed_at: string | null
          reviewer_id: number | null
          status: Database["public"]["Enums"]["document_status"] | null
          updated_at: string | null
        }
        Insert: {
          case_id?: number | null
          comments?: string | null
          created_at?: string | null
          document_id?: number | null
          id?: never
          is_required?: boolean | null
          reviewed_at?: string | null
          reviewer_id?: number | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
        }
        Update: {
          case_id?: number | null
          comments?: string | null
          created_at?: string | null
          document_id?: number | null
          id?: never
          is_required?: boolean | null
          reviewed_at?: string | null
          reviewer_id?: number | null
          status?: Database["public"]["Enums"]["document_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          consent_given_at: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          is_active: boolean | null
          last_name: string | null
          password_hash: string | null
          preferred_lang: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          telegram_id: number
          username: string | null
        }
        Insert: {
          consent_given_at?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          is_active?: boolean | null
          last_name?: string | null
          password_hash?: string | null
          preferred_lang?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          telegram_id: number
          username?: string | null
        }
        Update: {
          consent_given_at?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          is_active?: boolean | null
          last_name?: string | null
          password_hash?: string | null
          preferred_lang?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          telegram_id?: number
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      set_config: {
        Args: { setting_name: string; setting_value: string }
        Returns: undefined
      }
    }
    Enums: {
      case_status:
        | "new"
        | "awaiting_docs"
        | "in_review"
        | "submitted_to_office"
        | "approved"
        | "rejected"
        | "needs_more_info"
        | "archived"
      document_status: "pending" | "approved" | "rejected" | "missing"
      message_type: "text" | "document" | "system"
      question_status: "new" | "assigned" | "answered" | "closed"
      user_role: "lawyer" | "assistant" | "client"
      visibility: "internal" | "user_visible"
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
      case_status: [
        "new",
        "awaiting_docs",
        "in_review",
        "submitted_to_office",
        "approved",
        "rejected",
        "needs_more_info",
        "archived",
      ],
      document_status: ["pending", "approved", "rejected", "missing"],
      message_type: ["text", "document", "system"],
      question_status: ["new", "assigned", "answered", "closed"],
      user_role: ["lawyer", "assistant", "client"],
      visibility: ["internal", "user_visible"],
    },
  },
} as const
