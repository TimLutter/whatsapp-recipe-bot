export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      channels: {
        Row: {
          id: string;
          name: string;
          platform: string;
          wa_selector: string | null;
          frequency: number;
          windows: Json;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          platform: string;
          wa_selector?: string | null;
          frequency: number;
          windows: Json;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          platform?: string;
          wa_selector?: string | null;
          frequency?: number;
          windows?: Json;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      recipes: {
        Row: {
          id: string;
          slug: string;
          title: string;
          teaser: string;
          ingredients: Json;
          steps: Json;
          device: string;
          diet: string[];
          tags: string[];
          lang: string;
          nutritional_info: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          teaser: string;
          ingredients: Json;
          steps: Json;
          device: string;
          diet: string[];
          tags: string[];
          lang?: string;
          nutritional_info?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          teaser?: string;
          ingredients?: Json;
          steps?: Json;
          device?: string;
          diet?: string[];
          tags?: string[];
          lang?: string;
          nutritional_info?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          recipe_id: string;
          type: string;
          storage_path: string;
          public_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          type: string;
          storage_path: string;
          public_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          type?: string;
          storage_path?: string;
          public_url?: string;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          channel_id: string;
          recipe_id: string;
          status: string;
          scheduled_for: string;
          posted_at: string | null;
          retries: number;
          error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          recipe_id: string;
          status: string;
          scheduled_for: string;
          posted_at?: string | null;
          retries?: number;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          channel_id?: string;
          recipe_id?: string;
          status?: string;
          scheduled_for?: string;
          posted_at?: string | null;
          retries?: number;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}