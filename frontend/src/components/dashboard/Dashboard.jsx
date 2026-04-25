import React, { useState } from 'react';
import StatsGrid from "./StatsGrid"
import ChartSection from "./ChartSection"
import TableSection from './TableSection'
import ActivityFeed from "./ActivityFeed"
import { Calendar } from 'lucide-react'

function Dashboard({ products, sales, purchases, transactions, expenses = [] }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isWithinDateRange = (dateStr) => {
    if (!startDate && !endDate) return true;
    const d = new Date(dateStr).toISOString().split('T')[0];
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  };

  const filteredSales = sales.filter(s => isWithinDateRange(s.date));
  const filteredPurchases = purchases.filter(p => isWithinDateRange(p.date));
  const filteredTransactions = transactions.filter(t => isWithinDateRange(t.date));
  const filteredExpenses = expenses.filter(e => isWithinDateRange(e.date));

  return (
    <div className="space-y-6 ">
      {/* Date Filter Bar */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-2.5 shadow-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Date Range:</span>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="text-slate-400 text-xs font-bold">TO</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-[10px] font-bold text-red-500 hover:text-red-600 px-2 underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid products={products} sales={filteredSales} purchases={filteredPurchases} transactions={filteredTransactions} expenses={filteredExpenses} />
      
      {/* Charts Section */}
      <ChartSection transactions={filteredTransactions} />
      
      {/* Table Section */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
        <div className='xl:col-span-2'>
          <TableSection products={products} sales={filteredSales} />
        </div>
        <div className='space-y-6'>
          <ActivityFeed transactions={filteredTransactions} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
