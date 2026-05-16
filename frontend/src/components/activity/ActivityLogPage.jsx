import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  Calendar,
  Clock,
  Filter,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Store,
  User,
} from 'lucide-react';
import { fetchActivityLogs } from '../../services/api';
import { useShop } from '../../context/ShopContext';

const TABS = [
  { id: 'admin', label: 'Admin Activity', icon: ShieldCheck },
  { id: 'employee', label: 'Employee Activity', icon: User },
];

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PK', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const ActivityLogPage = () => {
  const { selectedShopId } = useShop();
  const [activeTab, setActiveTab] = useState('admin');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError('');
      try {
        const params = {
          role: activeTab,
          page,
          limit: 50,
        };
        if (selectedShopId) params.shopId = selectedShopId;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const result = await fetchActivityLogs(params);
        setLogs(result.data);
        setPagination(result.pagination);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load activity logs');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [activeTab, selectedShopId, startDate, endDate]
  );

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-600" />
            Activity Log
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            All application actions are recorded with date and time. Admin and employee activity are shown separately.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadLogs(pagination.page)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
          <Filter className="w-4 h-4" />
          Filters
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => loadLogs(1)}
          className="px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 text-white text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          Apply
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">
            No activity recorded for {activeTab === 'admin' ? 'admins' : 'employees'} yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Shop</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="w-4 h-4 text-purple-500" />
                        {formatTime(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-slate-800 dark:text-white">
                        {log.User?.name || 'System'}
                      </div>
                      <div className="text-xs text-slate-500">@{log.User?.username || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      {log.Shop ? (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                          <Store className="w-3.5 h-3.5" />
                          {log.Shop.name}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">All shops</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                      {log.description}
                      {log.entityId && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">ID: {log.entityId}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200/50 dark:border-slate-700/50">
            <span className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => loadLogs(pagination.page - 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => loadLogs(pagination.page + 1)}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogPage;
