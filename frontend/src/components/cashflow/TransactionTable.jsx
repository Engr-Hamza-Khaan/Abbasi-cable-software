import React from 'react';
import { ArrowUpRight, ArrowDownRight, Tag, Trash2, Calendar as CalendarIcon, Link as LinkIcon, Info } from 'lucide-react';

const TransactionTable = ({ transactions, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <div className="p-20 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full mb-4">
          <Info className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Transactions Found</h3>
        <p className="text-slate-500 dark:text-slate-400">There are no transactions matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-900/50">
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transaction</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cash</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Online</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Credit</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                  <CalendarIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{tx.date}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{tx.description}</p>
                    {tx.color && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-500 uppercase border border-slate-200 dark:border-slate-700 w-fit">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.color.toLowerCase() }}></span>
                        {tx.color}
                      </span>
                    )}
                  </div>
                  {tx.referenceId && (
                    <div className="flex items-center space-x-1 mt-1 text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                      <LinkIcon className="w-3 h-3" />
                      <span>Ref: #{tx.referenceId}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Rs. {Number(tx.cashAmount || 0).toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    Rs. {Number(tx.onlineAmount || 0).toLocaleString()}
                  </span>
                  {tx.paymentDetail && (
                    <span className="text-[9px] text-slate-400 font-bold uppercase">TID: {tx.paymentDetail}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`text-sm font-bold ${tx.creditAmount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                  Rs. {Number(tx.creditAmount || 0).toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  tx.source === 'sale' ? 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800' :
                  tx.source === 'purchase' ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800' :
                  'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
                }`}>
                  <Tag className="w-3 h-3" />
                  <span className="capitalize">{tx.source}</span>
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className={`flex items-center font-bold text-base ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    Rs. {Number(tx.amount).toLocaleString()}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tx.type}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                {tx.source === 'manual' ? (
                  <button 
                    onClick={() => onDelete(tx.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400 italic font-medium px-3">Linked</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
