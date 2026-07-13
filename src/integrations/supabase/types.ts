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
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: number
          meta: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: number
          meta?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: number
          meta?: Json | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          reading_time: number | null
          scheduled_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          archived: boolean
          created_at: string
          email: string
          id: string
          is_spam: boolean
          labels: string[]
          message: string
          name: string
          notes: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          email: string
          id?: string
          is_spam?: boolean
          labels?: string[]
          message: string
          name: string
          notes?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          email?: string
          id?: string
          is_spam?: boolean
          labels?: string[]
          message?: string
          name?: string
          notes?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          kind: string | null
          logo: string | null
          period: string | null
          role: string
          sort_order: number
          start_date: string | null
          tech: string[]
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          kind?: string | null
          logo?: string | null
          period?: string | null
          role: string
          sort_order?: number
          start_date?: string | null
          tech?: string[]
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          kind?: string | null
          logo?: string | null
          period?: string | null
          role?: string
          sort_order?: number
          start_date?: string | null
          tech?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          created_at: string
          folder: string | null
          height: number | null
          id: string
          mime_type: string | null
          name: string
          size_bytes: number | null
          storage_path: string | null
          uploaded_by: string | null
          url: string
          width: number | null
        }
        Insert: {
          created_at?: string
          folder?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          name: string
          size_bytes?: number | null
          storage_path?: string | null
          uploaded_by?: string | null
          url: string
          width?: number | null
        }
        Update: {
          created_at?: string
          folder?: string | null
          height?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          size_bytes?: number | null
          storage_path?: string | null
          uploaded_by?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string
          device: string | null
          id: number
          os: string | null
          path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: number
          os?: string | null
          path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: number
          os?: string | null
          path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          case_study: string | null
          category: string | null
          client_name: string | null
          completion_date: string | null
          created_at: string
          demo_url: string | null
          description: string | null
          featured: boolean
          gallery: string[]
          github_url: string | null
          id: string
          long_description: string | null
          project_duration: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          sort_order: number
          status: string
          tags: string[]
          tech: string[]
          thumbnail: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          case_study?: string | null
          category?: string | null
          client_name?: string | null
          completion_date?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string | null
          featured?: boolean
          gallery?: string[]
          github_url?: string | null
          id?: string
          long_description?: string | null
          project_duration?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          sort_order?: number
          status?: string
          tags?: string[]
          tech?: string[]
          thumbnail?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          case_study?: string | null
          category?: string | null
          client_name?: string | null
          completion_date?: string | null
          created_at?: string
          demo_url?: string | null
          description?: string | null
          featured?: boolean
          gallery?: string[]
          github_url?: string | null
          id?: string
          long_description?: string | null
          project_duration?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          sort_order?: number
          status?: string
          tags?: string[]
          tech?: string[]
          thumbnail?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          downloads: number
          file_type: string | null
          file_url: string
          id: string
          is_current: boolean
          label: string
          version: string | null
        }
        Insert: {
          created_at?: string
          downloads?: number
          file_type?: string | null
          file_url: string
          id?: string
          is_current?: boolean
          label: string
          version?: string | null
        }
        Update: {
          created_at?: string
          downloads?: number
          file_type?: string | null
          file_url?: string
          id?: string
          is_current?: boolean
          label?: string
          version?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          delivery_time: string | null
          description: string | null
          features: string[]
          icon: string | null
          id: string
          price: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          delivery_time?: string | null
          description?: string | null
          features?: string[]
          icon?: string | null
          id?: string
          price?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          delivery_time?: string | null
          description?: string | null
          features?: string[]
          icon?: string | null
          id?: string
          price?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          about: Json
          id: number
          integrations: Json
          navigation: Json
          personal: Json
          seo: Json
          theme: Json
          updated_at: string
        }
        Insert: {
          about?: Json
          id?: number
          integrations?: Json
          navigation?: Json
          personal?: Json
          seo?: Json
          theme?: Json
          updated_at?: string
        }
        Update: {
          about?: Json
          id?: number
          integrations?: Json
          navigation?: Json
          personal?: Json
          seo?: Json
          theme?: Json
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          featured: boolean
          icon: string | null
          id: string
          level: number
          name: string
          sort_order: number
          updated_at: string
          years: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          featured?: boolean
          icon?: string | null
          id?: string
          level?: number
          name: string
          sort_order?: number
          updated_at?: string
          years?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          featured?: boolean
          icon?: string | null
          id?: string
          level?: number
          name?: string
          sort_order?: number
          updated_at?: string
          years?: number | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          approved: boolean
          company: string | null
          created_at: string
          id: string
          name: string
          picture: string | null
          quote: string
          rating: number | null
          role: string | null
          sort_order: number
          updated_at: string
          website: string | null
        }
        Insert: {
          approved?: boolean
          company?: string | null
          created_at?: string
          id?: string
          name: string
          picture?: string | null
          quote: string
          rating?: number | null
          role?: string | null
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          approved?: boolean
          company?: string | null
          created_at?: string
          id?: string
          name?: string
          picture?: string | null
          quote?: string
          rating?: number | null
          role?: string | null
          sort_order?: number
          updated_at?: string
          website?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
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
      app_role: ["admin", "editor", "viewer"],
    },
  },
} as const
