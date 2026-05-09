// ============================================
// SOP Agent Pro - TypeScript Types
// ============================================
export type UserRole = 'owner' | 'editor' | 'team';

export interface WhoKeyData {
  key: string;
  role: UserRole;
  label: string;
  is_active: boolean;
  created_at: string;
}

export interface AppSettings {
  id: string;
  tool_active: boolean;
  sop_lockdown: boolean;
  anthropic_api_key: string | null;
  updated_at: string;
}

export interface SOP {
  id: string;
  title: string;
  content: string;
  category: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HistoryItem {
  id: string;
  license_key: string;
  role: UserRole;
  label: string;
  user_tag: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  key: string | null;
  role: UserRole | null;
  label: string | null;
  isLoading: boolean;
}

export interface HealthStatus {
  supabase: boolean;
  anthropic: boolean;
  sops_loaded: number;
  last_check: string;
}

export interface TrainingExample {
  id: number;
  category: string;
  user: string;
  expected: string;
  sop_title: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  owner: [
    'ask_agent', 'manage_sops', 'browse_sops', 'view_history',
    'clear_own_history', 'clear_all_history', 'view_all_history',
    'view_diagnostics', 'view_ai_training', 'manage_licenses',
    'owner_toggles', 'dark_mode', 'reset_tool', 'export_data',
  ],
  editor: [
    'ask_agent', 'manage_sops', 'browse_sops', 'view_history',
    'clear_own_history', 'dark_mode',
  ],
  team: ['ask_agent', 'browse_sops', 'dark_mode'],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function parseKey(key: string): { role: UserRole; brokerage: string } | null {
  if (!key || key.length < 10) return null;
  if (key.startsWith('RK-ADMIN-')) return { role: 'owner', brokerage: 'admin' };
  if (key.startsWith('SOP-EDIT-')) {
    const parts = key.split('-');
    return { role: 'editor', brokerage: parts[2] || 'default' };
  }
  if (key.startsWith('SOP-TEAM-')) {
    const parts = key.split('-');
    return { role: 'team', brokerage: parts[2] || 'default' };
  }
  return null;
}
