import React, { useState } from 'react';
import { Send, User, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';

const SalesModule = ({ products, setProducts, sales, setSales }) => {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    customer: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selectedProduct = products.find(p => p.id === parseInt(formData.productId));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.productId || formData.quantity <= 0) {
      setError("Please select a product and valid quantity.");
      return;
    }

    if (!selectedProduct) return;

    if (selectedProduct.stock < formData.quantity) {
      setError(`Insufficient stock. Current stock for ${selectedProduct.name} is ${selectedProduct.stock}`);
      return;
    }

    // Update product stock
    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id 
        ? { ...p, stock: p.stock - parseInt(formData.quantity) } 
        : p
    );
    setProducts(updatedProducts);

    // Record sales
    const newSale = {
      ...formData,
      id: Date.now(),
      productName: selectedProduct.name,
      total: formData.quantity * 100 // Example price logic
    };
    setSales([newSale, ...sales]);

    // Success message and reset
    setMessage(`Successfully issued ${formData.quantity} ${selectedProduct.unit}s of ${selectedProduct.name}`);
    setTimeout(() => setMessage(''), 3000);
    setFormData({
      productId: '',
      quantity: 1,
      customer: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Sales Form */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <ShoppingBag className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Sales / Issue (Stock Out)</h2>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6 flex items-center border border-red-500/20">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-xl mb-6 flex items-center border border-green-500/20">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Inventory Item</label>
            <select
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              value={formData.productId}
              onChange={(e) => setFormData({...formData, productId: e.target.value})}
            >
              <option value="">-- Select Cable Type --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Available: {p.stock} {p.unit}s)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Issue Quantity</label>
              <input
                required
                type="number"
                min="1"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
              />
              {selectedProduct && (
                 <p className="text-xs text-slate-500 mt-1">Remaining after: {selectedProduct.stock - formData.quantity}</p>
              )}
            </div>
            <div className="space-y-1">
               <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Issue Date</label>
               <input
                 required
                 type="date"
                 className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                 value={formData.date}
                 onChange={(e) => setFormData({...formData, date: e.target.value})}
               />
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Customer / Project Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="e.g. Skyline Towers Maintenance"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.customer}
                onChange={(e) => setFormData({...formData, customer: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-slate-800 dark:bg-blue-600 hover:bg-slate-900 dark:hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 font-bold"
          >
            <Send className="w-5 h-5" />
            <span>Process Stock Out</span>
          </button>
        </form>
      </div>

      {/* Stock Summary Info */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-white shadow-xl">
           <h3 className="text-xl font-bold mb-4">Stock Insights</h3>
           <div className="space-y-6">
              <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                 <div>
                   <p className="text-sm opacity-80">Total Issue Transactions</p>
                   <p className="text-2xl font-bold">{sales.length}</p>
                 </div>
                 <ChevronRight className="w-6 h-6 opacity-40" />
              </div>
              <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
                 <div>
                   <p className="text-sm opacity-80">Total Units Issued</p>
                   <p className="text-2xl font-bold">{sales.reduce((acc, sale) => acc + (sale.quantity || 0), 0)}</p>
                 </div>
                 <ChevronRight className="w-6 h-6 opacity-40" />
              </div>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md">
           <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Critical Stock Alerts</h3>
           <div className="space-y-3">
              {products.filter(p => p.stock <= p.minStock).slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30">
                   <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                   </div>
                   <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800 dark:text-red-200">{p.name}</p>
                      <p className="text-xs text-red-600 dark:text-red-400">Only {p.stock} units left!</p>
                   </div>
                </div>
              ))}
              {products.filter(p => p.stock <= p.minStock).length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">All stock levels are healthy.</p>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SalesModule;
