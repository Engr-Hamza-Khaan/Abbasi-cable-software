import React, { useState } from 'react';
import { ShoppingCart, Calendar, Tag, PlusCircle, History } from 'lucide-react';

const PurchaseModule = ({ products, setProducts, purchases, setPurchases, setCashTransactions }) => {
  const [formData, setFormData] = useState({
    productId: '',
    size: '',
    type: 'Standard',
    core: 'Single Core',
    length: 1,
    unitPrice: 0,
    vendor: '',
    batchLabel: '',
    cashAmount: 0,
    onlineAmount: 0,
    paymentType: 'cash',
    paymentDetail: '',
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

  const filteredPurchases = purchases.filter(p => isWithinDateRange(p.date));

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
          size: formData.size,
          type: formData.type,
          core: formData.core,
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
      color: selectedProduct.color,
      total: formData.length * formData.unitPrice,
      cashAmount: formData.paymentType === 'online' ? 0 : formData.cashAmount,
      onlineAmount: formData.paymentType === 'cash' ? 0 : formData.onlineAmount,
      paidAmount: (formData.paymentType === 'cash' ? formData.cashAmount :
        formData.paymentType === 'online' ? formData.onlineAmount :
          (formData.cashAmount + formData.onlineAmount)),
      credit: (formData.length * formData.unitPrice) -
        (formData.paymentType === 'cash' ? formData.cashAmount :
          formData.paymentType === 'online' ? formData.onlineAmount :
            (formData.cashAmount + formData.onlineAmount))
    };
    setPurchases([newPurchase, ...purchases]);

    // Sync with Cash Flow
    if (setCashTransactions) {
      const cashFlowTx = {
        id: Date.now() + 1,
        date: formData.date,
        type: 'expense',
        amount: newPurchase.total,
        cashAmount: newPurchase.cashAmount,
        onlineAmount: newPurchase.onlineAmount,
        creditAmount: newPurchase.credit,
        source: 'purchase',
        color: newPurchase.color,
        description: `Purchase: ${selectedProduct.name} from ${formData.vendor || 'Unknown'}`,
        referenceId: newPurchase.id.toString(),
        paymentDetail: newPurchase.paymentDetail
      };
      setCashTransactions(prev => [...prev, cashFlowTx]);
    }

    // Success message and reset
    setMessage(`Successfully added ${formData.length} ${selectedProduct.unit}s to ${selectedProduct.name}`);
    setTimeout(() => setMessage(''), 3000);
    setFormData({
      productId: '',
      size: '',
      type: 'Standard',
      core: 'Single Core',
      length: 1,
      unitPrice: 0,
      vendor: '',
      batchLabel: '',
      cashAmount: 0,
      onlineAmount: 0,
      paymentType: 'cash',
      paymentDetail: '',
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Size (MM)</label>
              <input
                type="text"
                placeholder="e.g. 3/29"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Type</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Standard">Standard</option>
                <option value="Flexible">Flexible</option>
                <option value="Rubber">Rubber</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Core</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.core}
                onChange={(e) => setFormData({ ...formData, core: e.target.value })}
              >
                <option value="Single Core">Single Core</option>
                <option value="2 Core">2 Core</option>
                <option value="3 Core">3 Core</option>
                <option value="4 Core">4 Core</option>
              </select>
            </div>
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
                onFocus={(e) => e.target.select()}
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
                onFocus={(e) => e.target.select()}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Vendor / Supplier</label>
            <input
              required
              type="text"
              placeholder="e.g. Copper King Ltd."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Purchase Date</label>
              <input
                required
                type="date"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Bill Amount</label>
              <div className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-400 font-bold text-lg">
                Rs. {(formData.length * formData.unitPrice).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Payment Method</label>
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
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Amount Paid to Vendor</label>
              <div className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-white font-bold text-lg">
                Rs. {(formData.paymentType === 'cash' ? formData.cashAmount :
                  formData.paymentType === 'online' ? formData.onlineAmount :
                    (formData.cashAmount + formData.onlineAmount)).toLocaleString()}
              </div>
              {((formData.length * formData.unitPrice) - (formData.paymentType === 'cash' ? formData.cashAmount : formData.paymentType === 'online' ? formData.onlineAmount : (formData.cashAmount + formData.onlineAmount))) > 0 && (
                <p className="text-xs text-red-500 font-bold px-1 animate-pulse">
                  Balance Payable: Rs. {((formData.length * formData.unitPrice) - (formData.paymentType === 'cash' ? formData.cashAmount : formData.paymentType === 'online' ? formData.onlineAmount : (formData.cashAmount + formData.onlineAmount))).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className={`grid gap-4 ${formData.paymentType === 'hybrid' ? 'grid-cols-2' : 'grid-cols-1'} animate-in fade-in slide-in-from-top-2 duration-300`}>
            {(formData.paymentType === 'cash' || formData.paymentType === 'hybrid') && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Cash Paid</label>
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
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Online Paid</label>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 px-2 gap-3">
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Quick Purchase History</h2>
          </div>
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] dark:text-white font-bold"
            />
            <span className="text-slate-400 text-[9px] font-bold">TO</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none outline-none text-[10px] dark:text-white font-bold"
            />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-md">
          <div className="max-h-[500px] overflow-y-auto">
            {filteredPurchases.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No purchases recorded for this period.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredPurchases.slice(0, 10).map(p => (
                  <div key={p.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-white">{p.productName}</span>
                        <div className="flex gap-2 mt-0.5 items-center">
                          {p.color && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color.toLowerCase() }}></span>
                              {p.color}
                            </span>
                          )}
                          {p.size && <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400 font-medium">{p.size}mm</span>}
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400 font-medium">{p.type}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400 font-medium">{p.core}</span>
                        </div>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{p.total.toLocaleString()}PKR</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
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
