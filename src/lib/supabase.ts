import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const requestedMode = process.env.NEXT_PUBLIC_APP_MODE === 'live' ? 'live' : 'demo';
const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseAnonKey);

export const appMode: 'demo' | 'live' = requestedMode === 'live' && hasSupabaseCredentials
  ? 'live'
  : 'demo';

export const isLiveMode = appMode === 'live';
export const isDemoMode = appMode === 'demo';

let supabase: SupabaseClient;

if (hasSupabaseCredentials) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a dummy client that won't be used (demo mode will be active)
  // This prevents build-time errors when env vars aren't set
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };
export default supabase;
