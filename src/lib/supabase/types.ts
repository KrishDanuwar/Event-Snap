// src/lib/supabase/types.ts
// Generated TypeScript types matching Supabase schema
// TODO: Phase 1 — Replace with auto-generated types from Supabase CLI

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          name: string;
          welcome_message: string | null;
          expires_at: string;
          max_guests: number | null;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          logo_path: string | null;
          theme: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          name: string;
          welcome_message?: string | null;
          expires_at: string;
          max_guests?: number | null;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          logo_path?: string | null;
          theme?: Record<string, unknown>;
        };
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      guests: {
        Row: {
          id: string;
          event_id: string;
          display_name: string;
          session_token: string;
          photo_count: number;
          consented_at: string | null;
          joined_at: string;
          is_removed: boolean;
        };
        Insert: {
          id?: string;
          event_id: string;
          display_name: string;
          session_token: string;
          photo_count?: number;
          consented_at?: string | null;
          joined_at?: string;
          is_removed?: boolean;
        };
        Update: Partial<Database['public']['Tables']['guests']['Insert']>;
      };
      photos: {
        Row: {
          id: string;
          event_id: string;
          guest_id: string;
          storage_path: string;
          file_size_bytes: number | null;
          width: number | null;
          height: number | null;
          is_deleted: boolean;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          guest_id: string;
          storage_path: string;
          file_size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          is_deleted?: boolean;
          uploaded_at?: string;
        };
        Update: Partial<Database['public']['Tables']['photos']['Insert']>;
      };
    };
  };
}
