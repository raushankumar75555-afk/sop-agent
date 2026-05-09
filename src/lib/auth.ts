// ============================================
// SOP Agent Pro - Auth Logic (WhoKey)
// ============================================
import { parseKey, type UserRole } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEY = 'sop_agent_v6_key';
const STORAGE_NAME = 'sop_agent_v6_name';

export function storeKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
}
export function getStoredKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}
export function clearKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}
export function storeName(tag: string): void {
  localStorage.setItem(STORAGE_NAME, tag);
}
export function getStoredName(): string | null {
  return localStorage.getItem(STORAGE_NAME);
}
export function clearName(): void {
  localStorage.removeItem(STORAGE_NAME);
}
export function generateUserTag(name: string): string {
  const clean = name.trim().split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'User';
  const uid = Math.floor(1000 + Math.random() * 9000);
  return `${clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase()}#${uid}`;
}

export async function validateKey(key: string): Promise<{
  valid: boolean;
  role?: UserRole;
  label?: string;
  error?: string;
}> {
  const parsed = parseKey(key);
  if (!parsed) return { valid: false, error: 'Invalid key format.' };
  if (!isSupabaseConfigured()) {
    return {
      valid: true,
      role: parsed.role,
      label: parsed.role === 'owner' ? 'Owner' : parsed.role === 'editor' ? 'SOP Editor' : 'Team Member',
    };
  }
  try {
    const { data, error } = await supabase
      .from('licenses').select('*').eq('key', key).eq('is_active', true).single();
    if (error || !data) return { valid: false, error: 'Key not found or inactive. Contact your Owner.' };
    return { valid: true, role: data.role as UserRole, label: data.label || '' };
  } catch {
    return { valid: true, role: parsed.role, label: '' };
  }
}

export async function checkToolStatus(): Promise<{ active: boolean; lockdown: boolean }> {
  try {
    const { data } = await supabase.from('settings').select('*').single();
    return { active: data?.tool_active ?? true, lockdown: data?.sop_lockdown ?? false };
  } catch {
    return { active: true, lockdown: false };
  }
}

export function generateKey(role: UserRole, brokerage: string = 'BROKERAGE'): string {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  switch (role) {
    case 'owner': return `RK-ADMIN-2026-${random}`;
    case 'editor': return `SOP-EDIT-${brokerage}-${random}`;
    case 'team': return `SOP-TEAM-${brokerage}-${random}`;
  }
}
