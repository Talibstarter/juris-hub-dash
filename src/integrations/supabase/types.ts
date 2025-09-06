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
            foreignKeyName: "case_processes_assigned_lawyer_id_fkey"
            columns: ["assigned_lawyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          category: string | null
          created_at: string | null
          id: number
          public_case_id: string
          status: Database["public"]["Enums"]["case_status"]
          tags: string[] | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: number
          public_case_id: string
          status?: Database["public"]["Enums"]["case_status"]
          tags?: string[] | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: number
          public_case_id?: string
          status?: Database["public"]["Enums"]["case_status"]
          tags?: string[] | null
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
          author_id: number | null
          category: string | null
          created_at: string | null
          id: number
          is_published: boolean | null
          language: string | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          author_id?: number | null
          category?: string | null
          created_at?: string | null
          id?: never
          is_published?: boolean | null
          language?: string | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          author_id?: number | null
          category?: string | null
          created_at?: string | null
          id?: never
          is_published?: boolean | null
          language?: string | null
          question?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          text: string
          user_id: number | null
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
          text: string
          user_id?: number | null
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
          text?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_answered_by_fkey"
            columns: ["answered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
        Relationships: [
          {
            foreignKeyName: "templates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "user_documents_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          id: number
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
          id?: number
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
          id?: number
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
