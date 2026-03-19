import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { Order } from '../types';

interface OrderModalProps {
  order?: Order;
  onClose: () => void;
  onSave: () => void;
}

const CATEGORIES: Record<string, string[]> = {
  'Electronics': ['Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Desk Lamp'],
  'Books': ['Story Book', 'Comic Book', 'Textbook', 'Novel', 'Biography'],
  'Clothing': ['T-Shirt', 'Jeans', 'Jacket', 'Shoes', 'Hat'],
  'Home': ['Chair', 'Table', 'Sofa', 'Bed', 'Cabinet']
};

export const OrderModal: React.FC<OrderModalProps> = ({ order, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    category: 'Electronics',
    product: 'Laptop',
    status: 'Pending',
    quantity: 1,
    unit_price: 100,
    created_by_name: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (order) {
      setFormData({
        first_name: order.first_name || '',
        last_name: order.last_name || '',
        email: order.email || '',
        phone: order.phone || '',
        address: order.address || '',
        city: order.city || '',
        state: order.state || '',
        postal_code: order.postal_code || '',
        country: order.country || '',
        category: order.category || 'Electronics',
        product: order.product || 'Laptop',
        status: order.status || 'Pending',
        quantity: order.quantity || 1,
        unit_price: order.unit_price || 100,
        created_by_name: order.created_by_name || ''
      });
    }
  }, [order]);

  const handleCategoryChange = (category: string) => {
    setFormData({
      ...formData,
      category,
      product: CATEGORIES[category][0]
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields = [
      'first_name', 'last_name', 'email', 'phone', 'address', 
      'city', 'state', 'postal_code', 'country', 'product', 'quantity', 'unit_price'
    ];

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = 'Please fill the field';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      customer_name: `${formData.first_name} ${formData.last_name}`
    };

    const url = order ? `/api/orders/${order.id}` : '/api/orders';
    const method = order ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    onSave();
  };

  const getProductLabel = () => {
    if (formData.category === 'Books') return 'Book Type';
    if (formData.category === 'Electronics') return 'Electronic Item';
    if (formData.category === 'Clothing') return 'Clothing Type';
    if (formData.category === 'Home') return 'Home Item';
    return 'Product';
  };

  const totalAmount = formData.quantity * formData.unit_price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{order ? 'Edit Order' : 'Create New Order'}</h2>
            <p className="text-xs text-slate-500 mt-1">Fill in the customer and order details below</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 transition-colors shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Customer Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-600 rounded-full" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">First Name</label>
                <input 
                  type="text" 
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.first_name ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  placeholder="e.g. John"
                />
                {errors.first_name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Last Name</label>
                <input 
                  type="text" 
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.last_name ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  placeholder="e.g. Doe"
                />
                {errors.last_name && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.last_name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  placeholder="+1 (555) 000-0000"
                />
                {errors.phone && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Street Address</label>
              <input 
                type="text" 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.address ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                placeholder="123 Main St, Apt 4B"
              />
              {errors.address && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">City</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.city ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  placeholder="New York"
                />
                {errors.city && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">State/Province</label>
                <input 
                  type="text" 
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.state ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  placeholder="NY"
                />
                {errors.state && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.state}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Postal Code</label>
                <input 
                  type="text" 
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.postal_code ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  placeholder="10001"
                />
                {errors.postal_code && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.postal_code}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Country</label>
              <input 
                type="text" 
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-xl border ${errors.country ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                placeholder="United States"
              />
              {errors.country && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.country}</p>}
            </div>
          </div>

          {/* Order Details Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-600 rounded-full" />
              Order Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
                >
                  {Object.keys(CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{getProductLabel()}</label>
                <select 
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.product ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all`}
                >
                  {CATEGORIES[formData.category].map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                {errors.product && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.product}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.quantity ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                />
                {errors.quantity && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.quantity}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Unit Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.unit_price ? 'border-red-300 bg-red-50' : 'border-slate-200'} focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                />
                {errors.unit_price && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.unit_price}</p>}
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-center">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Total Amount</label>
                <span className="text-xl font-black text-slate-900">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-1.5">
                Created By
                <span className="text-[10px] font-normal text-slate-400 normal-case">(Optional)</span>
              </label>
              <input 
                type="text" 
                value={formData.created_by_name}
                onChange={(e) => setFormData({ ...formData, created_by_name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {order ? 'Update Order' : 'Save Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
