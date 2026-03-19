import React, { useState } from 'react';
import { X, LayoutGrid } from 'lucide-react';

interface DashboardModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">New Dashboard</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Dashboard Name</label>
            <input 
              autoFocus
              required
              type="text" 
              placeholder="e.g. Sales Overview"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={!name.trim()}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
