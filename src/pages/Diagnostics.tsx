// ============================================
// SOP Agent Pro - Diagnostics Page
// Health check and system status
// ============================================
import { useState, useEffect } from 'react';
import { Activity, Database, Zap, Server, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useSOPs } from '@/hooks/useSOPs';
import { APP_NAME, APP_VERSION } from '@/lib/constants';

interface HealthStatus {
  supabase: boolean;
  anthropic: boolean;
  sopsCount: number;
  lastCheck: string;
}

export default function Diagnostics() {
  const { sops } = useSOPs();
  const [health, setHealth] = useState<HealthStatus>({
    supabase: false,
    anthropic: false,
    sopsCount: 0,
    lastCheck: 'Never',
  });
  const [checking, setChecking] = useState(false);

  const runDiagnostics = async () => {
    setChecking(true);
    const status: HealthStatus = {
      supabase: false,
      anthropic: false,
      sopsCount: sops.length,
      lastCheck: new Date().toLocaleString('en-AU'),
    };

    // Check Supabase
    try {
      const { error } = await supabase.from('sops').select('id').limit(1);
      status.supabase = !error;
    } catch {
      status.supabase = false;
    }

    // Check Anthropic via Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('anthropic-chat', {
        body: { ping: true },
      });
      status.anthropic = !error && data?.pong === true;
    } catch {
      status.anthropic = false;
    }

    setHealth(status);
    setChecking(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Diagnostics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            System health check and connection status
          </p>
        </div>
        <Button onClick={runDiagnostics} disabled={checking} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking...' : 'Run Check'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              Supabase Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {health.supabase ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`font-medium ${health.supabase ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                {health.supabase ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {health.supabase ? 'SOPs, history, and licenses syncing normally.' : 'Check your Supabase URL and anon key configuration.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Anthropic API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {health.anthropic ? (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className={`font-medium ${health.anthropic ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                {health.anthropic ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {health.anthropic ? 'Claude responding normally via Edge Function.' : 'Check Edge Function deployment and API key.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-500" />
              SOPs Loaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={health.sopsCount > 0 ? 'default' : 'destructive'} className="text-sm">
                {health.sopsCount}
              </Badge>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {health.sopsCount === 0 ? 'No SOPs loaded' : health.sopsCount === 1 ? 'SOP loaded' : 'SOPs loaded'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {health.sopsCount < 5 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="w-3 h-3" />
                  Add more SOPs for better AI responses
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              System Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">App</span>
              <span className="font-medium">{APP_NAME} v{APP_VERSION}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Check</span>
              <span className="font-medium">{health.lastCheck}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Timezone</span>
              <span className="font-medium">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Troubleshooting Guide */}
      <Card className="bg-slate-50 dark:bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-sm">Quick Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Supabase disconnected?</strong> Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.</p>
          <p><strong>Anthropic disconnected?</strong> Verify your Edge Function is deployed and ANTHROPIC_API_KEY is set.</p>
          <p><strong>SOPs not loading?</strong> Ensure your Supabase table has RLS policies allowing reads.</p>
          <p><strong>Slow responses?</strong> Claude 3.5 Sonnet is powerful but may take 3-5 seconds for complex queries.</p>
        </CardContent>
      </Card>
    </div>
  );
}
