// ============================================
// SOP Agent Pro - License Control Page
// Client-based: Editor + Team keys together
// ============================================
import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Copy, CheckCircle, Key, RefreshCw, Pause, Play, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import type { WhoKeyData } from '@/types';

interface ClientGroup {
  brokerage: string;
  editorKey: WhoKeyData | null;
  teamKey: WhoKeyData | null;
  isPaused: boolean;
}

function groupByBrokerage(keys: WhoKeyData[]): ClientGroup[] {
  const map = new Map<string, ClientGroup>();
  for (const k of keys) {
    if (k.role === 'owner') continue;
    const b = k.brokerage || 'UNKNOWN';
    if (!map.has(b)) {
      map.set(b, { brokerage: b, editorKey: null, teamKey: null, isPaused: false });
    }
    const group = map.get(b)!;
    if (k.role === 'editor') group.editorKey = k;
    if (k.role === 'team') group.teamKey = k;
    if (!k.is_active) group.isPaused = true;
  }
  return Array.from(map.values());
}

export default function LicenseControl() {
  const [keys, setKeys] = useState<WhoKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [newKeys, setNewKeys] = useState<{ editor: string; team: string } | null>(null);

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
      setKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const createClient = async () => {
    if (!clientName.trim()) return;
    const code = clientName.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    const rand = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const editorKey = `SOP-EDIT-${code}-${rand()}`;
    const teamKey = `SOP-TEAM-${code}-${rand()}`;

    const entries = [
      { key: editorKey, role: 'editor', label: `${clientName} - SOP Editor`, brokerage: code, is_active: true, created_at: new Date().toISOString() },
      { key: teamKey, role: 'team', label: `${clientName} - Team`, brokerage: code, is_active: true, created_at: new Date().toISOString() },
    ];

    try {
      const { error } = await supabase.from('licenses').insert(entries);
      if (error) throw error;
    } catch (e) {
      console.error(e);
    }

    setNewKeys({ editor: editorKey, team: teamKey });
    setClientName('');
    await fetchKeys();
  };

  const pauseClient = async (group: ClientGroup) => {
    const newActive = group.isPaused;
    const keysToUpdate = [group.editorKey?.key, group.teamKey?.key].filter(Boolean);
    for (const k of keysToUpdate) {
      await supabase.from('licenses').update({ is_active: newActive }).eq('key', k);
    }
    await fetchKeys();
  };

  const deleteClient = async (group: ClientGroup) => {
    if (!confirm(`Delete client "${group.brokerage}" and both their keys? This cannot be undone.`)) return;
    const keysToDelete = [group.editorKey?.key, group.teamKey?.key].filter(Boolean);
    for (const k of keysToDelete) {
      await supabase.from('licenses').delete().eq('key', k);
    }
    await fetchKeys();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => { fetchKeys(); }, []);

  const clients = groupByBrokerage(keys);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6" />
            License Control
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Each client gets one Editor key and one Team key.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchKeys}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { setNewKeys(null); setIsCreateOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading clients...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12">
          <Key className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No clients yet. Create your first client.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {clients.map((group) => (
            <Card key={group.brokerage} className={group.isPaused ? 'opacity-60 border-red-200' : 'border-slate-200'}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-slate-900 dark:text-white text-lg">{group.brokerage}</span>
                    {group.isPaused && <Badge variant="destructive" className="text-xs">Paused</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => pauseClient(group)}
                      className={group.isPaused ? 'text-emerald-600 border-emerald-300' : 'text-amber-600 border-amber-300'}
                    >
                      {group.isPaused ? <><Play className="w-3 h-3 mr-1" />Resume</> : <><Pause className="w-3 h-3 mr-1" />Pause</>}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteClient(group)}
                      className="text-red-600 border-red-300"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />Remove
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  {group.editorKey && (
                    <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 text-xs">Editor</Badge>
                        <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{group.editorKey.key}</code>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyKey(group.editorKey!.key)}>
                        {copied === group.editorKey.key ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}
                  {group.teamKey && (
                    <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">Team</Badge>
                        <code className="text-sm font-mono text-slate-700 dark:text-slate-300">{group.teamKey.key}</code>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyKey(group.teamKey!.key)}>
                        {copied === group.teamKey.key ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          {!newKeys ? (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Client / Brokerage Name</label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Rock Insurance"
                />
                {clientName && (
                  <p className="text-xs text-slate-500 mt-1">
                    Keys: SOP-EDIT-{clientName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-XXXX
                    &nbsp;+&nbsp;
                    SOP-TEAM-{clientName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-XXXX
                  </p>
                )}
              </div>
              <Button onClick={createClient} className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={!clientName.trim()}>
                Generate Both Keys
              </Button>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <p className="text-sm text-emerald-600 font-medium">✅ Client created! Share these keys:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs text-blue-600 font-medium mb-1">Editor Key (Manager)</p>
                    <code className="text-sm font-mono">{newKeys.editor}</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyKey(newKeys.editor)}>
                    {copied === newKeys.editor ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-xs text-emerald-600 font-medium mb-1">Team Key (All Staff)</p>
                    <code className="text-sm font-mono">{newKeys.team}</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyKey(newKeys.team)}>
                    {copied === newKeys.team ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button onClick={() => setIsCreateOpen(false)} className="w-full">Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
