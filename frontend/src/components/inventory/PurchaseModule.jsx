import React, { useState } from 'react';
import { ShoppingCart, Calendar, Tag, PlusCircle, History } from 'lucide-react';

const PurchaseModule = ({ products, setProducts, purchases, setPurchases }) => {
  const [formData, setFormData] = useState({
    productId: '',
    length: 1,
    unitPrice: 0,
    vendor: '',
    batchLabel: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productId || formData.length <= 0) {
      alert("Please select a product and valid length.");
      return;
    }

    const selectedProduct = products.find(p => p.id === parseInt(formData.productId));
    if (!selectedProduct) return;

    // Update product variants
    const updatedProducts = products.map(p => {
      if (p.id === selectedProduct.id) {
        const newBatch = {
          id: Date.now() + Math.random(),
          label: formData.batchLabel || `Purchase - ${formData.date}`,
          stock: parseInt(formData.length),
          unitPrice: parseFloat(formData.unitPrice),
          date: formData.date
        };
        return {
          ...p,
          variants: [...(p.variants || []), newBatch]
        };
      }
      return p;
    });
    setProducts(updatedProducts);

    // Record purchase
    const newPurchase = {
      ...formData,
      id: Date.now(),
      productName: selectedProduct.name,
      total: formData.length * formData.unitPrice
    };
    setPurchases([newPurchase, ...purchases]);

    // Success message and reset
    setMessage(`Successfully added ${formData.length} ${selectedProduct.unit}s to ${selectedProduct.name}`);
    setTimeout(() => setMessage(''), 3000);
    setFormData({
      productId: '',
      length: 1,
      unitPrice: 0,
      vendor: '',
      batchLabel: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Purchase Form */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <PlusCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Purchase (Stock In)</h2>
        </div>

        {message && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-xl mb-6 flex items-center border border-green-500/20">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Select Cable Product</label>
            <select
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            >
              <option value="">-- Choose Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Batch Label / Roll Details</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="e.g. 100ft Roll - Premium"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.batchLabel}
                onChange={(e) => setFormData({ ...formData, batchLabel: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Length</label>
              <input
                required
                type="number"
                min="1"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Unit Price</label>
              <input
                required
                type="number"
                min="0"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Vendor / Supplier</label>
            <input
              type="text"
              placeholder="e.g. Copper King Ltd."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date</label>
            <input
              required
              type="date"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 font-bold mt-4"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Complete Purchase</span>
          </button>
        </form>
      </div>

      {/* Recent Purchases */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-2 px-2">
          <History className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Quick Purchase History</h2>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-md">
          <div className="max-h-[500px] overflow-y-auto">
            {purchases.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No purchases recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {purchases.slice(0, 10).map(p => (
                  <div key={p.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-slate-800 dark:text-white">{p.productName}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">RD. {p.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{p.length} Units from {p.vendor || 'Unknown'}</span>
                      <span>{p.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModule;
