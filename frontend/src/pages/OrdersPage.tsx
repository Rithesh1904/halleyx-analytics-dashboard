import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Edit2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { OrderModal } from '../components/OrderModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id: string) => {
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    setConfirmDeleteId(null);
    fetchOrders();
  };

  const clearAllOrders = async () => {
    if (window.confirm('Are you sure you want to clear ALL order data? This cannot be undone.')) {
      await fetch('/api/orders/clear', { method: 'POST' });
      fetchOrders();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">Order Management</h2>
            <p className="text-slate-500 text-xs md:text-sm">View and manage your raw analytics data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearAllOrders}
            className="flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 text-red-600 border border-red-200 rounded-lg text-xs md:text-sm font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden xs:inline">Clear All</span>
            <span className="xs:hidden">Clear</span>
          </button>
          <button 
            onClick={() => {
              setEditingOrder(null);
              setIsModalOpen(true);
            }}
            title="Create a new order record"
            className="flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 bg-indigo-600 text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-indigo-700 transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>
      </div>

      {isModalOpen && (
        <OrderModal 
          order={editingOrder}
          onClose={() => {
            setIsModalOpen(false);
            setEditingOrder(null);
          }} 
          onSave={() => {
            setIsModalOpen(false);
            setEditingOrder(null);
            fetchOrders();
          }} 
        />
      )}

      {confirmDeleteId && (
        <ConfirmModal 
          title="Delete Order"
          message="Are you sure you want to delete this order? This action cannot be undone."
          onConfirm={() => deleteOrder(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Database className="w-12 h-12 text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium tracking-tight text-lg">No orders yet</p>
            <p className="text-slate-400 text-sm mt-1">Add your first order record to see data here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-400">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">{order.customer_name || 'Unnamed Customer'}</span>
                      {order.email && <span className="text-[10px] text-slate-400">{order.email}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.category}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                      {order.product}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">${Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                      order.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                      order.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingOrder(order);
                          setIsModalOpen(true);
                        }}
                        title="Edit Order"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all hover:scale-110"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(order.id)}
                        title="Delete Order"
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-all hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};
