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
      applications: {
        Row: {
          cover_letter: string
          created_at: string
          email: string
          experience: string
          expertise: string
          full_name: string
          github: string | null
          id: string
          linkedin: string | null
          phone: string
          portfolio: string | null
          status: string | null
        }
        Insert: {
          cover_letter: string
          created_at?: string
          email: string
          experience: string
          expertise: string
          full_name: string
          github?: string | null
          id?: string
          linkedin?: string | null
          phone: string
          portfolio?: string | null
          status?: string | null
        }
        Update: {
          cover_letter?: string
          created_at?: string
          email?: string
          experience?: string
          expertise?: string
          full_name?: string
          github?: string | null
          id?: string
          linkedin?: string | null
          phone?: string
          portfolio?: string | null
          status?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          document_id: string | null
          id: string
          message: string
          response: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          id?: string
          message: string
          response: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          id?: string
          message?: string
          response?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          file_size: number
          file_type: string
          filename: string
          id: string
          is_processed: boolean | null
          original_name: string
          processed_at: string | null
          upload_date: string
          user_id: string
        }
        Insert: {
          content?: string | null
          file_size: number
          file_type: string
          filename: string
          id?: string
          is_processed?: boolean | null
          original_name: string
          processed_at?: string | null
          upload_date?: string
          user_id: string
        }
        Update: {
          content?: string | null
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          is_processed?: boolean | null
          original_name?: string
          processed_at?: string | null
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      driver_profiles: {
        Row: {
          created_at: string
          current_latitude: number | null
          current_longitude: number | null
          id: string
          is_available: boolean | null
          license_number: string
          rating: number | null
          total_deliveries: number | null
          updated_at: string
          user_id: string
          vehicle_model: string | null
          vehicle_plate_number: string | null
          vehicle_type: string
        }
        Insert: {
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_available?: boolean | null
          license_number: string
          rating?: number | null
          total_deliveries?: number | null
          updated_at?: string
          user_id: string
          vehicle_model?: string | null
          vehicle_plate_number?: string | null
          vehicle_type: string
        }
        Update: {
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          is_available?: boolean | null
          license_number?: string
          rating?: number | null
          total_deliveries?: number | null
          updated_at?: string
          user_id?: string
          vehicle_model?: string | null
          vehicle_plate_number?: string | null
          vehicle_type?: string
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          completed_at: string | null
          content: Json | null
          created_at: string
          document_id: string
          id: string
          score: number | null
          session_type: string
          total_questions: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content?: Json | null
          created_at?: string
          document_id: string
          id?: string
          score?: number | null
          session_type: string
          total_questions?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content?: Json | null
          created_at?: string
          document_id?: string
          id?: string
          score?: number | null
          session_type?: string
          total_questions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          display_name: string
          id: string
          is_host: boolean | null
          joined_at: string | null
          left_at: string | null
          meeting_id: string
          user_id: string | null
        }
        Insert: {
          display_name: string
          id?: string
          is_host?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          meeting_id: string
          user_id?: string | null
        }
        Update: {
          display_name?: string
          id?: string
          is_host?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          meeting_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          host_id: string
          id: string
          is_active: boolean | null
          meeting_id: string
          scheduled_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          host_id: string
          id?: string
          is_active?: boolean | null
          meeting_id: string
          scheduled_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          host_id?: string
          id?: string
          is_active?: boolean | null
          meeting_id?: string
          scheduled_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          order_id: string | null
          recipient_id: string
          sender_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          order_id?: string | null
          recipient_id: string
          sender_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          order_id?: string | null
          recipient_id?: string
          sender_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string
          customer_phone: string | null
          delivery_address: string
          delivery_fee: number
          driver_id: string | null
          estimated_delivery_time: string | null
          estimated_prep_time: number | null
          id: string
          items: Json
          payment_method: string | null
          payment_status: string | null
          restaurant_id: string
          special_instructions: string | null
          status: string
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          customer_phone?: string | null
          delivery_address: string
          delivery_fee?: number
          driver_id?: string | null
          estimated_delivery_time?: string | null
          estimated_prep_time?: number | null
          id?: string
          items: Json
          payment_method?: string | null
          payment_status?: string | null
          restaurant_id?: string
          special_instructions?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          customer_phone?: string | null
          delivery_address?: string
          delivery_fee?: number
          driver_id?: string | null
          estimated_delivery_time?: string | null
          estimated_prep_time?: number | null
          id?: string
          items?: Json
          payment_method?: string | null
          payment_status?: string | null
          restaurant_id?: string
          special_instructions?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_name: string
          account_number: string
          created_at: string
          id: string
          is_default: boolean | null
          provider_name: string
          type: string
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          provider_name: string
          type: string
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          provider_name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          order_id: string | null
          payment_method: string
          status: string
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          order_id?: string | null
          payment_method: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          order_id?: string | null
          payment_method?: string
          status?: string
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          ghana_card_number: string | null
          id: string
          phone_number: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          ghana_card_number?: string | null
          id: string
          phone_number?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          ghana_card_number?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_meeting_id: {
        Args: Record<PropertyKey, never>
        Returns: string
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
