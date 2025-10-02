import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient<any> | null = null;

export function initSupabase(url: string, key: string): SupabaseClient<any> {
  if (!url || !key) {
    throw new Error('Supabase URL and key are required');
  }

  supabaseClient = createClient<any>(url, key, {
    auth: {
      persistSession: false,
    },
  });

  return supabaseClient;
}

export function getSupabase(): SupabaseClient<any> {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call initSupabase() first.');
  }
  return supabaseClient;
}