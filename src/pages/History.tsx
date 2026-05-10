// ============================================
// SOP Agent Pro - History Hook
// Filtered by brokerage for data isolation
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuth';
import type { HistoryItem } from '@/types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const role = useAuthStore((s) => s.role);
  const key = useAuthStore((s) => s.key);
  const brokerage = useAuthStore((s) => s.brokerage);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (role === 'owner') {
        // Owner sees everything — no filter
      } else if (role === 'editor') {
        // Editor sees only their brokerage's history
        query = query.ilike('license_key', `%-${brokerage}-%`);
      } else {
        // Team member sees only their own key's history
        query = query.eq('license_key', key || '');
      }

      const { data, error } = await query;
      if (error) throw error;
      setHistory(data || []);
    } catch {
      try {
        const local = JSON.parse(localStorage.getItem('sop_agent_v6_history') || '[]');
        setHistory(local);
      } catch { }
    } finally {
      setLoading(false);
    }
  }, [role, key, brokerage]);

  const addHistory = useCallback(async (item: Omit<HistoryItem, 'id' | 'created_at'> & { user_tag?: string }) => {
    try {
      const { error } = await supabase.from('history').insert(item);
      if (error) throw error;
    } catch {
      try {
        const local = JSON.parse(localStorage.getItem('sop_agent_v6_history') || '[]');
        local.unshift({ ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        localStorage.setItem('sop_agent_v6_history', JSON.stringify(local.slice(0, 200)));
      } catch { }
    }
  }, []);

  const clearHistory = useCallback(async (keyFilter?: string) => {
    try {
      let query = supabase.from('history').delete();
      if (keyFilter) {
        query = query.eq('license_key', keyFilter);
      } else if (role === 'editor') {
        // Editor can only clear their brokerage history
        query = query.ilike('license_key', `%-${brokerage}-%`);
      }
      const { error } = await query;
      if (error) throw error;
      await fetchHistory();
      return true;
    } catch {
      try {
        if (keyFilter) {
          const local = JSON.parse(localStorage.getItem('sop_agent_v6_history') || '[]');
          const filtered = local.filter((h: HistoryItem) => h.license_key !== keyFilter);
          localStorage.setItem('sop_agent_v6_history', JSON.stringify(filtered));
        } else {
          localStorage.removeItem('sop_agent_v6_history');
        }
        await fetchHistory();
        return true;
      } catch {
        return false;
      }
    }
  }, [fetchHistory, role, brokerage]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, refresh: fetchHistory, addHistory, clearHistory };
}
