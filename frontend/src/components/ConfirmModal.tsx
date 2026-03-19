import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 text-amber-600 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <p className="text-slate-600 text-sm mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
