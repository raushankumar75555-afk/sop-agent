// ============================================
// SOP Agent Pro - Auth Hook
// ============================================
import { create } from 'zustand';
import { useEffect } from 'react';
import type { AuthState } from '@/types';
import { getStoredKey, storeKey, clearKey, validateKey, checkToolStatus } from '@/lib/auth';

interface AuthStore extends AuthState {
  toolActive: boolean;
  sopLockdown: boolean;
  login: (key: string) => Promise<boolean>;
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
  isLoading: true,
  toolActive: true,
  sopLockdown: false,

  login: async (key: string) => {
    const result = await validateKey(key);
    if (result.valid && result.role) {
      storeKey(key);
      const status = await checkToolStatus();
      set({ 
        isAuthenticated: true, 
        key, 
        role: result.role, 
        label: result.label || '',
        toolActive: status.active,
        sopLockdown: status.lockdown,
        isLoading: false 
      });
      return true;
    }
    return false;
  },

  logout: () => {
    clearKey();
    set({ 
      isAuthenticated: false, 
      key: null, 
      role: null, 
      label: null,
      isLoading: false 
    });
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
      if (stored) {
        await store.login(stored);
      } else {
        useAuthStore.setState({ isLoading: false });
      }
    };
    init();
  }, []);

  return store;
}
