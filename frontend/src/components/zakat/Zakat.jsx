import React from 'react';
import { DollarSign, PieChart, Calculator, Heart } from 'lucide-react';

const Zakat = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Zakat Management</h2>
        <p className="text-slate-500 dark:text-slate-400">Calculate and track your annual Zakat contributions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center space-y-4">
          <Calculator className="w-12 h-12 text-blue-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Zakat Calculator</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Automated calculation based on current assets, inventory, and cash flow.</p>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25">
            Open Calculator
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center space-y-4">
          <PieChart className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Contribution History</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">View previous years' contributions and distribution records.</p>
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25">
            View History
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 font-medium">Estimated Zakat for 2025</p>
            <h3 className="text-4xl font-black">RS. 0.00</h3>
          </div>
          <DollarSign className="w-16 h-16 opacity-20" />
        </div>
      </div>
    </div>
  );
};

export default Zakat;
