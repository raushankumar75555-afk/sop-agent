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
    // Auto-structure the content using AI before saving
    let structuredContent = sop.content || '';
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are an SOP formatter. Take this raw SOP content and rewrite it as a single connected procedure. 
Rules:
- Add "Procedure (follow all steps):" as the first line
- Number each step clearly
- Connect related steps with "If/Then" language
- Add a "Note:" at the end listing any conditions or exceptions
- Keep the original meaning exactly, just improve structure
- Return ONLY the formatted SOP, nothing else

Raw SOP:
Title: ${sop.title}
${sop.content}`
          }]
        })
      });
      const data = await res.json();
      if (data.content?.[0]?.text) {
        structuredContent = data.content[0].text;
      }
    } catch {
      // If AI structuring fails, save original content
      structuredContent = sop.content || '';
    }

    if (sop.id) {
      const { error } = await supabase.from('sops').update({
        title: sop.title,
        content: structuredContent,
        category: sop.category,
        updated_at: new Date().toISOString(),
      }).eq('id', sop.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('sops').insert({
        title: sop.title,
        content: structuredContent,
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
