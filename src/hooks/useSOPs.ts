// ============================================
// SOP Agent Pro - SOPs Data Hook
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { SOP } from '@/types';

export function useSOPs() {
  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSOPs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sops')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSops(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SOPs');
      // Fallback: try localStorage
      try {
        const local = localStorage.getItem('sop_agent_v6_sops');
        if (local) setSops(JSON.parse(local));
      } catch { /* ignore */ }
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSOP = useCallback(async (sop: Partial<SOP>) => {
    try {
      if (sop.id) {
        const { error } = await supabase
          .from('sops')
          .update({
            title: sop.title,
            content: sop.content,
            category: sop.category,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sop.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sops')
          .insert({
            title: sop.title,
            content: sop.content,
            category: sop.category || 'General',
            created_by: 'SOP Editor',
          });
        if (error) throw error;
      }
      await fetchSOPs();
      return true;
    } catch (err) {
      // Fallback to localStorage
      try {
        const local = JSON.parse(localStorage.getItem('sop_agent_v6_sops') || '[]');
        if (sop.id) {
          const idx = local.findIndex((s: SOP) => s.id === sop.id);
          if (idx >= 0) local[idx] = { ...local[idx], ...sop, updated_at: new Date().toISOString() };
        } else {
          local.unshift({ ...sop, id: crypto.randomUUID(), created_at: new Date().toISOString() });
        }
        localStorage.setItem('sop_agent_v6_sops', JSON.stringify(local));
        setSops(local);
        return true;
      } catch {
        return false;
      }
    }
  }, [fetchSOPs]);

  const deleteSOP = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('sops').delete().eq('id', id);
      if (error) throw error;
      await fetchSOPs();
      return true;
    } catch {
      // Fallback
      try {
        const local = JSON.parse(localStorage.getItem('sop_agent_v6_sops') || '[]');
        const filtered = local.filter((s: SOP) => s.id !== id);
        localStorage.setItem('sop_agent_v6_sops', JSON.stringify(filtered));
        setSops(filtered);
        return true;
      } catch {
        return false;
      }
    }
  }, [fetchSOPs]);

  useEffect(() => {
    fetchSOPs();
  }, [fetchSOPs]);

  return { sops, loading, error, refresh: fetchSOPs, saveSOP, deleteSOP };
}
