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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          business_id: string | null
          created_at: string
          device_type: string | null
          event_type: Database["public"]["Enums"]["analytics_event_type"]
          id: string
          metadata: Json | null
          path: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          device_type?: string | null
          event_type: Database["public"]["Enums"]["analytics_event_type"]
          id?: string
          metadata?: Json | null
          path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: Database["public"]["Enums"]["analytics_event_type"]
          id?: string
          metadata?: Json | null
          path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          category: string
          category_id: string
          city: string | null
          city_id: string | null
          created_at: string
          description: string | null
          facebook: string | null
          gallery: string[]
          highlight: boolean
          hours: string | null
          id: string
          image_url: string | null
          instagram: string | null
          latitude: number | null
          longitude: number | null
          meta_description: string | null
          name: string
          neighborhood: string | null
          neighborhood_id: string | null
          opening_hours: Json | null
          owner_id: string
          phone: string | null
          place_id: string | null
          rating: number | null
          rating_count: number | null
          slug: string | null
          source: string
          status: Database["public"]["Enums"]["business_status"]
          tags: string[]
          tier: Database["public"]["Enums"]["business_tier"]
          updated_at: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          category: string
          category_id: string
          city?: string | null
          city_id?: string | null
          created_at?: string
          description?: string | null
          facebook?: string | null
          gallery?: string[]
          highlight?: boolean
          hours?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          name: string
          neighborhood?: string | null
          neighborhood_id?: string | null
          opening_hours?: Json | null
          owner_id: string
          phone?: string | null
          place_id?: string | null
          rating?: number | null
          rating_count?: number | null
          slug?: string | null
          source?: string
          status?: Database["public"]["Enums"]["business_status"]
          tags?: string[]
          tier?: Database["public"]["Enums"]["business_tier"]
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          category_id?: string
          city?: string | null
          city_id?: string | null
          created_at?: string
          description?: string | null
          facebook?: string | null
          gallery?: string[]
          highlight?: boolean
          hours?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          name?: string
          neighborhood?: string | null
          neighborhood_id?: string | null
          opening_hours?: Json | null
          owner_id?: string
          phone?: string | null
          place_id?: string | null
          rating?: number | null
          rating_count?: number | null
          slug?: string | null
          source?: string
          status?: Database["public"]["Enums"]["business_status"]
          tags?: string[]
          tier?: Database["public"]["Enums"]["business_tier"]
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          emoji: string | null
          icon_url: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          emoji?: string | null
          icon_url?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          emoji?: string | null
          icon_url?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
          uf: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          uf?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          uf?: string
          updated_at?: string
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          city: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          city?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          business_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      analytics_event_type:
        | "page_view"
        | "business_view"
        | "whatsapp_click"
        | "phone_click"
        | "map_click"
        | "favorite_add"
        | "share_click"
        | "category_click"
        | "search"
      app_role: "admin" | "owner" | "user"
      business_status: "pending" | "approved" | "rejected"
      business_tier: "basic" | "featured" | "premium"
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
      analytics_event_type: [
        "page_view",
        "business_view",
        "whatsapp_click",
        "phone_click",
        "map_click",
        "favorite_add",
        "share_click",
        "category_click",
        "search",
      ],
      app_role: ["admin", "owner", "user"],
      business_status: ["pending", "approved", "rejected"],
      business_tier: ["basic", "featured", "premium"],
    },
  },
} as const
