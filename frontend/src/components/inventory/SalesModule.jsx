import React, { useState } from 'react';
import { Send, User, ChevronRight, AlertCircle, ShoppingBag } from 'lucide-react';

const SalesModule = ({ products, setProducts, sales, setSales, setCashTransactions }) => {
  const [formData, setFormData] = useState({
    productId: '',
    variantId: '',
    length: 1,
    price: 0,
    cashAmount: 0,
    onlineAmount: 0,
    paymentType: 'cash',
    paymentDetail: '',
    customer: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isWithinDateRange = (dateStr) => {
    if (!startDate && !endDate) return true;
    if (startDate && dateStr < startDate) return false;
    if (endDate && dateStr > endDate) return false;
    return true;
  };

  const filteredSales = sales.filter(s => isWithinDateRange(s.date));

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selectedProduct = products.find(p => p.id === parseInt(formData.productId));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.productId || formData.length <= 0) {
      setError("Please select a product and valid length.");
      return;
    }

    if (!selectedProduct) return;

    const selectedVariant = selectedProduct.variants.find(v => v.id.toString() === formData.variantId.toString());

    if (!selectedVariant) {
      setError("Please select a valid batch/variant.");
      return;
    }

    if (selectedVariant.stock < formData.length) {
      setError(`Insufficient stock in this batch. Available: ${selectedVariant.stock}`);
      return;
    }

    // Update product stock within variants
    const updatedProducts = products.map(p => {
      if (p.id === selectedProduct.id) {
        return {
          ...p,
          variants: p.variants.map(v =>
            v.id.toString() === formData.variantId.toString()
              ? { ...v, stock: v.stock - parseInt(formData.length) }
              : v
          )
        };
      }
      return p;
    });
    setProducts(updatedProducts);

    // Record sales
    const newSale = {
      ...formData,
      id: Date.now(),
      productName: selectedProduct.name,
      color: selectedProduct.color,
      size: selectedVariant.size,
      type: selectedVariant.type,
      core: selectedVariant.core,
      total: formData.length * formData.price,
      cashAmount: formData.paymentType === 'online' ? 0 : formData.cashAmount,
      onlineAmount: formData.paymentType === 'cash' ? 0 : formData.onlineAmount,
      paidAmount: (formData.paymentType === 'cash' ? formData.cashAmount :
        formData.paymentType === 'online' ? formData.onlineAmount :
          (formData.cashAmount + formData.onlineAmount)),
      credit: (formData.length * formData.price) -
        (formData.paymentType === 'cash' ? formData.cashAmount :
          formData.paymentType === 'online' ? formData.onlineAmount :
            (formData.cashAmount + formData.onlineAmount))
    };
    setSales([newSale, ...sales]);

    // Sync with Cash Flow
    if (setCashTransactions) {
      const cashFlowTx = {
        id: Date.now() + 1, // Slightly different ID
        date: formData.date,
        type: 'income',
        amount: newSale.total,
        cashAmount: newSale.cashAmount,
        onlineAmount: newSale.onlineAmount,
        creditAmount: newSale.credit,
        source: 'sale',
        color: newSale.color,
        description: `Sale: ${formData.customer || 'Walk-in'} (${selectedProduct.name})`,
        referenceId: newSale.id.toString(),
        paymentDetail: newSale.paymentDetail
      };
      setCashTransactions(prev => [...prev, cashFlowTx]);
    }

    // Success message and reset
    setMessage(`Successfully issued ${formData.length} ${selectedProduct.unit}s of ${selectedProduct.name}`);
    setTimeout(() => setMessage(''), 3000);
    setFormData({
      productId: '',
      variantId: '',
      length: 1,
      price: 0,
      cashAmount: 0,
      onlineAmount: 0,
      paymentType: 'cash',
      paymentDetail: '',
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
              onChange={(e) => setFormData({ ...formData, productId: e.target.value, variantId: '' })}
            >
              <option value="">-- Select Cable Type --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Total: {p.stock} {p.unit}s)</option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Select Specific Batch / Variant</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={formData.variantId}
                  onChange={(e) => setFormData({ ...formData, variantId: e.target.value })}
                >
                  <option value="">-- Choose Batch --</option>
                  {selectedProduct.variants && selectedProduct.variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.label} (Avail: {v.stock} {selectedProduct.unit}s)
                    </option>
                  ))}
                </select>
              </div>

              {/* Read-only Auto-filled Specs */}
              {formData.variantId && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Size (MM)</label>
                    <input
                      readOnly
                      type="text"
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none"
                      value={selectedProduct.variants.find(v => v.id.toString() === formData.variantId.toString())?.size || '---'}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Type</label>
                    <input
                      readOnly
                      type="text"
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none"
                      value={selectedProduct.variants.find(v => v.id.toString() === formData.variantId.toString())?.type || '---'}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Core</label>
                    <input
                      readOnly
                      type="text"
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none"
                      value={selectedProduct.variants.find(v => v.id.toString() === formData.variantId.toString())?.core || '---'}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Issue Length</label>
              <input
                required
                type="number"
                min="1"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.length}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setFormData({ ...formData, length: parseInt(e.target.value) || 0 })}
              />
              {selectedProduct && (
                <p className="text-xs text-slate-500 mt-1">Remaining after: {selectedProduct.stock - formData.length}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Unit Price (Rs)</label>
              <input
                required
                type="number"
                min="0"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.price}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Issue Date</label>
              <input
                required
                type="date"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Amount</label>
              <div className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-400 font-bold text-lg">
                Rs. {(formData.length * formData.price).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Payment Type</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-semibold"
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value, cashAmount: 0, onlineAmount: 0, paymentDetail: '' })}
              >
                <option value="cash">Cash Only</option>
                <option value="online">Online Only</option>
                <option value="hybrid">Hybrid (Cash + Online)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Paid Amount</label>
              <div className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-white font-bold text-lg">
                Rs. {(formData.paymentType === 'cash' ? formData.cashAmount :
                  formData.paymentType === 'online' ? formData.onlineAmount :
                    (formData.cashAmount + formData.onlineAmount)).toLocaleString()}
              </div>
              {((formData.length * formData.price) - (formData.paymentType === 'cash' ? formData.cashAmount : formData.paymentType === 'online' ? formData.onlineAmount : (formData.cashAmount + formData.onlineAmount))) > 0 && (
                <p className="text-xs text-red-500 font-bold px-1 animate-pulse">
                  Remaining: Rs. {((formData.length * formData.price) - (formData.paymentType === 'cash' ? formData.cashAmount : formData.paymentType === 'online' ? formData.onlineAmount : (formData.cashAmount + formData.onlineAmount))).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className={`grid gap-4 ${formData.paymentType === 'hybrid' ? 'grid-cols-2' : 'grid-cols-1'} animate-in fade-in slide-in-from-top-2 duration-300`}>
            {(formData.paymentType === 'cash' || formData.paymentType === 'hybrid') && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Cash Amount</label>
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                  value={formData.cashAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setFormData({ ...formData, cashAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}
            {(formData.paymentType === 'online' || formData.paymentType === 'hybrid') && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Online Amount</label>
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={formData.onlineAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setFormData({ ...formData, onlineAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}
          </div>

          {(formData.paymentType === 'online' || formData.paymentType === 'hybrid' || formData.paymentDetail) && (
            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {formData.paymentType === 'cash' ? 'Payment Notes' : 'Transaction ID / Reference'}
                </label>
                <input
                  type="text"
                  placeholder={formData.paymentType === 'cash' ? 'Optional notes' : 'Enter transaction ID'}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={formData.paymentDetail}
                  onChange={(e) => setFormData({ ...formData, paymentDetail: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Customer / Project Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                required
                type="text"
                placeholder="e.g. Skyline Towers Maintenance"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
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
            <div className="flex items-center space-x-2 bg-white/10 p-2 rounded-xl mb-4">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white font-bold w-full"
              />
              <span className="text-white/40 text-[10px] font-bold">TO</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white font-bold w-full"
              />
            </div>
            <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
              <div>
                <p className="text-sm opacity-80">Total Issue Transactions</p>
                <p className="text-2xl font-bold">{filteredSales.length}</p>
              </div>
              <ChevronRight className="w-6 h-6 opacity-40" />
            </div>
            <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
              <div>
                <p className="text-sm opacity-80">Total Units Issued</p>
                <p className="text-2xl font-bold">{filteredSales.reduce((acc, sale) => acc + (Number(sale.length) || 0), 0)}</p>
              </div>
              <ChevronRight className="w-6 h-6 opacity-40" />
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
