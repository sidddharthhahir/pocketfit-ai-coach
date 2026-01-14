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
      buddies: {
        Row: {
          buddy_user_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          buddy_user_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          buddy_user_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      buddy_invites: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invite_code: string
          invitee_id: string | null
          inviter_id: string
          status: Database["public"]["Enums"]["invite_status"]
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invite_code: string
          invitee_id?: string | null
          inviter_id: string
          status?: Database["public"]["Enums"]["invite_status"]
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invite_code?: string
          invitee_id?: string | null
          inviter_id?: string
          status?: Database["public"]["Enums"]["invite_status"]
        }
        Relationships: []
      }
      commitments: {
        Row: {
          created_at: string
          duration_weeks: number
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          target_value: number
          type: Database["public"]["Enums"]["commitment_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_weeks: number
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
          target_value: number
          type: Database["public"]["Enums"]["commitment_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          duration_weeks?: number
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          target_value?: number
          type?: Database["public"]["Enums"]["commitment_type"]
          user_id?: string
        }
        Relationships: []
      }
      dream_logs: {
        Row: {
          ai_interpretation: string | null
          created_at: string
          dream_content: string
          dream_title: string | null
          id: string
          log_date: string
          lucidity_level: number | null
          mood: string | null
          themes: string[] | null
          user_id: string
        }
        Insert: {
          ai_interpretation?: string | null
          created_at?: string
          dream_content: string
          dream_title?: string | null
          id?: string
          log_date: string
          lucidity_level?: number | null
          mood?: string | null
          themes?: string[] | null
          user_id: string
        }
        Update: {
          ai_interpretation?: string | null
          created_at?: string
          dream_content?: string
          dream_title?: string | null
          id?: string
          log_date?: string
          lucidity_level?: number | null
          mood?: string | null
          themes?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
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
      future_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_unlocked: boolean
          mood_at_write: string | null
          reflection_response: string | null
          sleep_quality_at_write: string | null
          tone: string | null
          unlock_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_unlocked?: boolean
          mood_at_write?: string | null
          reflection_response?: string | null
          sleep_quality_at_write?: string | null
          tone?: string | null
          unlock_at: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_unlocked?: boolean
          mood_at_write?: string | null
          reflection_response?: string | null
          sleep_quality_at_write?: string | null
          tone?: string | null
          unlock_at?: string
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
      sleep_logs: {
        Row: {
          bed_time: string | null
          created_at: string
          id: string
          log_date: string
          notes: string | null
          sleep_hours: number
          sleep_quality: string | null
          user_id: string
          wake_time: string | null
        }
        Insert: {
          bed_time?: string | null
          created_at?: string
          id?: string
          log_date: string
          notes?: string | null
          sleep_hours: number
          sleep_quality?: string | null
          user_id: string
          wake_time?: string | null
        }
        Update: {
          bed_time?: string | null
          created_at?: string
          id?: string
          log_date?: string
          notes?: string | null
          sleep_hours?: number
          sleep_quality?: string | null
          user_id?: string
          wake_time?: string | null
        }
        Relationships: []
      }
      vision_board_items: {
        Row: {
          achieved_at: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_achieved: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_achieved?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_achieved?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          log_date: string
          logged_at: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string
          id?: string
          log_date: string
          logged_at?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          log_date?: string
          logged_at?: string
          user_id?: string
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
      generate_invite_code: { Args: never; Returns: string }
      get_buddy_weekly_stats: {
        Args: { target_user_id: string; week_start: string }
        Returns: {
          checkins_count: number
          current_streak: number
          workouts_count: number
        }[]
      }
      lookup_buddy_invite: {
        Args: { p_invite_code: string }
        Returns: {
          expires_at: string
          id: string
          inviter_id: string
        }[]
      }
    }
    Enums: {
      commitment_type:
        | "workouts_per_week"
        | "checkins_per_week"
        | "meals_logged_per_week"
      invite_status: "pending" | "accepted" | "declined" | "expired"
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
      commitment_type: [
        "workouts_per_week",
        "checkins_per_week",
        "meals_logged_per_week",
      ],
      invite_status: ["pending", "accepted", "declined", "expired"],
    },
  },
} as const
