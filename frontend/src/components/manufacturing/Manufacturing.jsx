import React from 'react';
import { Zap, Factory, TrendingUp, AlertTriangle } from 'lucide-react';

const Manufacturing = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Manufacturing & Production</h2>
          <p className="text-slate-500 dark:text-slate-400">Track raw materials and cable production</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2">
          <Factory className="w-4 h-4" />
          Start New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Zap className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 dark:text-white">Active Machines</p>
          </div>
          <p className="text-3xl font-black text-blue-600">12 / 15</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 dark:text-white">Daily Output</p>
          </div>
          <p className="text-3xl font-black text-emerald-600">4,250m</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 dark:text-white">Raw Material Alert</p>
          </div>
          <p className="text-3xl font-black text-amber-600">2 Low</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto">
            <Factory className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Manufacturing Queue</h3>
          <p className="text-slate-500 dark:text-slate-400">Detailed production tracking and batch management is being integrated into your dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default Manufacturing;
