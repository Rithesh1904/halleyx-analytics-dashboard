import React from 'react';
import { Plus } from 'lucide-react';
import { WidgetConfig } from '../types';

interface WidgetConfigPanelProps {
  widget: WidgetConfig;
  onUpdate: (id: string, updates: Partial<WidgetConfig>) => void;
  onClose: () => void;
}

const CATEGORIES: Record<string, string[]> = {
  'Electronics': ['Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Desk Lamp'],
  'Books': ['Story Book', 'Comic Book', 'Textbook', 'Novel', 'Biography'],
  'Clothing': ['T-Shirt', 'Jeans', 'Jacket', 'Shoes', 'Hat'],
  'Home': ['Chair', 'Table', 'Sofa', 'Bed', 'Cabinet']
};

export const WidgetConfigPanel: React.FC<WidgetConfigPanelProps> = ({ widget, onUpdate, onClose }) => {
  const currentCategory = (widget as any).categoryFilter || 'all';
  const currentProduct = (widget as any).productFilter || 'all';

  const handleCategoryChange = (category: string) => {
    onUpdate(widget.id, { 
      categoryFilter: category,
      productFilter: 'all' // Reset product filter when category changes
    } as any);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Configure Widget</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div title="The name displayed at the top of the widget">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Title</label>
            <input 
              type="text" 
              value={widget.title}
              onChange={(e) => onUpdate(widget.id, { title: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div title="Select the primary data field to group by (e.g., analyze by Product or by Category)">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Dimension</label>
            <select 
              value={widget.dimension}
              onChange={(e) => onUpdate(widget.id, { dimension: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="category">Category</option>
              <option value="product">Product</option>
              <option value="status">Order Status</option>
              <option value="customer_name">Customer</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div title="The numerical value to measure">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Metric</label>
              <select 
                value={widget.metric}
                onChange={(e) => onUpdate(widget.id, { metric: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="total_amount">Total Amount ($)</option>
                <option value="quantity">Quantity</option>
                <option value="unit_price">Unit Price</option>
                <option value="id">Record Count</option>
              </select>
            </div>
            <div title="How to combine the values (e.g., Sum of amounts or Average price)">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Aggregation</label>
              <select 
                value={widget.aggregation}
                onChange={(e) => onUpdate(widget.id, { aggregation: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="sum">Sum</option>
                <option value="count">Count</option>
                <option value="avg">Average</option>
                <option value="max">Max</option>
                <option value="min">Min</option>
              </select>
            </div>
          </div>

          <div title="Filter data by a specific time range">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Time Period</label>
            <select 
              value={widget.dateFilter}
              onChange={(e) => onUpdate(widget.id, { dateFilter: e.target.value as any })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="365d">Last Year</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div title="Narrow down data to a specific category">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category Filter</label>
                <select 
                  value={currentCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="all">All Categories</option>
                  {Object.keys(CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div title="Narrow down data to a specific product (requires Category filter)">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Product Filter</label>
                <select 
                  value={currentProduct}
                  onChange={(e) => onUpdate(widget.id, { productFilter: e.target.value } as any)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="all">All Products</option>
                  {currentCategory !== 'all' && CATEGORIES[currentCategory].map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
            <div title="Filter data by order status">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status Filter</label>
              <select 
                value={(widget as any).statusFilter || 'all'}
                onChange={(e) => onUpdate(widget.id, { statusFilter: e.target.value } as any)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
