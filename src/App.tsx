// ============================================
// SOP Agent Pro - Main App
// Root component with routing and layout
// ============================================
import { useState } from 'react';
import { useAuthInit } from '@/hooks/useAuth';
import LoginScreen from '@/components/LoginScreen';
import Sidebar from '@/components/Sidebar';
import AskAgent from '@/pages/AskAgent';
import ManageSOPs from '@/pages/ManageSOPs';
import BrowseSOPs from '@/pages/BrowseSOPs';
import HistoryPage from '@/pages/History';
import Diagnostics from '@/pages/Diagnostics';
import AITraining from '@/pages/AITraining';
import LicenseControl from '@/pages/LicenseControl';
import SettingsPage from '@/pages/Settings';
import { useAuthStore } from '@/hooks/useAuth';
import { hasPermission } from '@/types';

export default function App() {
  const { isAuthenticated, isLoading, role } = useAuthInit();
  const [activeTab, setActiveTab] = useState('ask');
  const toolActive = useAuthStore((s) => s.toolActive);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading SOP Agent Pro...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !role) {
    return <LoginScreen />;
  }

  if (!toolActive && role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Tool Suspended</h2>
          <p className="text-slate-500 dark:text-slate-400">
            SOP Agent Pro has been temporarily suspended by the Owner. Please contact your brokerage owner for access.
          </p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'ask':
        return <AskAgent />;
      case 'manage':
        return hasPermission(role, 'manage_sops') ? <ManageSOPs /> : <BrowseSOPs />;
      case 'browse':
        return <BrowseSOPs />;
      case 'history':
        return hasPermission(role, 'view_history') ? <HistoryPage /> : null;
      case 'diagnostics':
        return hasPermission(role, 'view_diagnostics') ? <Diagnostics /> : null;
      case 'training':
        return hasPermission(role, 'view_ai_training') ? <AITraining /> : null;
      case 'licenses':
        return hasPermission(role, 'manage_licenses') ? <LicenseControl /> : null;
      case 'settings':
        return hasPermission(role, 'owner_toggles') ? <SettingsPage /> : null;
      default:
        return <AskAgent />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderPage()}
      </main>
    </div>
  );
}
