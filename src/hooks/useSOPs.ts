// ============================================
// SOP Agent Pro - SOPs Data Hook
// With audit trail + plain_text for search
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
  const key = useAuthStore((s) => s.key);
  const userName = useAuthStore((s) => s.userName);

  const fetchSOPs = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('sops')
        .select('*')
        .order('updated_at', { ascending: false });

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
      const plainText = buildPlainText(sop.title || '', sop.content || '');
      
      if (sop.id) {
        // Get old values for audit log
        const { data: oldSop } = await supabase
          .from('sops')
          .select('*')
          .eq('id', sop.id)
          .single();

        const { error } = await supabase
          .from('sops')
          .update({
            title: sop.title,
            content: sop.content,
            category: sop.category,
            plain_text: plainText,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sop.id);
        if (error) throw error;

        // Log the change
        await supabase.from('sop_change_log').insert({
          sop_id: sop.id,
          action: 'updated',
          performed_by: userName || key || 'unknown',
          old_title: oldSop?.title,
          old_content: oldSop?.content,
          old_category: oldSop?.category,
          new_title: sop.title,
          new_content: sop.content,
          new_category: sop.category,
        });

      } else {
        const { data, error } = await supabase
          .from('sops')
          .insert({
            title: sop.title,
            content: sop.content,
            category: sop.category || 'General',
            created_by: userName || key || 'SOP Editor',
            brokerage: role === 'owner' ? 'OWNER' : (brokerage || 'OWNER'),
            plain_text: plainText,
          })
          .select()
          .single();
        if (error) throw error;

        // Log creation
        await supabase.from('sop_change_log').insert({
          sop_id: data.id,
          action: 'created',
          performed_by: userName || key || 'unknown',
          new_title: sop.title,
          new_content: sop.content,
          new_category: sop.category,
        });
      }

      await fetchSOPs();
      return true;
    } catch (err) {
      console.error('Save SOP error:', err);
      return false;
    }
  }, [fetchSOPs, role, brokerage, key, userName]);

  const deleteSOP = useCallback(async (id: string) => {
    try {
      // Get SOP details before deleting for audit log
      const { data: sop } = await supabase
        .from('sops')
        .select('*')
        .eq('id', id)
        .single();

      // Log deletion first
      if (sop) {
        await supabase.from('sop_change_log').insert({
          sop_id: id,
          action: 'deleted',
          performed_by: userName || key || 'unknown',
          old_title: sop.title,
          old_content: sop.content,
          old_category: sop.category,
        });
      }

      const { error } = await supabase.from('sops').delete().eq('id', id);
      if (error) throw error;
      await fetchSOPs();
      return true;
    } catch {
      return false;
    }
  }, [fetchSOPs, key, userName]);

  // Semantic search using plain_text full-text search
  const searchSOPs = useCallback(async (query: string): Promise<SOP[]> => {
    try {
      if (!query.trim()) return sops;

      // First try full-text search
      let q = supabase
        .from('sops')
        .select('*')
        .order('updated_at', { ascending: false });

      if (role !== 'owner') {
        q = q.eq('brokerage', brokerage || 'OWNER');
      }

      const { data } = await q;
      if (!data) return [];

      // Client-side fuzzy matching on plain_text + title + content
      const queryLower = query.toLowerCase();
      const keywords = queryLower.split(' ').filter(k => k.length > 2);

      const scored = data.map((sop: SOP) => {
        const text = `${sop.title} ${sop.content} ${sop.category} ${sop.plain_text || ''}`.toLowerCase();
        let score = 0;
        keywords.forEach(kw => {
          if (text.includes(kw)) score += 1;
          if (sop.title.toLowerCase().includes(kw)) score += 2; // Title matches rank higher
        });
        return { sop, score };
      });

      return scored
        .filter((s: { sop: SOP; score: number }) => s.score > 0)
.sort((a: { sop: SOP; score: number }, b: { sop: SOP; score: number }) => b.score - a.score)
.map((s: { sop: SOP; score: number }) => s.sop);
    } catch {
      return sops;
    }
  }, [sops, role, brokerage]);

  useEffect(() => {
    fetchSOPs();
  }, [fetchSOPs]);

  return { sops, loading, error, refresh: fetchSOPs, saveSOP, deleteSOP, searchSOPs };
}

// Build plain text for search indexing
function buildPlainText(title: string, content: string): string {
  return `${title}\n\n${content}`
    .replace(/\s+/g, ' ')
    .trim();
}
