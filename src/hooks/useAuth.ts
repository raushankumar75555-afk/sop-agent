// ============================================
// SOP Agent Pro - Auth Hook
// ============================================
import { create } from 'zustand';
import { useEffect } from 'react';
import type { AuthState } from '@/types';
import {
  getStoredKey, storeKey, clearKey,
  validateKey, checkToolStatus,
  storeName, getStoredName, clearName, generateUserTag,
} from '@/lib/auth';

interface AuthStore extends AuthState {
  toolActive: boolean;
  sopLockdown: boolean;
  userName: string | null;
  login: (key: string, name?: string) => Promise<boolean>;
  logout: () => void;
  checkStatus: () => Promise<void>;
  setToolActive: (active: boolean) => void;
  setSopLockdown: (lock: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  key: null,
  role: null,
  label: null,
  userName: null,
  isLoading: true,
  toolActive: true,
  sopLockdown: false,

  login: async (key: string, name?: string) => {
    const result = await validateKey(key);
    if (result.valid && result.role) {
      storeKey(key);
      const tag = generateUserTag(name || 'User');
      storeName(tag);
      const status = await checkToolStatus();
      set({
        isAuthenticated: true,
        key,
        role: result.role,
        label: result.label || '',
        userName: tag,
        toolActive: status.active,
        sopLockdown: status.lockdown,
        isLoading: false,
      });
      return true;
    }
    return false;
  },

  logout: () => {
    clearKey();
    clearName();
    set({ isAuthenticated: false, key: null, role: null, label: null, userName: null, isLoading: false });
  },

  checkStatus: async () => {
    const status = await checkToolStatus();
    set({ toolActive: status.active, sopLockdown: status.lockdown });
  },

  setToolActive: (active: boolean) => set({ toolActive: active }),
  setSopLockdown: (lock: boolean) => set({ sopLockdown: lock }),
}));

export function useAuthInit() {
  const store = useAuthStore();
  useEffect(() => {
    const init = async () => {
      const stored = getStoredKey();
      const storedName = getStoredName();
      if (stored) {
        const result = await validateKey(stored);
        if (result.valid && result.role) {
          const status = await checkToolStatus();
          useAuthStore.setState({
            isAuthenticated: true,
            key: stored,
            role: result.role,
            label: result.label || '',
            userName: storedName || 'User#0000',
            toolActive: status.active,
            sopLockdown: status.lockdown,
            isLoading: false,
          });
        } else {
          useAuthStore.setState({ isLoading: false });
        }
      } else {
        useAuthStore.setState({ isLoading: false });
      }
    };
    init();
  }, []);
  return store;
}
