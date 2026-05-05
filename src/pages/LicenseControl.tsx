// ============================================
// SOP Agent Pro - License Control Page
// Owner-only: Create, manage, revoke keys
// ============================================
import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Copy, CheckCircle, Key, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { generateKey } from '@/lib/auth';
import type { WhoKeyData } from '@/types';

export default function LicenseControl() {
  const [keys, setKeys] = useState<WhoKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRole, setNewRole] = useState<'editor' | 'team'>('team');
  const [newLabel, setNewLabel] = useState('');
  const [newBrokerage, setNewBrokerage] = useState('BROKERAGE');
  const [copied, setCopied] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setKeys(data || []);
    } catch {
      // Fallback: load from localStorage
      try {
        const local = JSON.parse(localStorage.getItem('sop_agent_v6_licenses') || '[]');
        setKeys(local);
      } catch {
        setKeys([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    const key = generateKey(newRole, newBrokerage);
    const entry: WhoKeyData = {
      key,
      role: newRole,
      label: newLabel || `${newRole === 'editor' ? 'SOP Editor' : 'Team Member'}`,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('licenses').insert(entry);
      if (error) throw error;
    } catch {
      // Fallback to localStorage
      const local = JSON.parse(localStorage.getItem('sop_agent_v6_licenses') || '[]');
      local.push(entry);
      localStorage.setItem('sop_agent_v6_licenses', JSON.stringify(local));
    }

    setKeys((prev) => [entry, ...prev]);
    setIsCreateOpen(false);
    setNewLabel('');
    setCopied(key);
    setTimeout(() => setCopied(null), 3000);
  };

  const toggleKey = async (key: string, active: boolean) => {
    try {
      const { error } = await supabase.from('licenses').update({ is_active: active }).eq('key', key);
      if (error) throw error;
    } catch {
      // Fallback
      const local = JSON.parse(localStorage.getItem('sop_agent_v6_licenses') || '[]');
      const idx = local.findIndex((k: WhoKeyData) => k.key === key);
      if (idx >= 0) local[idx].is_active = active;
      localStorage.setItem('sop_agent_v6_licenses', JSON.stringify(local));
    }
    setKeys((prev) => prev.map((k) => k.key === key ? { ...k, is_active: active } : k));
  };

  const deleteKey = async (key: string) => {
    if (!confirm('Delete this key? The user will immediately lose access.')) return;
    try {
      const { error } = await supabase.from('licenses').delete().eq('key', key);
      if (error) throw error;
    } catch {
      const local = JSON.parse(localStorage.getItem('sop_agent_v6_licenses') || '[]');
      const filtered = local.filter((k: WhoKeyData) => k.key !== key);
      localStorage.setItem('sop_agent_v6_licenses', JSON.stringify(filtered));
    }
    setKeys((prev) => prev.filter((k) => k.key !== key));
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6" />
            License Control
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create and manage WhoKeys for your team. Owner keys are fixed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchKeys}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Key
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading keys...</div>
      ) : keys.length === 0 ? (
        <div className="text-center py-12">
          <Key className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No keys found. Create your first team key.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {keys.map((k) => (
            <Card key={k.key} className={!k.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`text-xs ${
                        k.role === 'owner'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : k.role === 'editor'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}
                    >
                      {k.role}
                    </Badge>
                    <code className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {k.key}
                    </code>
                    {k.label && <span className="text-sm text-slate-500">{k.label}</span>}
                    {!k.is_active && (
                      <Badge variant="destructive" className="text-xs">Revoked</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyKey(k.key)}
                    >
                      {copied === k.key ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKey(k.key, !k.is_active)}
                    >
                      {k.is_active ? 'Revoke' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteKey(k.key)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New WhoKey</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Role</label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as 'editor' | 'team')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">SOP Editor (can manage SOPs)</SelectItem>
                  <SelectItem value="team">Team Member (Ask Agent only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Label (optional)</label>
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., Sarah - Claims Team"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Brokerage Code</label>
              <Input
                value={newBrokerage}
                onChange={(e) => setNewBrokerage(e.target.value.toUpperCase())}
                placeholder="e.g., MORGAN"
              />
            </div>
            <p className="text-xs text-slate-500">
              Key format: {newRole === 'editor' ? `SOP-EDIT-${newBrokerage}-XXXX` : `SOP-TEAM-${newBrokerage}-XXXX`}
            </p>
            <Button onClick={createKey} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Generate Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
