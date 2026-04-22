import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, FileText, Download, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

const Reports = ({ purchases, sales }) => {
  const [activeTab, setActiveTab] = useState('purchases');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const handleExport = () => {
    const dataToExport = activeTab === 'purchases' ? purchaseData : salesData;
    const fileName = activeTab === 'purchases' ? 'Purchase_History.xlsx' : 'Sales_History.xlsx';

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'purchases' ? 'Purchases' : 'Sales');
    XLSX.writeFile(wb, fileName);
  };

  const purchaseData = purchases.filter(p =>
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const salesData = sales.filter(s =>
    s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPurchaseValue = purchases.reduce((acc, p) => acc + (p.total || 0), 0);
  const totalSalesUnits = sales.reduce((acc, s) => acc + (s.quantity || 0), 0);

  return (
    <div className="space-y-8">
      {/* Report Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Purchase Value</p>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RS. {totalPurchaseValue.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Units Issued</p>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{totalSalesUnits.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Records Processed</p>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{purchases.length + sales.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Month Avg</p>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">RS. {(totalPurchaseValue / (purchases.length || 1)).toFixed(0)}</p>
        </div>
      </div>

      {/* Tables and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('purchases')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${activeTab === 'purchases' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
              >
                Purchase History
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${activeTab === 'sales' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
              >
                Sales History
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search records..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'purchases' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-4">Product</th>
                  <th className="px-8 py-4">Quantity</th>
                  <th className="px-8 py-4">Unit Price</th>
                  <th className="px-8 py-4">Total</th>
                  <th className="px-8 py-4">Vendor</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {purchaseData.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                    <td className="px-8 py-5 font-semibold text-slate-800 dark:text-slate-200">{p.productName}</td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400">{p.quantity}</td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400">{p.unitPrice?.toLocaleString()}PKR</td>
                    <td className="px-8 py-5 font-bold text-slate-800 dark:text-white">{p.total?.toLocaleString()}PKR</td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400">{p.vendor}</td>
                    <td className="px-8 py-5 text-slate-500 dark:text-slate-500 text-sm whitespace-nowrap">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-4">Product</th>
                  <th className="px-8 py-4">Quantity Issued</th>
                  <th className="px-8 py-4">Customer / Project</th>
                  <th className="px-8 py-4">Total Value</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {salesData.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                    <td className="px-8 py-5 font-semibold text-slate-800 dark:text-slate-200">{s.productName}</td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400">{s.quantity}</td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400">{s.customer}</td>
                    <td className="px-8 py-5 font-bold text-slate-800 dark:text-white">{s.total?.toLocaleString()}PKR</td>
                    <td className="px-8 py-5 text-slate-500 dark:text-slate-500 text-sm whitespace-nowrap">{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {((activeTab === 'purchases' && purchaseData.length === 0) || (activeTab === 'sales' && salesData.length === 0)) && (
            <div className="p-20 text-center text-slate-400 italic">
              No data found for the current search/filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
