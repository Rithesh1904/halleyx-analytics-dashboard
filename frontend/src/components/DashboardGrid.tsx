import React from 'react';
import { LayoutGrid, Plus } from 'lucide-react';
import { WidgetConfig, Dashboard } from '../types';
import { WidgetContainer } from './WidgetContainer';
import { cn } from '../lib/utils';

interface DashboardGridProps {
  dashboard: Dashboard;
  width: number;
  isDragging: boolean;
  onLayoutChange: (layout: any) => void;
  onEditWidget: (widget: WidgetConfig) => void;
  onDeleteWidget: (id: string) => void;
  onDrop: (layout: any, item: any, e: Event) => void;
  onResizeWidget: (id: string, width: number, height: number) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  dashboard, 
  width,
  isDragging,
  onLayoutChange,
  onEditWidget, 
  onDeleteWidget,
  onDrop,
  onResizeWidget
}) => {
  const isEmpty = Object.keys(dashboard.widgets).length === 0;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // For CSS Grid, we trigger onDrop with a default span
    onDrop({}, { x: 0, y: 0, w: 6, h: 4 }, e as any);
  };

  return (
    <div 
      className={cn(
        "dashboard-grid min-h-[800px] w-full rounded-2xl bg-zinc-50 p-8 grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-6 auto-rows-min transition-all relative",
        isDragging ? "pb-[400px]" : "pb-20"
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isEmpty && (
        <div className="col-span-full flex flex-col items-center justify-center py-24 text-zinc-400 pointer-events-none bg-white/50 backdrop-blur-sm rounded-2xl border border-zinc-200">
          <LayoutGrid className="w-12 h-12 mb-4 text-zinc-300" />
          <p className="text-lg font-semibold text-zinc-700">Dashboard is empty</p>
          <p className="text-sm mt-1 text-zinc-500">Drag a chart type from the sidebar to start building your dashboard</p>
        </div>
      )}
      
      {Object.values(dashboard.widgets).map((widget: WidgetConfig) => (
        <div 
          key={widget.id} 
          className={cn(
            "widget col-span-4 md:col-span-4 lg:col-span-6 h-[400px] transition-all",
            isDragging ? 'pointer-events-none opacity-50' : ''
          )}
        >
          <WidgetContainer 
            config={widget} 
            onEdit={onEditWidget} 
            onDelete={onDeleteWidget} 
            onResize={onResizeWidget}
          />
        </div>
      ))}
    </div>
  );
};
