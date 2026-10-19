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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          listing_type: string | null
          page_path: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          listing_type?: string | null
          page_path?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          listing_type?: string | null
          page_path?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          enquiry_type: string
          id: string
          message: string | null
          notes: string | null
          status: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          enquiry_type: string
          id?: string
          message?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          enquiry_type?: string
          id?: string
          message?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_listings: {
        Row: {
          availability_status: string
          chauffeur_available: boolean | null
          created_at: string
          deposit_information: string | null
          fuel_policy: string | null
          id: string
          mileage_limit: string | null
          minimum_duration: string | null
          pickup_delivery_information: string | null
          publication_status: string
          published_at: string | null
          rental_terms: string | null
          self_drive_available: boolean | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          availability_status?: string
          chauffeur_available?: boolean | null
          created_at?: string
          deposit_information?: string | null
          fuel_policy?: string | null
          id?: string
          mileage_limit?: string | null
          minimum_duration?: string | null
          pickup_delivery_information?: string | null
          publication_status?: string
          published_at?: string | null
          rental_terms?: string | null
          self_drive_available?: boolean | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          availability_status?: string
          chauffeur_available?: boolean | null
          created_at?: string
          deposit_information?: string | null
          fuel_policy?: string | null
          id?: string
          mileage_limit?: string | null
          minimum_duration?: string | null
          pickup_delivery_information?: string | null
          publication_status?: string
          published_at?: string | null
          rental_terms?: string | null
          self_drive_available?: boolean | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_listings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_rates: {
        Row: {
          amount: number | null
          billing_period: string | null
          created_at: string
          currency: string
          id: string
          is_active: boolean
          rate_note: string | null
          rate_type: string
          rental_listing_id: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          billing_period?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          rate_note?: string | null
          rate_type: string
          rental_listing_id: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          billing_period?: string | null
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean
          rate_note?: string | null
          rate_type?: string
          rental_listing_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_rates_rental_listing_id_fkey"
            columns: ["rental_listing_id"]
            isOneToOne: false
            referencedRelation: "rental_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_listings: {
        Row: {
          availability_status: string
          created_at: string
          currency: string
          id: string
          price: number | null
          price_visibility: string
          publication_status: string
          published_at: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          availability_status?: string
          created_at?: string
          currency?: string
          id?: string
          price?: number | null
          price_visibility?: string
          publication_status?: string
          published_at?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          availability_status?: string
          created_at?: string
          currency?: string
          id?: string
          price?: number | null
          price_visibility?: string
          publication_status?: string
          published_at?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_listings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: true
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          about_copy: string | null
          about_heading: string | null
          business_address: string | null
          business_email: string | null
          business_name: string
          created_at: string
          default_rental_message: string
          default_sales_message: string
          facebook_url: string | null
          id: boolean
          instagram_url: string | null
          phone_number: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          about_copy?: string | null
          about_heading?: string | null
          business_address?: string | null
          business_email?: string | null
          business_name?: string
          created_at?: string
          default_rental_message?: string
          default_sales_message?: string
          facebook_url?: string | null
          id?: boolean
          instagram_url?: string | null
          phone_number?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          about_copy?: string | null
          about_heading?: string | null
          business_address?: string | null
          business_email?: string | null
          business_name?: string
          created_at?: string
          default_rental_message?: string
          default_sales_message?: string
          facebook_url?: string | null
          id?: boolean
          instagram_url?: string | null
          phone_number?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vehicle_media: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          is_primary: boolean
          media_type: string
          media_url: string | null
          storage_path: string | null
          vehicle_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          media_type: string
          media_url?: string | null
          storage_path?: string | null
          vehicle_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_primary?: boolean
          media_type?: string
          media_url?: string | null
          storage_path?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_media_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          body_type: string | null
          condition: string | null
          created_at: string
          created_by: string | null
          description: string | null
          drivetrain: string | null
          engine_size: string | null
          exterior_colour: string | null
          features: string[]
          fuel_type: string | null
          id: string
          interior_colour: string | null
          make: string
          mileage: number | null
          model: string
          passenger_capacity: number | null
          short_description: string | null
          slug: string
          transmission: string | null
          trim: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          body_type?: string | null
          condition?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          drivetrain?: string | null
          engine_size?: string | null
          exterior_colour?: string | null
          features?: string[]
          fuel_type?: string | null
          id?: string
          interior_colour?: string | null
          make: string
          mileage?: number | null
          model: string
          passenger_capacity?: number | null
          short_description?: string | null
          slug: string
          transmission?: string | null
          trim?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          body_type?: string | null
          condition?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          drivetrain?: string | null
          engine_size?: string | null
          exterior_colour?: string | null
          features?: string[]
          fuel_type?: string | null
          id?: string
          interior_colour?: string | null
          make?: string
          mileage?: number | null
          model?: string
          passenger_capacity?: number | null
          short_description?: string | null
          slug?: string
          transmission?: string | null
          trim?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
