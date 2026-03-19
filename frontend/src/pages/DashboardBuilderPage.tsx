import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Plus, Save, Loader2, ChevronLeft, 
  BarChart3, LineChart, AreaChart, PieChart, 
  LayoutGrid, Hash, Table as TableIcon, Menu, X 
} from 'lucide-react';
import { Dashboard, WidgetConfig } from '../types';
import { DashboardGrid } from '../components/DashboardGrid';
import { WidgetConfigPanel } from '../components/WidgetConfigPanel';
import { cn } from '../lib/utils';

interface DashboardBuilderPageProps {
  dashboardId: string;
  onBack: () => void;
  onError: (err: any) => void;
}

const CHART_TYPES = [
  { type: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { type: 'line', label: 'Line Chart', icon: LineChart },
  { type: 'area', label: 'Area Chart', icon: AreaChart },
  { type: 'pie', label: 'Pie Chart', icon: PieChart },
  { type: 'scatter', label: 'Scatter Plot', icon: LayoutGrid },
  { type: 'kpi', label: 'KPI Widget', icon: Hash },
  { type: 'table', label: 'Table Widget', icon: TableIcon },
];

export const DashboardBuilderPage: React.FC<DashboardBuilderPageProps> = ({ dashboardId, onBack, onError }) => {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);
  const [width, setWidth] = useState(1200);
  const [isDragging, setIsDragging] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) setWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [dashboardId]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`/api/dashboards/${dashboardId}`);
      const dashData = await res.json();
      
      const widgetsRecord: Record<string, WidgetConfig> = {};
      const layout: any[] = [];
      
      if (dashData.widgets) {
        dashData.widgets.forEach((w: any) => {
          widgetsRecord[w.id] = { ...w.config, id: w.id, type: w.type };
          layout.push({ i: w.id, x: w.layout_x, y: w.layout_y, w: w.layout_w, h: w.layout_h });
        });
      }

      setDashboard({
        id: dashData.id,
        name: dashData.name,
        layout: layout,
        widgets: widgetsRecord
      });
    } catch (err: any) {
      onError(err);
    }
  };

  const saveLayout = async (currentLayout: any) => {
    if (!dashboard) return;
    
    // Prepare widgets array for bulk save
    const widgetsToSave = currentLayout.map((item: any) => {
      const widgetConfig = dashboard.widgets[item.i];
      return {
        id: item.i,
        type: widgetConfig.type,
        config: widgetConfig,
        layout_x: item.x,
        layout_y: item.y,
        layout_w: item.w,
        layout_h: item.h
      };
    }).filter((w: any) => w.config); // Ensure widget config exists

    try {
      await fetch(`/api/dashboards/${dashboard.id}/widgets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgets: widgetsToSave })
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save layout:", err);
      onError(err);
    }
  };

  const onDrop = async (layout: any, layoutItem: any, _event: any) => {
    // Handle both v1 (layout, item, e) and v2 (item) signatures
    // In v2, the first argument might be the layout or the item depending on the component
    const item = layoutItem || layout;
    console.log("onDrop called with item:", item);
    if (!dashboard || !item) return;
    
    const type = (window as any).__dragging_widget_type__ || 'bar';
    const newId = uuidv4();

    const newWidgetConfig: WidgetConfig = {
      id: newId,
      type: type as any,
      title: `New ${type.toUpperCase()}`,
      dimension: 'category',
      metric: 'total_amount',
      aggregation: 'sum',
      dateFilter: 'all',
      statusFilter: 'all',
      productFilter: 'all'
    };
    
    // Synchronously add to state so react-grid-layout sees it immediately
    setDashboard(prev => {
      if (!prev) return null;
      return {
        ...prev,
        layout: [...prev.layout, { i: newId, x: item.x, y: item.y, w: item.w, h: item.h }],
        widgets: { ...prev.widgets, [newId]: newWidgetConfig }
      };
    });
  };

  const updateWidget = async (id: string, updates: Partial<WidgetConfig>) => {
    let updatedWidget: WidgetConfig | null = null;
    let layoutItem: any = null;

    setDashboard(prev => {
      if (!prev) return null;
      updatedWidget = { ...prev.widgets[id], ...updates };
      layoutItem = prev.layout.find(l => l.i === id);
      return {
        ...prev,
        widgets: { ...prev.widgets, [id]: updatedWidget }
      };
    });

    setEditingWidget(prev => {
      if (prev && prev.id === id) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  };

  const deleteWidget = async (id: string) => {
    setDashboard(prev => {
      if (!prev) return null;
      const { [id]: removed, ...remainingWidgets } = prev.widgets;
      return {
        ...prev,
        layout: prev.layout.filter(l => l.i !== id),
        widgets: remainingWidgets
      };
    });
  };

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden relative">
      {/* Sidebar Overlay */}
      {isLibraryOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsLibraryOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 md:relative md:translate-x-0",
        isLibraryOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">Widget Library</h3>
            <p className="text-xs text-slate-500 mt-1">Drag a chart type onto the grid</p>
          </div>
          <button className="md:hidden p-2" onClick={() => setIsLibraryOpen(false)}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {CHART_TYPES.map((item) => (
            <div
              key={item.type}
              draggable={true}
              unselectable="on"
              title={`Drag to add a ${item.label} to your dashboard`}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', ''); // Required for Firefox
                (window as any).__dragging_widget_type__ = item.type;
                setIsDragging(true);
                // On mobile, we might want to close the library when dragging starts
                // but since it's a drag operation, it's better to keep it open until drop
              }}
              onDragEnd={() => {
                setIsDragging(false);
                if (window.innerWidth < 768) setIsLibraryOpen(false);
              }}
              className="droppable-element flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 cursor-grab active:cursor-grabbing transition-all group"
            >
              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                <item.icon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <header className="flex items-center justify-between p-4 md:p-6 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={onBack}
              title="Return to Dashboard List"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setIsLibraryOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              title="Open Widget Library"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 truncate">{dashboard.name}</h2>
              <p className="text-slate-500 text-[10px] md:text-xs truncate hidden sm:block">Drag widgets from the library to build your dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            {saveSuccess && (
              <span className="text-xs md:text-sm text-emerald-600 font-medium animate-pulse hidden sm:inline">Saved!</span>
            )}
            <button 
              onClick={() => saveLayout(dashboard.layout)}
              title="Save the current dashboard layout and widget configurations"
              className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-indigo-600 text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200"
            >
              <Save className="w-4 h-4" />
              <span className="hidden xs:inline">Save Layout</span>
              <span className="xs:hidden">Save</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6" ref={containerRef}>
          {mounted && (
            <DashboardGrid 
              dashboard={dashboard}
              width={width}
              isDragging={isDragging}
              onLayoutChange={(current: any) => {
                setDashboard(prev => {
                  if (!prev) return null;
                  
                  // Create a map of current layout items
                  const currentMap = new Map(current.map((l: any) => [l.i, l]));
                  
                  // Update coordinates of existing items, keep items that are in prev but not in current
                  const newLayout = prev.layout.map(l => {
                    if (currentMap.has(l.i)) {
                      const { i, x, y, w, h } = currentMap.get(l.i) as any;
                      return { ...l, i, x, y, w, h };
                    }
                    return l;
                  });
                  
                  // Add any new items from current that aren't in prev (shouldn't happen, but just in case)
                  const prevMap = new Map(prev.layout.map(l => [l.i, l]));
                  current.forEach((l: any) => {
                    if (!prevMap.has(l.i) && l.i !== '__dropping-elem__') {
                      newLayout.push(l);
                    }
                  });
                  
                  return { ...prev, layout: newLayout };
                });
              }}
              onEditWidget={setEditingWidget}
              onDeleteWidget={deleteWidget}
              onDrop={onDrop}
              onResizeWidget={(id, w, h) => console.log('Resize', id, w, h)}
            />
          )}
        </div>
      </div>

      {editingWidget && (
        <WidgetConfigPanel 
          widget={editingWidget}
          onUpdate={updateWidget}
          onClose={() => setEditingWidget(null)}
        />
      )}
    </div>
  );
};
