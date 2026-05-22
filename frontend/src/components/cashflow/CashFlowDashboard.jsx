import React, { useState } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Wallet, Plus, Filter, Search, Calendar as CalendarIcon, FileText, Download, ChevronDown, ChevronRight } from 'lucide-react';
import TransactionTable from './TransactionTable';
import AddTransactionModal from './AddTransactionModal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { createCashTransaction, deleteCashTransaction } from '../../services/api';

const CashFlowDashboard = ({ transactions, setTransactions, getWriteShopId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  const isWithinDateRange = (dateStr) => {
    if (!startDate && !endDate) return true;
    if (startDate && dateStr < startDate) return false;
    if (endDate && dateStr > endDate) return false;
    return true;
  };

  const dateFilteredTransactions = transactions.filter(t => isWithinDateRange(t.date));

  // Calculations
  const totalIncome = dateFilteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalCashIncome = dateFilteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.cashAmount !== undefined ? t.cashAmount : (t.amount - (t.onlineAmount || 0))), 0);

  const totalOnlineIncome = dateFilteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.onlineAmount || 0), 0);

  const totalExpense = dateFilteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalCashExpense = dateFilteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.cashAmount !== undefined ? t.cashAmount : (t.amount - (t.onlineAmount || 0))), 0);

  const totalOnlineExpense = dateFilteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.onlineAmount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === today);
  const todayIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const todayCashIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.cashAmount !== undefined ? t.cashAmount : (t.amount - (t.onlineAmount || 0))), 0);

  const todayOnlineIncome = todayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.onlineAmount || 0), 0);

  const todayExpense = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const todayCashExpense = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.cashAmount !== undefined ? t.cashAmount : (t.amount - (t.onlineAmount || 0))), 0);

  const todayOnlineExpense = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.onlineAmount || 0), 0);
  
  const todayCredit = todayTransactions.reduce((sum, t) => sum + Number(t.creditAmount || 0), 0);

  const filteredTransactions = dateFilteredTransactions
    .filter(t => (filterType === 'all' || t.type === filterType))
    .filter(t => (
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.source.toLowerCase().includes(searchTerm.toLowerCase())
    ))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleExport = () => {
    const dataToExport = filteredTransactions.map(tx => ({
      Date: tx.date,
      Type: tx.type.toUpperCase(),
      Cash: tx.cashAmount !== undefined ? tx.cashAmount : tx.amount,
      Credit: tx.creditAmount || 0,
      Total: tx.amount,
      Source: tx.source.charAt(0).toUpperCase() + tx.source.slice(1),
      Description: tx.description,
      Reference: tx.referenceId || 'N/A'
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CashFlow');
    XLSX.writeFile(wb, `CashFlow_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const title = 'Cash Flow Transaction Report';
    
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const headers = [['Date', 'Type', 'Description', 'Source', 'Cash', 'Online', 'Credit', 'Total']];

    const body = filteredTransactions.map(tx => [
      tx.date,
      tx.type.toUpperCase(),
      tx.description,
      tx.source,
      `${(tx.cashAmount !== undefined ? tx.cashAmount : (tx.type === 'income' ? tx.amount : tx.amount))?.toLocaleString() || 0}PKR`,
      `${tx.onlineAmount?.toLocaleString() || 0}PKR`,
      `${tx.creditAmount?.toLocaleString() || 0}PKR`,
      `${tx.amount?.toLocaleString() || 0}PKR`
    ]);

    autoTable(doc, {
      head: headers,
      body: body,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] } // Indigo-600
    });

    doc.save(`CashFlow_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const addManualTransaction = async (newTx) => {
    const shopId = getWriteShopId?.();
    if (!shopId) {
      alert('Please select a specific shop before adding transactions.');
      return;
    }
    try {
      const transaction = await createCashTransaction(
        { ...newTx, source: 'manual' },
        shopId
      );
      setTransactions([transaction, ...transactions]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add transaction');
    }
  };

  const deleteTransaction = async (id) => {
    const tx = transactions.find((t) => t.id === id);
    if (tx?.source && tx.source !== 'manual') {
      alert('Transactions linked to sales/purchases cannot be deleted here.');
      return;
    }
    try {
      await deleteCashTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Cash Flow Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor all income and expenses in real-time</p>
        </div>
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
              Inflow
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">Rs. {totalIncome.toLocaleString()}</h3>
            <div className="mt-3 flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center px-2.5 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-medium">
                <span>Cash</span>
                <span>Rs. {totalCashIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-2.5 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-medium">
                <span>Online</span>
                <span>Rs. {totalOnlineIncome.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-1 rounded-full">
              Outflow
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">Rs. {totalExpense.toLocaleString()}</h3>
            <div className="mt-3 flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center px-2.5 py-1.5 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-600 font-medium">
                <span>Cash</span>
                <span>Rs. {totalCashExpense.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center px-2.5 py-1.5 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-600 font-medium">
                <span>Online</span>
                <span>Rs. {totalOnlineExpense.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
              <Wallet className="w-6 h-6" />
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${netBalance >= 0 ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-amber-600 bg-amber-50 dark:bg-amber-900/20"}`}>
              {netBalance >= 0 ? 'Profit' : 'Loss'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Balance</p>
            <h3 className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? 'text-slate-800 dark:text-white' : 'text-rose-600'}`}>
              Rs. {Math.abs(netBalance).toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Today Card — first on mobile, last on md+ */}
        <div className="order-first md:order-none bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all">
          <div className="flex items-center space-x-2 text-slate-300 mb-4">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Today's Summary</span>
          </div>
          <div className="space-y-3">
            {/* Income Accordion */}
            <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
              <button 
                onClick={() => setIsIncomeOpen(!isIncomeOpen)}
                className="w-full flex justify-between items-center p-3 text-sm hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {isIncomeOpen ? <ChevronDown className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4 text-emerald-400" />}
                  <span className="text-slate-300">In (Total):</span>
                </div>
                <span className="text-emerald-400 font-bold">Rs. {todayIncome.toLocaleString()}</span>
              </button>
              
              {isIncomeOpen && (
                <div className="p-3 pt-0 space-y-2 bg-slate-800/30">
                  <div className="flex justify-between items-center text-xs pl-6">
                    <span className="text-slate-400">Cash:</span>
                    <span className="text-emerald-500/80 font-semibold">Rs. {todayCashIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pl-6">
                    <span className="text-slate-400">Online:</span>
                    <span className="text-emerald-500/80 font-semibold">Rs. {todayOnlineIncome.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Expense Accordion */}
            <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
              <button 
                onClick={() => setIsExpenseOpen(!isExpenseOpen)}
                className="w-full flex justify-between items-center p-3 text-sm hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {isExpenseOpen ? <ChevronDown className="w-4 h-4 text-rose-400" /> : <ChevronRight className="w-4 h-4 text-rose-400" />}
                  <span className="text-slate-300">Out (Total):</span>
                </div>
                <span className="text-rose-400 font-bold">Rs. {todayExpense.toLocaleString()}</span>
              </button>
              
              {isExpenseOpen && (
                <div className="p-3 pt-0 space-y-2 bg-slate-800/30">
                  <div className="flex justify-between items-center text-xs pl-6">
                    <span className="text-slate-400">Cash:</span>
                    <span className="text-rose-400/80 font-semibold">Rs. {todayCashExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pl-6">
                    <span className="text-slate-400">Online:</span>
                    <span className="text-rose-400/80 font-semibold">Rs. {todayOnlineExpense.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Credit:</span>
              <span className="text-amber-400 font-bold">Rs. {todayCredit.toLocaleString()}</span>
            </div>
            <div className="h-px bg-slate-700 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Net:</span>
              <span className={`font-bold ${todayIncome - todayExpense >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                Rs. {(todayIncome - todayExpense).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden transition-all">
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-slate-800 dark:text-white font-bold">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Transaction History</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative group">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64 text-slate-800 dark:text-white"
              />
            </div>

            {/* Date Filters */}
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-sm">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none outline-none text-[11px] dark:text-white font-bold"
              />
              <span className="text-slate-400 text-[10px] font-bold">TO</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none outline-none text-[11px] dark:text-white font-bold"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
              <button 
                onClick={() => setFilterType('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType('income')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Income
              </button>
              <button 
                onClick={() => setFilterType('expense')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'expense' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Expense
              </button>
            </div>

            <div className="flex gap-1 items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-1">
              <button 
                onClick={handleExport}
                className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
              <button 
                onClick={handleExportPDF}
                className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 text-xs font-bold transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        <TransactionTable 
          transactions={filteredTransactions} 
          onDelete={deleteTransaction}
        />
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={addManualTransaction} 
      />
    </div>
  );
};

export default CashFlowDashboard;
