// ============================================
// SOP Agent Pro - Sidebar Navigation
// Role-based tab visibility
// ============================================
import { 
  MessageSquare, BookOpen, History, 
  Shield, Terminal, Wrench, GraduationCap, Power
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/hooks/useAuth';
import { hasPermission } from '@/types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ALL_TABS = [
  { id: 'ask', label: 'Ask Agent', icon: MessageSquare, perm: 'ask_agent' },
  { id: 'manage', label: 'Manage SOPs', icon: BookOpen, perm: 'manage_sops' },
  { id: 'browse', label: 'Browse SOPs', icon: BookOpen, perm: 'browse_sops' },
  { id: 'history', label: 'History', icon: History, perm: 'view_history' },
  { id: 'diagnostics', label: 'Diagnostics', icon: Terminal, perm: 'view_diagnostics' },
  { id: 'training', label: 'AI Training', icon: GraduationCap, perm: 'view_ai_training' },
  { id: 'licenses', label: 'License Control', icon: Shield, perm: 'manage_licenses' },
  { id: 'settings', label: 'Settings', icon: Wrench, perm: 'owner_toggles' },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const role = useAuthStore((s) => s.role);
  const toolActive = useAuthStore((s) => s.toolActive);
  const logout = useAuthStore((s) => s.logout);

  if (!role) return null;

  const visibleTabs = ALL_TABS.filter((tab) => hasPermission(role, tab.perm));

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col h-screen">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">SOP Agent Pro</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">v6.0.0</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
            role === 'owner' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            role === 'editor' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            role === 'team' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
          )}>
            {role === 'owner' ? 'Owner' : role === 'editor' ? 'SOP Editor' : 'Team Member'}
          </span>
          {!toolActive && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Suspended
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 font-medium"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Power className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
