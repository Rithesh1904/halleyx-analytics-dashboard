import React, { useState, useEffect } from 'react';
import { LayoutGrid, Database, BarChart3, AlertCircle, CheckCircle2, Menu, X } from 'lucide-react';
import { cn } from './lib/utils';
import { OrdersPage } from './pages/OrdersPage';
import { DashboardListPage } from './pages/DashboardListPage';
import { DashboardBuilderPage } from './pages/DashboardBuilderPage';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export default function App() {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
          <div className="flex items-center gap-3 text-teal-600 font-bold text-2xl mb-6">
            <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
              <path d="M20 4C22 10 28 12 32 12C36 12 38 14 38 18C38 22 34 26 30 26C26 26 24 24 22 22C20 20 18 20 16 22C14 24 12 26 8 26C4 26 0 22 0 18C0 14 2 12 6 12C10 12 16 10 18 4H20Z" fill="#2dd4bf"/>
              <path d="M20 36C18 30 12 28 8 28C4 28 2 26 2 22C2 18 6 14 10 14C14 14 16 16 18 18C20 20 22 20 24 18C26 16 28 14 32 14C36 14 40 18 40 22C40 26 38 28 34 28C30 28 24 30 22 36H20Z" fill="#2dd4bf"/>
            </svg>
            <span>Halleyx Challenge 2</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 mb-6 text-sm">Sign in to access your analytics dashboards</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
              <input 
                type="email" 
                defaultValue="admin@halleyx.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password</label>
              <input 
                type="password" 
                defaultValue="password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
            >
              Sign In
            </button>
          </div>
          
          <p className="mt-8 text-center text-xs text-slate-400">
            Production-grade analytics for modern teams.
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Something went wrong</h2>
          <p className="text-slate-600 mb-6">The application encountered an error. Please try refreshing the page.</p>
          <pre className="bg-slate-50 p-4 rounded-lg text-xs text-red-600 overflow-auto max-h-40 mb-6">
            {error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardApp onError={(err: any) => { setHasError(true); setError(err); }} />
  );
}

function DashboardApp({ onError }: { onError: (err: any) => void }) {
  const [activeTab, setActiveTab] = useState<'dashboards' | 'orders'>('dashboards');
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; error: string | null }>({ connected: false, error: null });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/db-status');
        const data = await res.json();
        setDbStatus(data);
      } catch (err) {
        setDbStatus({ connected: false, error: 'Failed to reach server' });
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    if (activeTab === 'orders') {
      return <OrdersPage />;
    }

    if (selectedDashboardId) {
      return (
        <DashboardBuilderPage 
          dashboardId={selectedDashboardId} 
          onBack={() => setSelectedDashboardId(null)}
          onError={onError}
        />
      );
    }

    return <DashboardListPage onSelect={setSelectedDashboardId} />;
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-zinc-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4C22 10 28 12 32 12C36 12 38 14 38 18C38 22 34 26 30 26C26 26 24 24 22 22C20 20 18 20 16 22C14 24 12 26 8 26C4 26 0 22 0 18C0 14 2 12 6 12C10 12 16 10 18 4H20Z" fill="#2563eb"/>
            <path d="M20 36C18 30 12 28 8 28C4 28 2 26 2 22C2 18 6 14 10 14C14 14 16 16 18 18C20 20 22 20 24 18C26 16 28 14 32 14C36 14 40 18 40 22C40 26 38 28 34 28C30 28 24 30 22 36H20Z" fill="#2563eb"/>
          </svg>
          <span>Halleyx</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col shrink-0 transition-transform duration-300 md:relative md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-zinc-100 hidden md:block">
          <div className="flex items-center gap-3 text-blue-600 font-bold text-xl">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
              <path d="M20 4C22 10 28 12 32 12C36 12 38 14 38 18C38 22 34 26 30 26C26 26 24 24 22 22C20 20 18 20 16 22C14 24 12 26 8 26C4 26 0 22 0 18C0 14 2 12 6 12C10 12 16 10 18 4H20Z" fill="#2563eb"/>
              <path d="M20 36C18 30 12 28 8 28C4 28 2 26 2 22C2 18 6 14 10 14C14 14 16 16 18 18C20 20 22 20 24 18C26 16 28 14 32 14C36 14 40 18 40 22C40 26 38 28 34 28C30 28 24 30 22 36H20Z" fill="#2563eb"/>
            </svg>
            <span>Halleyx</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => { setActiveTab('dashboards'); setSelectedDashboardId(null); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'dashboards' ? "bg-blue-50 text-blue-700" : "text-zinc-600 hover:bg-zinc-100"
            )}
          >
            <LayoutGrid className="w-5 h-5" />
            Dashboards
          </button>
          <button 
            onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'orders' ? "bg-blue-50 text-blue-700" : "text-zinc-600 hover:bg-zinc-100"
            )}
          >
            <Database className="w-5 h-5" />
            Orders Data
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className={cn(
            "rounded-lg p-4 transition-colors",
            dbStatus.connected ? "bg-zinc-900 text-white" : "bg-red-50 text-red-900 border border-red-100"
          )}>
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-wider mb-1",
              dbStatus.connected ? "text-zinc-400" : "text-red-500"
            )}>
              Database Status
            </p>
            <div className="flex items-center gap-2">
              {dbStatus.connected ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold">Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-semibold">Auth Failed</span>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
}
