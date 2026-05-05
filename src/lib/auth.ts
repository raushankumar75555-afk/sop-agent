// ============================================
// SOP Agent Pro - Auth Logic (WhoKey)
// No passwords. Key IS identity.
// ============================================
import { parseKey, type UserRole } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'sop_agent_v6_key';

export function storeKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
}

export function getStoredKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function clearKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function validateKey(key: string): Promise<{
  valid: boolean;
  role?: UserRole;
  label?: string;
  error?: string;
}> {
  const parsed = parseKey(key);
  if (!parsed) {
    return { valid: false, error: 'Invalid key format. Keys must start with RK-ADMIN-, SOP-EDIT-, or SOP-TEAM-' };
  }

  // If Supabase is not configured, accept valid-format keys (demo mode)
  if (!isSupabaseConfigured()) {
    return {
      valid: true,
      role: parsed.role,
      label: parsed.role === 'owner' ? 'Owner' : parsed.role === 'editor' ? 'SOP Editor' : 'Team Member',
    };
  }

  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('key', key)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Key not found or inactive. Contact your Owner.' };
    }

    return {
      valid: true,
      role: data.role as UserRole,
      label: data.label || '',
    };
  } catch {
    // Offline mode: accept valid-format keys
    return {
      valid: true,
      role: parsed.role,
      label: '',
    };
  }
}

export async function checkToolStatus(): Promise<{
  active: boolean;
  lockdown: boolean;
  ownerKey?: string;
}> {
  try {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .single();

    return {
      active: data?.tool_active ?? true,
      lockdown: data?.sop_lockdown ?? false,
    };
  } catch {
    return { active: true, lockdown: false };
  }
}

export function generateKey(role: UserRole, brokerage: string = 'BROKERAGE'): string {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  switch (role) {
    case 'owner':
      return `RK-ADMIN-2026-${random}`;
    case 'editor':
      return `SOP-EDIT-${brokerage}-${random}`;
    case 'team':
      return `SOP-TEAM-${brokerage}-${random}`;
  }
}
