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
      fitness_plans: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          plan_data: Json
          plan_type: string
          target_calories: number | null
          target_protein: number | null
          tdee: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          plan_data: Json
          plan_type: string
          target_calories?: number | null
          target_protein?: number | null
          tdee?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          plan_data?: Json
          plan_type?: string
          target_calories?: number | null
          target_protein?: number | null
          tdee?: number | null
          user_id?: string
        }
        Relationships: []
      }
      gym_checkins: {
        Row: {
          ai_comment: string | null
          ai_is_gym: boolean | null
          created_at: string
          date: string
          id: string
          photo_url: string
          user_id: string
        }
        Insert: {
          ai_comment?: string | null
          ai_is_gym?: boolean | null
          created_at?: string
          date: string
          id?: string
          photo_url: string
          user_id: string
        }
        Update: {
          ai_comment?: string | null
          ai_is_gym?: boolean | null
          created_at?: string
          date?: string
          id?: string
          photo_url?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          created_at: string | null
          id: string
          items: Json
          meal_date: string
          meal_type: string
          total_calories: number
          total_protein: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          items: Json
          meal_date: string
          meal_type: string
          total_calories: number
          total_protein: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          items?: Json
          meal_date?: string
          meal_type?: string
          total_calories?: number
          total_protein?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number
          created_at: string | null
          dietary_preference: string
          experience: string
          gender: string
          goal: string
          height: number
          id: string
          updated_at: string | null
          user_id: string
          weight: number
        }
        Insert: {
          age: number
          created_at?: string | null
          dietary_preference: string
          experience: string
          gender: string
          goal: string
          height: number
          id?: string
          updated_at?: string | null
          user_id: string
          weight: number
        }
        Update: {
          age?: number
          created_at?: string | null
          dietary_preference?: string
          experience?: string
          gender?: string
          goal?: string
          height?: number
          id?: string
          updated_at?: string | null
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      weekly_insights: {
        Row: {
          created_at: string | null
          id: string
          insights: Json
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          insights: Json
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          insights?: Json
          user_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string | null
          id: string
          log_date: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_date: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string | null
          id?: string
          log_date?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          completed: boolean | null
          created_at: string | null
          exercises: Json
          id: string
          notes: string | null
          user_id: string
          workout_date: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          exercises: Json
          id?: string
          notes?: string | null
          user_id: string
          workout_date: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          exercises?: Json
          id?: string
          notes?: string | null
          user_id?: string
          workout_date?: string
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
