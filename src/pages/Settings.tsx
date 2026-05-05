// ============================================
// SOP Agent Pro - Settings Page
// Owner toggles: Master Switch + SOP Lockdown
// Dark mode, system reset
// ============================================
import { useState, useEffect } from 'react';
import { Wrench, Power, Lock, Moon, Sun, Trash2, AlertTriangle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [darkMode, setDarkMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggleTool = async (active: boolean) => {
    setSaving(true);
    await updateSettings({ tool_active: active });
    useAuthStore.setState({ toolActive: active });
    setSaving(false);
  };

  const handleToggleLockdown = async (lock: boolean) => {
    setSaving(true);
    await updateSettings({ sop_lockdown: lock });
    useAuthStore.setState({ sopLockdown: lock });
    setSaving(false);
  };

  const resetTool = () => {
    if (!confirm('WARNING: This will clear ALL local data including SOPs, history, and settings. Supabase data will NOT be affected. Continue?')) return;
    localStorage.clear();
    window.location.reload();
  };

  const exportData = async () => {
    try {
      const [sopsRes, historyRes, licensesRes] = await Promise.all([
        supabase.from('sops').select('*'),
        supabase.from('history').select('*'),
        supabase.from('licenses').select('*'),
      ]);

      const exportObj = {
        sops: sopsRes.data || [],
        history: historyRes.data || [],
        licenses: licensesRes.data || [],
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sop-agent-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Check your connection.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Wrench className="w-6 h-6" />
          Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Owner controls, system preferences, and data management
        </p>
      </div>

      <div className="space-y-6">
        {/* Owner Toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Power className="w-4 h-4 text-amber-500" />
              Owner Controls
            </CardTitle>
            <CardDescription>Master switches that affect the entire team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Master Tool Switch</p>
                <p className="text-xs text-slate-500">
                  {settings?.tool_active !== false 
                    ? 'Tool is ACTIVE. All team members can access.' 
                    : 'Tool is SUSPENDED. Only Owner can access.'}
                </p>
              </div>
              <Switch
                checked={settings?.tool_active !== false}
                onCheckedChange={handleToggleTool}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">SOP Lockdown</p>
                <p className="text-xs text-slate-500">
                  {settings?.sop_lockdown 
                    ? 'SOPs are LOCKED. Editors cannot create or edit.' 
                    : 'SOPs are UNLOCKED. Editors can manage SOPs.'}
                </p>
              </div>
              <Switch
                checked={settings?.sop_lockdown || false}
                onCheckedChange={handleToggleLockdown}
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Anthropic API Key */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-500" />
              Anthropic API Key
            </CardTitle>
            <CardDescription>Stored securely as a Supabase environment secret — never in the database.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20">
              <KeyRound className="h-4 w-4 text-indigo-600" />
              <AlertDescription className="text-indigo-800 dark:text-indigo-300 text-xs">
                Your Anthropic API key is stored as a Supabase secret, not in the database.
                To set or update it, run this once in your terminal:<br /><br />
                <code className="block font-mono bg-indigo-100 dark:bg-indigo-900/40 px-2 py-1 rounded text-[11px]">
                  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
                </code>
                <br />
                This keeps your key completely safe. It cannot be read from the app or database.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Dark Mode</p>
                <p className="text-xs text-slate-500">Switch between light and dark themes</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Export All Data</p>
                <p className="text-xs text-slate-500">Download JSON backup of SOPs, history, and keys</p>
              </div>
              <Button variant="outline" onClick={exportData}>Export</Button>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
              <Alert variant="destructive" className="mb-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Resetting clears all local data. Supabase data is not affected.
                </AlertDescription>
              </Alert>
              <Button variant="destructive" onClick={resetTool} className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Reset Local Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
