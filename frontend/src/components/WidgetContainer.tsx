import React, { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, Settings2, Trash2, Plus, Download } from 'lucide-react';
import { ResizableBox } from 'react-resizable';
import { toPng } from 'html-to-image';
import { WidgetConfig } from '../types';
import { ChartRenderer } from './ChartRenderer';

interface WidgetContainerProps {
  config: WidgetConfig;
  onEdit: (widget: WidgetConfig) => void;
  onDelete: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({ config, onEdit, onDelete, onResize }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const exportData = async () => {
    if (!data || data.length === 0) return;
    setIsExporting(true);

    try {
      if (config.type === 'table' || config.type === 'kpi') {
        // CSV Export
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => {
            const val = row[header];
            return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
          }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${config.title.replace(/\s+/g, '_')}_data.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Image Export
        if (widgetRef.current) {
          // Hide controls temporarily
          const controls = widgetRef.current.querySelector('.widget-controls') as HTMLElement;
          if (controls) controls.style.display = 'none';

          const dataUrl = await toPng(widgetRef.current, {
            backgroundColor: '#ffffff',
            style: {
              borderRadius: '0'
            }
          });

          if (controls) controls.style.display = 'flex';

          const link = document.createElement('a');
          link.download = `${config.title.replace(/\s+/g, '_')}_chart.png`;
          link.href = dataUrl;
          link.click();
        }
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/analytics/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: config.type,
            dimension: config.dimension,
            metric: config.metric,
            aggregation: config.aggregation,
            dateFilter: config.dateFilter,
            statusFilter: (config as any).statusFilter,
            categoryFilter: (config as any).categoryFilter,
            productFilter: (config as any).productFilter
          })
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to fetch analytics');
        }
        const result = await res.json();
        const parsedData = result.map((item: any) => {
          if (item.value !== undefined) {
            return { ...item, value: Number(item.value) };
          }
          return item;
        });
        setData(parsedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [config]);

  return (
    <ResizableBox
      width={400}
      height={400}
      minConstraints={[200, 200]}
      maxConstraints={[1200, 800]}
      axis="both"
      onResize={(e, { size }) => onResize(config.id, size.width, size.height)}
      handle={<div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-zinc-300/50 rounded-br-xl" />}
    >
      <div 
        ref={widgetRef}
        className="widget h-full w-full bg-white border border-zinc-200 rounded-xl p-5 shadow-sm flex flex-col group relative transition-all hover:shadow-md"
      >
        {/* Controls */}
        <div className="widget-controls absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
          <button 
            onClick={exportData}
            disabled={isExporting}
            title={config.type === 'table' ? "Export as CSV" : "Export as Image"}
            className="p-1.5 bg-white shadow-sm border border-zinc-200 rounded-lg text-zinc-500 hover:text-emerald-600 transition-all hover:scale-105 disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={() => onEdit(config)}
            title="Configure Widget Settings"
            className="p-1.5 bg-white shadow-sm border border-zinc-200 rounded-lg text-zinc-500 hover:text-blue-600 transition-all hover:scale-105"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => onDelete(config.id)}
            title="Delete Widget"
            className="p-1.5 bg-white shadow-sm border border-zinc-200 rounded-lg text-zinc-500 hover:text-red-600 transition-all hover:scale-105"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <div 
            title="Drag to Reorder"
            className="widget-handle p-1.5 bg-white shadow-sm border border-zinc-200 rounded-lg text-zinc-500 cursor-move transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5 rotate-45" />
          </div>
        </div>

        {config.type !== 'kpi' && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 truncate pr-16 tracking-tight">{config.title}</h3>
            <span className="text-[10px] font-bold text-zinc-500 uppercase bg-zinc-100 px-2 py-0.5 rounded-full tracking-wider">
              {config.type}
            </span>
          </div>
        )}

        <div className="flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          ) : (
            <ChartRenderer type={config.type} data={data} config={config} />
          )}
        </div>
      </div>
    </ResizableBox>
  );
};
