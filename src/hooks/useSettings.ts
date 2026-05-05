// ============================================
// SOP Agent Pro - Settings Hook
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AppSettings } from '@/types';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch {
      // Default settings
      setSettings({
        id: 'default',
        tool_active: true,
        sop_lockdown: false,
        anthropic_api_key: null,
        updated_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    try {
      const { error } = await supabase
        .from('settings')
        .update(partial)
        .eq('id', settings?.id || 'default');
      if (error) throw error;
      await fetchSettings();
      return true;
    } catch {
      return false;
    }
  }, [settings, fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { settings, loading, refresh: fetchSettings, updateSettings };
}
