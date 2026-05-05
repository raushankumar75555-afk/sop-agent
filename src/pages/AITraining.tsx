// ============================================
// SOP Agent Pro - AI Training Page
// 33 Australian P&C Insurance Training Examples
// Owner-only access
// ============================================
import { useState } from 'react';
import { GraduationCap, BookOpen, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TRAINING_EXAMPLES } from '@/lib/constants';

export default function AITraining() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(TRAINING_EXAMPLES.map((t) => t.category)))];

  const filtered = TRAINING_EXAMPLES.filter((t) => {
    const matchesSearch = t.user.toLowerCase().includes(search.toLowerCase()) ||
      t.expected.toLowerCase().includes(search.toLowerCase()) ||
      t.sop_title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: number) => {
    setExpanded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-6 h-6" />
          AI Training Data
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          33 v5 trained examples for Australian P&C insurance SOPs. These guide the AI's response style and accuracy.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search training examples..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors flex items-center gap-1 ${
                categoryFilter === cat
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Filter className="w-3 h-3" />
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((example) => {
          const isExpanded = expanded.includes(example.id);
          return (
            <Card key={example.id} className="overflow-hidden">
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleExpand(example.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs shrink-0">{example.id}</Badge>
                    <Badge variant="secondary" className="text-xs shrink-0">{example.category}</Badge>
                    <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{example.sop_title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent className="space-y-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1 font-medium">USER QUESTION:</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 italic">"{example.user}"</p>
                  </div>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1 font-medium">EXPECTED AI RESPONSE:</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{example.expected}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">No training examples match your search.</p>
        </div>
      )}
    </div>
  );
}
