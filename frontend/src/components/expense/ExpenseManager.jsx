import React from 'react';
import { ShoppingBag, Home, Store, Truck, Plus, Search, DollarSign } from 'lucide-react';

const ExpenseManager = ({ type = 'general' }) => {
  const typeConfig = {
    home: { label: 'Home Expenses', icon: Home, color: 'rose' },
    shop: { label: 'Shop Expenses', icon: Store, color: 'blue' },
    transport: { label: 'Transport Expenses', icon: Truck, color: 'amber' },
    general: { label: 'Expenses', icon: ShoppingBag, color: 'indigo' }
  };

  const config = typeConfig[type] || typeConfig.general;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className={`p-4 bg-${config.color}-100 dark:bg-${config.color}-900/30 text-${config.color}-600 dark:text-${config.color}-400 rounded-3xl shadow-sm`}>
            <config.icon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{config.label}</h2>
            <p className="text-slate-500 dark:text-slate-400">Manage and track your {type} related costs</p>
          </div>
        </div>
        <button className={`bg-${config.color}-600 hover:bg-${config.color}-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-${config.color}-500/25 transition-all flex items-center gap-2`}>
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total {config.label}</p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-slate-800 dark:text-white">RS. 0</p>
            <DollarSign className={`w-8 h-8 text-${config.color}-500 opacity-20`} />
          </div>
        </div>
        {/* Additional Stats can go here */}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
            />
          </div>
        </div>

        <div className="p-20 text-center">
          <p className="text-slate-400 italic">No expense records found for {config.label.toLowerCase()}.</p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManager;
