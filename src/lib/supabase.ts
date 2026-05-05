// ============================================
// SOP Agent Pro - Supabase Client
// Gracefully handles missing configuration (demo mode)
// ============================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured = !!supabaseUrl && !!supabaseAnonKey;

const realClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Safe proxy that falls back to empty results when Supabase is not configured
function createSafeProxy(client: any) {
  return new Proxy({} as any, {
    get(_target, prop) {
      if (!client) {
        // Return a chainable mock for demo mode
        const mockChain = () =>
          Promise.resolve({ data: null, error: new Error('Supabase not configured') });
        const mock = new Proxy(mockChain, {
          get() { return mock; },
        });
        return prop === 'then' ? undefined : mock;
      }
      return client[prop];
    },
  });
}

export const supabase = realClient || createSafeProxy(realClient);

export function isSupabaseConfigured(): boolean {
  return isConfigured;
}
