// ============================================
// SOP Agent Pro - History Page
// Owner sees all team. Others see own only.
// ============================================
import { useState } from 'react';
import { History, Trash2, Filter, Search, MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/hooks/useAuth';
import { useHistory } from '@/hooks/useHistory';
import { hasPermission } from '@/types';

export default function HistoryPage() {
  const role = useAuthStore((s) => s.role);
  const key = useAuthStore((s) => s.key);
  const { history, loading, clearHistory } = useHistory();
  const [search, setSearch] = useState('');
  const [filterKey, setFilterKey] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  const canViewAll = hasPermission(role!, 'view_all_history');
  const canClearAll = hasPermission(role!, 'clear_all_history');

  // Get unique keys for filter dropdown (Owner only)
  const uniqueKeys = canViewAll
    ? Array.from(new Set(history.map((h) => h.license_key)))
    : [];

  const filtered = history.filter((h) => {
    const matchesSearch = h.question.toLowerCase().includes(search.toLowerCase()) ||
      h.answer.toLowerCase().includes(search.toLowerCase());
    const matchesKey = !canViewAll || filterKey === 'all' || h.license_key === filterKey;
    const matchesRole = filterRole === 'all' || h.role === filterRole;
    return matchesSearch && matchesKey && matchesRole;
  });

  const handleClear = async () => {
    if (canClearAll) {
      if (confirm('Clear ALL history? This cannot be undone.')) {
        await clearHistory();
      }
    } else if (key) {
      if (confirm('Clear your personal history?')) {
        await clearHistory(key);
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6" />
            Conversation History
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {canViewAll ? 'View all team conversations. Filter by team member or role.' : 'View your personal conversation history.'}
          </p>
        </div>
        <Button variant="destructive" size="sm" onClick={handleClear}>
          <Trash2 className="w-4 h-4 mr-2" />
          {canClearAll ? 'Clear All' : 'Clear Mine'}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or answers..."
            className="pl-10"
          />
        </div>
        {canViewAll && (
          <>
            <Select value={filterKey} onValueChange={setFilterKey}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by key" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Keys</SelectItem>
                {uniqueKeys.map((k) => (
                  <SelectItem key={k} value={k}>{k.slice(0, 20)}...</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="team">Team</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading history...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No conversations found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Card key={item.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-mono text-slate-500">{item.license_key.slice(0, 15)}...</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          item.role === 'owner'
                            ? 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
                            : item.role === 'editor'
                            ? 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400'
                            : 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {item.role}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleString('en-AU')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <p className="text-xs text-slate-500 mb-1">Question:</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.question}</p>
                  </div>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/10 rounded border border-indigo-100 dark:border-indigo-800">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Answer:</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{item.answer}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
