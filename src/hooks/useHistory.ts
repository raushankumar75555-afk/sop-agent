// ============================================
// SOP Agent Pro - History Hook
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { HistoryItem } from '@/types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setHistory(data || []);
    } catch {
      // Fallback
      try {
        const local = JSON.parse(localStorage.getItem('sop_agent_v6_history') || '[]');
        setHistory(local);
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  }, []);

  const addHistory = useCallback(async (item: Omit<HistoryItem, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase.from('history').insert(item);
      if (error) throw error;
    } catch {
      // Fallback to localStorage
      try {
        const local = JSON.parse(localStorage.getItem('sop_agent_v6_history') || '[]');
        local.unshift({ ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        localStorage.setItem('sop_agent_v6_history', JSON.stringify(local.slice(0, 200)));
      } catch { /* ignore */ }
    }
  }, []);

  const clearHistory = useCallback(async (keyFilter?: string) => {
    try {
      let query = supabase.from('history').delete();
      if (keyFilter) query = query.eq('license_key', keyFilter);
      const { error } = await query;
      if (error) throw error;
      await fetchHistory();
      return true;
    } catch {
      // Fallback
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
  }, [fetchHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, refresh: fetchHistory, addHistory, clearHistory };
}
