// ============================================
// SOP Agent Pro - Manage SOPs Page
// With bulk import, audit trail, smart search, auto-structure
// ============================================
import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, FileText, Search, Upload, History, ChevronDown, ChevronUp, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSOPs } from '@/hooks/useSOPs';
import { useAuthStore } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { SOP_CATEGORIES } from '@/lib/constants';
import type { SOP } from '@/types';

export default function ManageSOPs() {
  const { sops, loading, saveSOP, deleteSOP, searchSOPs } = useSOPs();
  const sopLockdown = useAuthStore((s) => s.sopLockdown);
  const role = useAuthStore((s) => s.role);
  const key = useAuthStore((s) => s.key);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SOP[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [editing, setEditing] = useState<SOP | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [_auditSopId, setAuditSopId] = useState<string | null>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'General' });
  const [bulkText, setBulkText] = useState('');
  const [bulkParsed, setBulkParsed] = useState<{ title: string; content: string; category: string }[]>([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [autoStructuring, setAutoStructuring] = useState(false);

  const canEdit = role === 'owner' || !sopLockdown;

  const handleSearch = async (value: string) => {
    setSearch(value);
    if (!value.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    const results = await searchSOPs(value);
    setSearchResults(results);
    setSearching(false);
  };

  const displayedSOPs = searchResults !== null ? searchResults : sops;

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const success = await saveSOP({
      id: editing?.id,
      title: form.title,
      content: form.content,
      category: form.category,
    });
    if (success) {
      setEditing(null);
      setIsCreateOpen(false);
      setForm({ title: '', content: '', category: 'General' });
    }
  };

  const handleEdit = (sop: SOP) => {
    if (!canEdit) return;
    setEditing(sop);
    setForm({ title: sop.title, content: sop.content, category: sop.category });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if (confirm('Are you sure you want to delete this SOP? This action is logged.')) {
      await deleteSOP(id);
    }
  };

  const handleAutoStructure = async () => {
    if (!form.content.trim()) return;
    setAutoStructuring(true);
    try {
      const { data, error } = await supabase.functions.invoke('anthropic-chat', {
        body: {
          key: key || 'internal',
          messages: [{
            role: 'user',
            content: `Reformat this raw SOP text into clean numbered steps. Output ONLY the formatted procedure, nothing else. Use this exact format:
1. [Step title]: [Clear description of what to do]
2. [Step title]: [Clear description]
...and so on.
Add a line at the end starting with WARNING: if there are any cautions or conditions in the text.

Raw SOP text:
${form.content}`,
          }],
          sop_context: 'You are an expert SOP formatter. Your only job is to reformat raw procedure text into clean, numbered steps. Be concise and direct. Never add generic advice. Only output the formatted steps.',
          ping: false,
        },
      });
      if (!error && data?.content?.[0]?.text) {
        setForm(prev => ({ ...prev, content: data.content[0].text }));
      }
    } catch (e) {
      console.error('Auto-structure failed:', e);
    }
    setAutoStructuring(false);
  };

  const parseBulkText = () => {
    const sections = bulkText.split(/\n#{1,3}\s+/).filter(Boolean);
    const parsed = sections.map(section => {
      const lines = section.trim().split('\n');
      const title = lines[0].replace(/^#+\s*/, '').trim();
      const content = lines.slice(1).join('\n').trim();
      return { title, content, category: 'General' };
    }).filter(s => s.title && s.content);
    setBulkParsed(parsed);
  };

  const handleBulkSave = async () => {
    if (!bulkParsed.length) return;
    setBulkSaving(true);
    for (const sop of bulkParsed) {
      await saveSOP(sop);
    }
    setBulkSaving(false);
    setIsBulkOpen(false);
    setBulkText('');
    setBulkParsed([]);
  };

  const loadAuditLog = async (sopId: string) => {
    setAuditSopId(sopId);
    setAuditLoading(true);
    setIsAuditOpen(true);
    const { data } = await supabase
      .from('sop_change_log')
      .select('*')
      .eq('sop_id', sopId)
      .order('created_at', { ascending: false });
    setAuditLog(data || []);
    setAuditLoading(false);
  };

  const actionColors: Record<string, string> = {
    created: 'bg-green-100 text-green-700',
    updated: 'bg-blue-100 text-blue-700',
    deleted: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage SOPs</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, edit, and delete Standard Operating Procedures
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
            <Button onClick={() => {
              setEditing(null);
              setForm({ title: '', content: '', category: 'General' });
              setIsCreateOpen(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              New SOP
            </Button>
          </div>
        )}
      </div>

      {/* Lockdown Warning */}
      {sopLockdown && role === 'editor' && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          SOP editing is currently locked by the Owner. You can view SOPs but cannot edit them.
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{sops.length}</div>
          <div className="text-xs text-slate-500 mt-1">Total SOPs</div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-indigo-600">{[...new Set(sops.map(s => s.category))].length}</div>
          <div className="text-xs text-slate-500 mt-1">Categories</div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
          <div className="text-2xl font-bold text-emerald-600">
            {sops.filter(s => new Date(s.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Updated This Week</div>
        </div>
      </div>

      {/* Smart Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Smart search — type any keyword, question, or topic..."
          className="pl-10"
        />
        {searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">Searching...</div>
        )}
        {searchResults !== null && !searching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-500 font-medium">
            {searchResults.length} results
          </div>
        )}
      </div>

      {/* SOP List */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading SOPs...</div>
      ) : displayedSOPs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">
            {search ? 'No SOPs match your search.' : canEdit ? 'No SOPs yet. Create your first SOP or use Bulk Import.' : 'No SOPs found.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayedSOPs.map((sop) => (
            <Card key={sop.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{sop.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">{sop.category}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Updated {new Date(sop.updated_at).toLocaleDateString()}
                      {sop.created_by && ` · by ${sop.created_by}`}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => loadAuditLog(sop.id)} title="View change history">
                      <History className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === sop.id ? null : sop.id)}>
                      {expandedId === sop.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                    {canEdit && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(sop)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(sop.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap line-clamp-3">
                  {sop.content}
                </p>
                {expandedId === sop.id && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-2">
                    {sop.content}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit SOP' : 'Create New SOP'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Claims Handling Procedure"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOP_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">Content</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAutoStructure}
                  disabled={autoStructuring || !form.content.trim()}
                  className="h-7 px-3 text-xs text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {autoStructuring ? 'Structuring...' : 'Auto-Structure'}
                </Button>
              </div>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Paste raw procedure text here, then click Auto-Structure to format it automatically..."
                rows={14}
              />
              <p className="text-xs text-slate-400 mt-1">
                Tip: Paste any raw text and click Auto-Structure to convert it into numbered steps automatically.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                <X className="w-4 h-4 mr-2" />Cancel
              </Button>
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" />Save SOP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Import SOPs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg text-sm text-blue-700 dark:text-blue-400">
              Paste multiple SOPs below. Separate each SOP with a heading like <code className="bg-blue-100 px-1 rounded">## SOP Title</code>. The content below each heading becomes the SOP body.
            </div>
            <Textarea
              value={bulkText}
              onChange={(e) => { setBulkText(e.target.value); setBulkParsed([]); }}
              placeholder={`## Coverage Update Procedure\nWe can update the vehicle coverage effective from the email received date.\n1. Check email date\n2. Update system\n\n## Claims Handling\nStep 1: Receive the claim...\nStep 2: Verify policy...`}
              rows={16}
              className="font-mono text-sm"
            />
            <Button variant="outline" onClick={parseBulkText} className="w-full">
              Preview Parsed SOPs ({bulkParsed.length} detected)
            </Button>
            {bulkParsed.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {bulkParsed.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{s.content.substring(0, 80)}...</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsBulkOpen(false); setBulkText(''); setBulkParsed([]); }}>
                Cancel
              </Button>
              <Button
                onClick={handleBulkSave}
                disabled={!bulkParsed.length || bulkSaving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {bulkSaving ? 'Importing...' : `Import ${bulkParsed.length} SOPs`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Audit Trail Dialog */}
      <Dialog open={isAuditOpen} onOpenChange={setIsAuditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Change History
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {auditLoading ? (
              <div className="text-center py-8 text-slate-500">Loading history...</div>
            ) : auditLog.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No changes recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {auditLog.map((log) => (
                  <div key={log.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                          {log.action.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {log.performed_by}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    {log.action === 'updated' && (
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100">
                          <div className="font-medium text-red-600 mb-1">Before</div>
                          <div className="text-slate-600 dark:text-slate-400 line-clamp-3">{log.old_content}</div>
                        </div>
                        <div className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100">
                          <div className="font-medium text-green-600 mb-1">After</div>
                          <div className="text-slate-600 dark:text-slate-400 line-clamp-3">{log.new_content}</div>
                        </div>
                      </div>
                    )}
                    {log.action === 'created' && (
                      <div className="text-xs text-slate-500 mt-1">
                        Created: <span className="font-medium">{log.new_title}</span>
                      </div>
                    )}
                    {log.action === 'deleted' && (
                      <div className="text-xs text-red-500 mt-1">
                        Deleted: <span className="font-medium">{log.old_title}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
