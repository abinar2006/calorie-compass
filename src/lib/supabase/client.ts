import { createBrowserClient } from '@supabase/ssr';
import { Database } from './types';

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    anonKey &&
    !url.includes('placeholder') &&
    !anonKey.includes('placeholder') &&
    url.startsWith('https://')
  );
}

export function createClient() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  supabaseClient = createBrowserClient<Database>(url, anonKey);
  return supabaseClient;
}
