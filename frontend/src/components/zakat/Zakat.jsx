import React, { useState } from 'react';
import { DollarSign, PieChart, Calculator, Heart, Calendar, Package, ArrowRight, Info } from 'lucide-react';

const Zakat = ({ products = [] }) => {
  const [showCalculator, setShowCalculator] = useState(false);

  const toHijri = (dateStr) => {
    if (!dateStr) return '---';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '---';
      return new Intl.DateTimeFormat('en-u-ca-islamic-uma', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return '---';
    }
  };

  const allBatches = products.flatMap(p => 
    (p.variants || []).map(v => ({
      ...v,
      productName: p.name,
      unit: p.unit,
      totalValue: (v.stock || 0) * (v.unitPrice || 0)
    }))
  ).filter(v => v.stock > 0);

  const totalInventoryValue = allBatches.reduce((sum, b) => sum + b.totalValue, 0);
  const estimatedZakat = totalInventoryValue * 0.025;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Zakat Management</h2>
        <p className="text-slate-500 dark:text-slate-400">Calculate and track your annual Zakat contributions based on inventory Hawl</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center space-y-4 flex flex-col justify-between">
          <div>
            <Calculator className="w-10 h-10 text-blue-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Zakat Calculator</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manual calculation tool for all assets.</p>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25">
            Open Tool
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center space-y-4 flex flex-col justify-between">
          <div>
            <PieChart className="w-10 h-10 text-purple-500 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Contribution History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Previous years' distribution records.</p>
          </div>
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-500/25">
            View Records
          </button>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Estimated Inventory Zakat</p>
              <h3 className="text-2xl font-black">RS. {estimatedZakat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            </div>
            <DollarSign className="w-10 h-10 opacity-20" />
          </div>
          <p className="text-[10px] text-emerald-100 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Based on 2.5% of total stock value (RS. {totalInventoryValue.toLocaleString()})
          </p>
        </div>
      </div>

      {/* Zakat Eligible Products Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-500" />
              Zakat Eligible Inventory
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Stock batches synced with Islamic Calendar for Hawl tracking</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
            <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">Current Islamic Date</p>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{toHijri(new Date())}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider font-bold text-slate-500 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-4 px-6">Product & Batch</th>
                <th className="py-4 px-6">Purchase Date (G)</th>
                <th className="py-4 px-6">Islamic Date (H)</th>
                <th className="py-4 px-6">Current Stock</th>
                <th className="py-4 px-6 text-right">Inventory Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {allBatches.length > 0 ? (
                allBatches.map((batch, index) => (
                  <tr key={`${batch.id}-${index}`} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {batch.productName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Batch: {batch.label}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                        {batch.date || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-100 dark:border-emerald-800/50">
                        {toHijri(batch.date)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-white">{batch.stock}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{batch.unit}s</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-slate-900 dark:text-white">RS. {batch.totalValue.toLocaleString()}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Zakat: RS. {(batch.totalValue * 0.025).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 italic">
                    No stock batches found in inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {allBatches.length > 0 && (
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center max-w-2xl ml-auto">
              <div className="text-right flex-1 pr-8">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Total Inventory Value</p>
                <p className="text-xl font-black text-slate-800 dark:text-white">RS. {totalInventoryValue.toLocaleString()}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-slate-300" />
              <div className="text-right flex-1 pl-8">
                <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest mb-1">Total Inventory Zakat</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">RS. {estimatedZakat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Zakat;
