// ============================================
// SOP Agent Pro - Browse SOPs Page
// Read-only SOP browser for Team members
// ============================================
import { useState } from 'react';
import { Search, FileText, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSOPs } from '@/hooks/useSOPs';

export default function BrowseSOPs() {
  const { sops, loading } = useSOPs();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(sops.map((s) => s.category)))];

  const filtered = sops.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Browse SOPs</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Search and read all Standard Operating Procedures. Read-only access.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SOPs..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading SOPs...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No SOPs found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((sop) => (
              <Card key={sop.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      {sop.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">{sop.category}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Updated {new Date(sop.updated_at).toLocaleDateString('en-AU')}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    {sop.content}
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
