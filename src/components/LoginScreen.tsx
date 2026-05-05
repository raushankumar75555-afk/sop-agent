// ============================================
// SOP Agent Pro - Login Screen (WhoKey Entry)
// No passwords. Key IS identity.
// ============================================
import { useState } from 'react';
import { Key, Shield, Building2, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/hooks/useAuth';

export default function LoginScreen() {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const trimmed = key.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter your WhoKey');
      setLoading(false);
      return;
    }

    const success = await login(trimmed);
    if (!success) {
      setError('Invalid or inactive WhoKey. Please check with your Owner.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">SOP Agent Pro</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">AI-Powered SOP Intelligence for Australian Insurance Brokerages</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Enter Your WhoKey</CardTitle>
            <CardDescription>
              No password needed. Your key is your identity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g., RK-ADMIN-2026-X9"
                  className="pl-10 font-mono text-sm uppercase"
                  disabled={loading}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Access Tool'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-3">Key Types</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <Shield className="w-4 h-4 text-amber-600 mb-1" />
                  <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">Owner</span>
                  <span className="text-[9px] text-amber-600/70">Full Control</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <Building2 className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-[10px] font-medium text-blue-700 dark:text-blue-400">Editor</span>
                  <span className="text-[9px] text-blue-600/70">Manage SOPs</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <Users className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">Team</span>
                  <span className="text-[9px] text-emerald-600/70">Ask Agent</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          Built for Australian P&C Insurance Brokerages · NIBA Aligned · APRA Compliant
        </p>
      </div>
    </div>
  );
}
