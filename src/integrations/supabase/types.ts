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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      actions: {
        Row: {
          ai_category: string | null
          blockchain_status: string
          category: string
          co2_reduced: number
          created_at: string
          financial_impact: number
          id: string
          impact_value: number
          reward_minted: boolean
          timestamp: string
          tokens_earned: number
          type: string
          user_id: string
        }
        Insert: {
          ai_category?: string | null
          blockchain_status?: string
          category: string
          co2_reduced?: number
          created_at?: string
          financial_impact?: number
          id?: string
          impact_value?: number
          reward_minted?: boolean
          timestamp?: string
          tokens_earned?: number
          type: string
          user_id: string
        }
        Update: {
          ai_category?: string | null
          blockchain_status?: string
          category?: string
          co2_reduced?: number
          created_at?: string
          financial_impact?: number
          id?: string
          impact_value?: number
          reward_minted?: boolean
          timestamp?: string
          tokens_earned?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_id: string
          description: string | null
          earned_at: string
          id: string
          metadata: Json | null
          name: string
          tier: string
          token_id: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          description?: string | null
          earned_at?: string
          id?: string
          metadata?: Json | null
          name: string
          tier?: string
          token_id?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          description?: string | null
          earned_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          tier?: string
          token_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          generated_by: string
          id: string
          text: string
          timestamp: string
          type: string
          user_id: string
        }
        Insert: {
          generated_by?: string
          id?: string
          text: string
          timestamp?: string
          type?: string
          user_id: string
        }
        Update: {
          generated_by?: string
          id?: string
          text?: string
          timestamp?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          eco_score: number
          email: string
          energy_points: number
          fsi_score: number
          id: string
          join_date: string
          level: number
          name: string
          streak: number
          today_tokens: number
          total_tokens: number
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          eco_score?: number
          email?: string
          energy_points?: number
          fsi_score?: number
          id: string
          join_date?: string
          level?: number
          name?: string
          streak?: number
          today_tokens?: number
          total_tokens?: number
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          eco_score?: number
          email?: string
          energy_points?: number
          fsi_score?: number
          id?: string
          join_date?: string
          level?: number
          name?: string
          streak?: number
          today_tokens?: number
          total_tokens?: number
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      proposals: {
        Row: {
          created_at: string
          created_by: string | null
          created_by_name: string | null
          description: string | null
          end_time: string
          id: string
          no_votes: number
          status: string
          text: string
          yes_votes: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          end_time: string
          id?: string
          no_votes?: number
          status?: string
          text: string
          yes_votes?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          description?: string | null
          end_time?: string
          id?: string
          no_votes?: number
          status?: string
          text?: string
          yes_votes?: number
        }
        Relationships: []
      }
      token_logs: {
        Row: {
          action_type: string
          amount: number
          id: string
          nft_issued: boolean
          timestamp: string
          tx_hash: string
          user_id: string
        }
        Insert: {
          action_type?: string
          amount?: number
          id?: string
          nft_issued?: boolean
          timestamp?: string
          tx_hash?: string
          user_id: string
        }
        Update: {
          action_type?: string
          amount?: number
          id?: string
          nft_issued?: boolean
          timestamp?: string
          tx_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          carbon_intensity: number
          category: string
          classification: string
          created_at: string
          date: string
          description: string
          id: string
          user_id: string
        }
        Insert: {
          amount?: number
          carbon_intensity?: number
          category?: string
          classification?: string
          created_at?: string
          date?: string
          description: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          carbon_intensity?: number
          category?: string
          classification?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          proposal_id: string
          user_id: string
          vote: string
          weight: number
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id: string
          user_id: string
          vote: string
          weight?: number
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string
          user_id?: string
          vote?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
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
