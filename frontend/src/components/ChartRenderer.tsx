import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  PieChart, Pie, XAxis, YAxis, ScatterChart, Scatter,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis 
} from 'recharts';
import { WidgetConfig } from '../types';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

interface ChartRendererProps {
  type: string;
  data: any[];
  config: WidgetConfig;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ type, data, config }) => {
  switch (type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'area':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={60} label={{ fontSize: 10 }}>
              {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    case 'scatter':
      const isNumericX = data.length > 0 && typeof data[0].label === 'number';
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              type={isNumericX ? "number" : "category"} 
              dataKey="x" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis type="number" dataKey="y" fontSize={10} tickLine={false} axisLine={false} />
            <ZAxis type="number" range={[64, 144]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Orders" data={data.map(d => ({ x: d.label, y: d.value }))} fill="#6366f1" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    case 'kpi':
      const total = data.reduce((acc, curr) => acc + Number(curr.value), 0);
      const isCurrency = config.metric === 'total_amount' || config.metric === 'unit_price';
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{config.title}</span>
          <span className="text-4xl font-bold text-slate-900 mt-1">
            {isCurrency ? `$${total.toLocaleString()}` : total.toLocaleString()}
          </span>
        </div>
      );
    case 'table':
      const columns = data.length > 0 ? Object.keys(data[0]) : [];
      return (
        <div className="h-full overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white border-b border-slate-100">
              <tr>
                {columns.map(col => (
                  <th key={col} className="py-2 px-3 font-semibold text-slate-600 capitalize">{col.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  {columns.map(col => (
                    <td key={col} className="py-2 px-3 text-slate-700">
                      {typeof row[col] === 'number' ? row[col].toLocaleString() : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return <div>Unsupported widget type</div>;
  }
};
