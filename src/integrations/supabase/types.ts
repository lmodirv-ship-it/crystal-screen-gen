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
      audit_logs: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          car_id: string
          created_at: string
          customer_id: string
          end_date: string
          id: string
          notes: string | null
          ref: number
          start_date: string
          status: string
          total: number
        }
        Insert: {
          car_id: string
          created_at?: string
          customer_id: string
          end_date: string
          id?: string
          notes?: string | null
          ref?: number
          start_date: string
          status?: string
          total?: number
        }
        Update: {
          car_id?: string
          created_at?: string
          customer_id?: string
          end_date?: string
          id?: string
          notes?: string | null
          ref?: number
          start_date?: string
          status?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookings_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          category: string
          created_at: string
          fuel: string
          id: string
          insurance_expiry: string | null
          mileage: number
          model: string
          plate: string
          price_per_day: number
          status: string
          transmission: string
          year: number
        }
        Insert: {
          category?: string
          created_at?: string
          fuel?: string
          id?: string
          insurance_expiry?: string | null
          mileage?: number
          model: string
          plate: string
          price_per_day?: number
          status?: string
          transmission?: string
          year?: number
        }
        Update: {
          category?: string
          created_at?: string
          fuel?: string
          id?: string
          insurance_expiry?: string | null
          mileage?: number
          model?: string
          plate?: string
          price_per_day?: number
          status?: string
          transmission?: string
          year?: number
        }
        Relationships: []
      }
      contracts: {
        Row: {
          booking_id: string | null
          car_id: string
          created_at: string
          customer_id: string
          daily_rate: number
          deposit: number
          end_date: string
          id: string
          mileage_out: number | null
          notes: string | null
          ref: number
          start_date: string
          status: string
          total: number
        }
        Insert: {
          booking_id?: string | null
          car_id: string
          created_at?: string
          customer_id: string
          daily_rate: number
          deposit?: number
          end_date: string
          id?: string
          mileage_out?: number | null
          notes?: string | null
          ref?: number
          start_date: string
          status?: string
          total: number
        }
        Update: {
          booking_id?: string | null
          car_id?: string
          created_at?: string
          customer_id?: string
          daily_rate?: number
          deposit?: number
          end_date?: string
          id?: string
          mileage_out?: number | null
          notes?: string | null
          ref?: number
          start_date?: string
          status?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "contracts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          license_expiry: string | null
          license_no: string | null
          phone: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          license_expiry?: string | null
          license_no?: string | null
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          license_expiry?: string | null
          license_no?: string | null
          phone?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          car_id: string | null
          contract_id: string | null
          created_at: string
          customer_id: string | null
          doc_type: string
          file_path: string
          id: string
          status: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          car_id?: string | null
          contract_id?: string | null
          created_at?: string
          customer_id?: string | null
          doc_type?: string
          file_path: string
          id?: string
          status?: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          car_id?: string | null
          contract_id?: string | null
          created_at?: string
          customer_id?: string | null
          doc_type?: string
          file_path?: string
          id?: string
          status?: string
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          car_id: string | null
          category: string
          created_at: string
          id: string
          label: string
          spent_at: string
        }
        Insert: {
          amount: number
          car_id?: string | null
          category?: string
          created_at?: string
          id?: string
          label: string
          spent_at?: string
        }
        Update: {
          amount?: number
          car_id?: string | null
          category?: string
          created_at?: string
          id?: string
          label?: string
          spent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance: {
        Row: {
          car_id: string
          cost: number
          created_at: string
          id: string
          mileage: number | null
          scheduled_at: string
          status: string
          type: string
        }
        Insert: {
          car_id: string
          cost?: number
          created_at?: string
          id?: string
          mileage?: number | null
          scheduled_at?: string
          status?: string
          type: string
        }
        Update: {
          car_id?: string
          cost?: number
          created_at?: string
          id?: string
          mileage?: number | null
          scheduled_at?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          customer_id: string | null
          id: string
          is_read: boolean
          kind: string
          priority: string
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          is_read?: boolean
          kind?: string
          priority?: string
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          is_read?: boolean
          kind?: string
          priority?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string
          customer_id: string
          id: string
          method: string
          note: string | null
          paid_at: string
          ref: number
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          method?: string
          note?: string | null
          paid_at?: string
          ref?: number
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          method?: string
          note?: string | null
          paid_at?: string
          ref?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      role_logins: {
        Row: {
          created_at: string
          display_email: string
          id: string
          login_email: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          display_email: string
          id?: string
          login_email: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          display_email?: string
          id?: string
          login_email?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      my_customer_id: { Args: never; Returns: string }
      my_display_email: { Args: never; Returns: string }
      resolve_role_login: {
        Args: { p_email: string; p_password: string }
        Returns: {
          login: string
          login_role: Database["public"]["Enums"]["app_role"]
        }[]
      }
    }
    Enums: {
      app_role:
        | "developer"
        | "owner"
        | "manager"
        | "operator"
        | "accountant"
        | "customer"
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
    Enums: {
      app_role: [
        "developer",
        "owner",
        "manager",
        "operator",
        "accountant",
        "customer",
      ],
    },
  },
} as const
