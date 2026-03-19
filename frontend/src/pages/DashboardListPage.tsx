import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Trash2, ArrowRight, Clock } from 'lucide-react';
import { DashboardModal } from '../components/DashboardModal';
import { ConfirmModal } from '../components/ConfirmModal';

interface DashboardListPageProps {
  onSelect: (id: string) => void;
}

export const DashboardListPage: React.FC<DashboardListPageProps> = ({ onSelect }) => {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboards();
  }, []);

  const fetchDashboards = async () => {
    const res = await fetch('/api/dashboards');
    const data = await res.json();
    setDashboards(data);
  };

  const createDashboard = async (name: string) => {
    const res = await fetch('/api/dashboards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    onSelect(data.id);
  };

  const deleteDashboard = async (id: string) => {
    await fetch(`/api/dashboards/${id}`, { method: 'DELETE' });
    setConfirmDeleteId(null);
    fetchDashboards();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboards</h2>
          <p className="text-slate-500 text-sm">Select a dashboard to view analytics or create a new one</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Dashboard
        </button>
      </div>

      {isCreateModalOpen && (
        <DashboardModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSave={createDashboard}
        />
      )}

      {confirmDeleteId && (
        <ConfirmModal 
          title="Delete Dashboard"
          message="Are you sure you want to delete this dashboard? This action cannot be undone."
          onConfirm={() => deleteDashboard(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {dashboards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <LayoutGrid className="w-12 h-12 text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium tracking-tight text-lg">No dashboards yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first dashboard to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dash) => (
            <div 
              key={dash.id}
              onClick={() => onSelect(dash.id)}
              className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(dash.id);
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-2">{dash.name}</h3>
              
              <div className="flex items-center gap-4 text-slate-400 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(dash.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-indigo-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
