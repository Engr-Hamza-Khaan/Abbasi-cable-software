import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, FileText, Calendar as CalendarIcon, Save, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const AddTransactionModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    credit: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount && !formData.credit) {
      alert("Please enter at least Cash or Credit amount");
      return;
    }
    onSubmit({
      ...formData,
      amount: Number(formData.amount || 0) + Number(formData.credit || 0),
      cashAmount: Number(formData.amount || 0),
      creditAmount: Number(formData.credit || 0)
    });
    setFormData({
      type: 'income',
      amount: '',
      credit: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    onClose();
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20"
          >
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">New Transaction</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Cash Flow Entry</p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-2xl transition-all hover:rotate-90"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Type Toggle */}
              <div className="bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[1.5rem] border border-slate-200/50 dark:border-slate-700 flex">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-2xl text-sm font-black transition-all ${formData.type === 'income'
                    ? 'bg-white dark:bg-emerald-600 text-emerald-600 dark:text-white shadow-xl shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
                    }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>INCOME</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-2xl text-sm font-black transition-all ${formData.type === 'expense'
                    ? 'bg-white dark:bg-rose-600 text-rose-600 dark:text-white shadow-xl shadow-rose-500/10'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
                    }`}
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>EXPENSE</span>
                </button>
              </div>

              <div className="space-y-5">
                {/* Cash and Credit Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Cash Amount */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Cash (Rs.)</label>
                    <div className="flex items-center bg-slate-50 dark:bg-slate-900 border-2 border-slate-200/60 dark:border-slate-700 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all group overflow-hidden">
                      <div className="pl-4 pr-1 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        {/* <DollarSign className="w-4 h-4" /> */}
                      </div>
                      <input
                        type="number"
                        value={formData.amount}
                        autoFocus
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="flex-1 py-3 pr-4 bg-transparent outline-none text-slate-800 dark:text-white font-black text-base"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Credit Amount */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Credit (Rs.)</label>
                    <div className="flex items-center bg-slate-50 dark:bg-slate-900 border-2 border-slate-200/60 dark:border-slate-700 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all group overflow-hidden">
                      <div className="pl-4 pr-1 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        {/* <DollarSign className="w-4 h-4" /> */}
                      </div>
                      <input
                        type="number"
                        value={formData.credit}
                        onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                        className="flex-1 py-3 pr-4 bg-transparent outline-none text-slate-800 dark:text-white font-black text-base"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Date and Description */}
                <div className="grid grid-cols-1 gap-5">
                  {/* Date */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Date</label>
                    <div className="flex items-center bg-slate-50 dark:bg-slate-900 border-2 border-slate-200/60 dark:border-slate-700 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all group overflow-hidden">
                      <div className="px-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <CalendarIcon className="w-5 h-5" />
                      </div>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="flex-1 py-4 pr-4 bg-transparent outline-none text-slate-800 dark:text-white font-bold [color-scheme:light] dark:[color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Description</label>
                    <div className="flex items-start bg-slate-50 dark:bg-slate-900 border-2 border-slate-200/60 dark:border-slate-700 rounded-2xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all group overflow-hidden">
                      <div className="px-4 pt-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <textarea
                        required
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="flex-1 py-4 pr-4 bg-transparent outline-none text-slate-800 dark:text-white font-bold resize-none"
                        placeholder="What was this for?"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 px-6 rounded-2xl text-slate-400 dark:text-slate-500 font-black hover:bg-slate-100 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2 uppercase tracking-widest text-[10px]"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Entry</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default AddTransactionModal;
