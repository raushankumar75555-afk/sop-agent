// ============================================
// SOP Agent Pro - Manage SOPs Page
// CRUD for SOPs (Owner + Editor only)
// ============================================
import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSOPs } from '@/hooks/useSOPs';
import { useAuthStore } from '@/hooks/useAuth';
import { SOP_CATEGORIES } from '@/lib/constants';
import type { SOP } from '@/types';

export default function ManageSOPs() {
  const { sops, loading, saveSOP, deleteSOP } = useSOPs();
  const sopLockdown = useAuthStore((s) => s.sopLockdown);
  const role = useAuthStore((s) => s.role);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<SOP | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'General' });

  const canEdit = role === 'owner' || !sopLockdown;

  const filtered = sops.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.content.toLowerCase().includes(search.toLowerCase())
  );

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
    if (confirm('Are you sure you want to delete this SOP?')) {
      await deleteSOP(id);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manage SOPs</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, edit, and delete Standard Operating Procedures
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => { setEditing(null); setForm({ title: '', content: '', category: 'General' }); setIsCreateOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New SOP
          </Button>
        )}
      </div>

      {sopLockdown && role === 'editor' && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
          <FileText className="w-4 h-4" />
          SOP editing is currently locked by the Owner. You can view SOPs but cannot edit them.
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search SOPs..."
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading SOPs...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No SOPs found. {canEdit && 'Create your first SOP.'}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((sop) => (
            <Card key={sop.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{sop.title}</CardTitle>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {sop.category} · Updated {new Date(sop.updated_at).toLocaleDateString('en-AU')}
                    </p>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(sop)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(sop.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap line-clamp-4">
                  {sop.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOP_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Content</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Enter the procedure steps..."
                rows={12}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" />
                Save SOP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
