import React, { useState } from 'react';
import { ShoppingBag, Home, Store, Truck, Plus, Search, DollarSign, X, Calendar, FileText, Trash2, Tag } from 'lucide-react';

const ExpenseManager = ({ type = 'general', expenses, setExpenses, setCashTransactions }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash'
  });

  const typeConfig = {
    home: { label: 'Home Expenses', icon: Home, color: 'rose' },
    shop: { label: 'Shop Expenses', icon: Store, color: 'blue' },
    transport: { label: 'Transport Expenses', icon: Truck, color: 'amber' },
    general: { label: 'Expenses', icon: ShoppingBag, color: 'indigo' }
  };

  const colorMap = {
    rose: {
      btn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25',
      iconBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
      iconColor: 'text-rose-500'
    },
    blue: {
      btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      iconColor: 'text-blue-500'
    },
    amber: {
      btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      iconColor: 'text-amber-500'
    },
    indigo: {
      btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      iconColor: 'text-indigo-500'
    }
  };

  const config = typeConfig[type] || typeConfig.general;
  const colors = colorMap[config.color];

  const filteredExpenses = expenses.filter(exp => 
    exp.category === type && 
    (exp.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
     exp.amount.toString().includes(searchQuery))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    const expenseId = Date.now().toString();
    const expenseEntry = {
      id: expenseId,
      ...newExpense,
      category: type,
      amount: parseFloat(newExpense.amount)
    };

    // Add to expenses
    setExpenses(prev => [...prev, expenseEntry]);

    // Add to cash transactions
    const transactionEntry = {
      id: `exp-${expenseId}`,
      date: newExpense.date,
      description: `[${config.label}] ${newExpense.description}`,
      amount: parseFloat(newExpense.amount),
      cashAmount: newExpense.paymentMethod === 'cash' ? parseFloat(newExpense.amount) : 0,
      onlineAmount: newExpense.paymentMethod === 'online' ? parseFloat(newExpense.amount) : 0,
      creditAmount: 0,
      type: 'expense',
      source: 'manual',
      color: config.color.toUpperCase(),
      referenceId: expenseId
    };
    setCashTransactions(prev => [...prev, transactionEntry]);

    // Reset and close
    setNewExpense({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash'
    });
    setShowModal(false);
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(exp => exp.id !== id));
      setCashTransactions(prev => prev.filter(tx => tx.referenceId !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className={`p-4 ${colors.iconBg} rounded-3xl shadow-sm`}>
            <config.icon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{config.label}</h2>
            <p className="text-slate-500 dark:text-slate-400">Manage and track your {type} related costs</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className={`${colors.btn} text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2`}
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total {config.label}</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-slate-800 dark:text-white">RS. {totalAmount.toLocaleString()}</p>
            <DollarSign className={`w-8 h-8 ${colors.iconColor} opacity-20`} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Records</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-slate-800 dark:text-white">{filteredExpenses.length}</p>
            <FileText className={`w-8 h-8 ${colors.iconColor} opacity-20`} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredExpenses.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">{exp.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{exp.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                        exp.paymentMethod === 'cash' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800'
                          : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800'
                      }`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-black text-rose-600 dark:text-rose-400">
                        Rs. {Number(exp.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <p className="text-slate-400 italic">No expense records found for {config.label.toLowerCase()}.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Add {config.label}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddExpense} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Description</label>
                <input
                  required
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-medium"
                  placeholder="e.g. Electricity Bill, Fuel, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Amount (RS)</label>
                  <input
                    required
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-black"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Date</label>
                  <input
                    required
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {['cash', 'online'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setNewExpense({...newExpense, paymentMethod: method})}
                      className={`py-3 rounded-2xl font-bold capitalize transition-all border ${
                        newExpense.paymentMethod === method
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-200'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-4 ${colors.btn} text-white rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 mt-4`}
              >
                Save Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;
