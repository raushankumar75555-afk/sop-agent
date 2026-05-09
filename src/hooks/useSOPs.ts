// ============================================
// SOP Agent Pro - SOPs Data Hook
// Filtered by brokerage for data isolation
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/hooks/useAuth';
import type { SOP } from '@/types';

export function useSOPs() {
  const [sops, setSops] = useState<SOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = useAuthStore((s) => s.role);
  const brokerage = useAuthStore((s) => s.brokerage);

  const fetchSOPs = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('sops').select('*').order('updated_at', { ascending: false });
      if (role !== 'owner') {
        query = query.eq('brokerage', brokerage || 'OWNER');
      }
      const { data, error } = await query;
      if (error) throw error;
      setSops(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SOPs');
      try {
        const local = localStorage.getItem('sop_agent_v6_sops');
        if (local) setSops(JSON.parse(local));
      } catch { }
    } finally {
      setLoading(false);
    }
  }, [role, brokerage]);

  const saveSOP = useCallback(async (sop: Partial<SOP>) => {
    try {
      if (sop.id) {
        const { error } = await supabase.from('sops').update({
          title: sop.title,
          content: sop.content,
          category: sop.category,
          updated_at: new Date().toISOString(),
        }).eq('id', sop.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('sops').insert({
          title: sop.title,
          content: sop.content,
          category: sop.category || 'General',
          created_by: 'SOP Editor',
          brokerage: role === 'owner' ? 'OWNER' : (brokerage || 'OWNER'),
        });
        if (error) throw error;
      }
      await fetchSOPs();
      return true;
    } catch {
      return false;
    }
  }, [fetchSOPs, role, brokerage]);

  const deleteSOP = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('sops').delete().eq('id', id);
      if (error) throw error;
      await fetchSOPs();
      return true;
    } catch {
      return false;
    }
  }, [fetchSOPs]);

  useEffect(() => {
    fetchSOPs();
  }, [fetchSOPs]);

  return { sops, loading, error, refresh: fetchSOPs, saveSOP, deleteSOP };
}
