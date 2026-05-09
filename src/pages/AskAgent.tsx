// ============================================
// SOP Agent Pro - Ask Agent Page
// ============================================
import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ImagePlus, Loader2, User, Bot, Lightbulb, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/hooks/useAuth';
import { useSOPs } from '@/hooks/useSOPs';
import { useHistory } from '@/hooks/useHistory';
import { HINT_PILLS, buildSystemPrompt } from '@/lib/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ChatMessage } from '@/types';

export default function AskAgent() {
  const role = useAuthStore((s) => s.role);
  const key = useAuthStore((s) => s.key);
  const userName = useAuthStore((s) => s.userName);
  const toolActive = useAuthStore((s) => s.toolActive);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showHints, setShowHints] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sops } = useSOPs();
  const { addHistory } = useHistory();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildSOPContext = useCallback(() => {
    const filtered = activeCategory === 'All'
      ? sops
      : sops.filter((s) => s.category === activeCategory);
    return filtered.map((s) => `## ${s.title}\n${s.content}`).join('\n\n---\n\n');
  }, [sops, activeCategory]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || !key) return;
    if (!toolActive && role !== 'owner') {
      setError('Tool is temporarily suspended by the Owner.');
      return;
    }

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');
    setShowHints(false);

    if (!isSupabaseConfigured()) {
      await new Promise((r) => setTimeout(r, 800));
      const searchTerm = text.toLowerCase();
      const matchingSOPs = sops.filter((s) =>
        s.title.toLowerCase().includes(searchTerm) ||
        s.content.toLowerCase().includes(searchTerm)
      );
      const answer = matchingSOPs.length > 0
        ? `Based on your SOPs:\n\n${matchingSOPs.map((s) => `**${s.title}**\n${s.content}`).join('\n\n---\n\n')}`
        : `I don't have a specific SOP for that yet.\n\n**DEMO MODE:** Connect your Supabase backend to get full AI responses.`;
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, timestamp: Date.now() }]);
      setLoading(false);
      return;
    }

    try {
      const sopContext = buildSOPContext();
      const systemPrompt = buildSystemPrompt(sopContext, activeCategory);
      const conversationHistory = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

      const { data, error: fnError } = await supabase.functions.invoke('anthropic-chat', {
        body: {
          key,
          user_tag: userName || key,
          messages: [...conversationHistory, { role: 'user', content: text }],
          sop_context: systemPrompt,
        },
      });

      if (fnError) throw fnError;

      const answer = data?.content?.[0]?.text || 'No response received. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: answer, timestamp: Date.now() }]);

      await addHistory({
        license_key: key,
        role: role!,
        label: '',
        user_tag: userName || key,
        question: text,
        answer,
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to get response';
      setError(errMsg);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errMsg}. Please check your connection and try again. If the issue persists, contact your Owner.`,
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => { setSelectedImage(reader.result as string); setError(''); };
    reader.readAsDataURL(file);
  };

  const categories = ['All', ...Array.from(new Set(sops.map((s) => s.category)))];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Ask Agent</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Ask any operational question. SOP Agent answers from your procedures.</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {messages.filter((m) => m.role === 'user').length} questions
          </Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 dark:text-slate-400">Focus:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 && showHints && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">Welcome to SOP Agent Pro</p>
                <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-1">
                  Ask me anything about your Standard Operating Procedures. Click a hint below or type your own question.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HINT_PILLS.map((hint, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(hint)}
                  className="text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        {selectedImage && (
          <div className="mb-2 relative inline-block">
            <img src={selectedImage} alt="Upload" className="h-16 rounded-lg border border-slate-200" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center">×</button>
          </div>
        )}
        <div className="flex gap-2">
          <label className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors shrink-0">
            <ImagePlus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about any procedure..."
            className="flex-1"
            disabled={loading}
          />
          <Button onClick={() => handleSend()} disabled={loading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
