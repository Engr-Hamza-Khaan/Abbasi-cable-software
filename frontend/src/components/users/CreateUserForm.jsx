import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock, AlertCircle, Loader2, ShieldCheck, Store } from 'lucide-react';

import { apiUrl } from '../../config/api';

const CreateUserForm = ({ role, onSubmit, submitting, error, success, onClearMessages }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopId, setShopId] = useState('');
  const [shops, setShops] = useState([]);
  const [fetchingShops, setFetchingShops] = useState(role === 'employee');

  useEffect(() => {
    if (role !== 'employee') return;

    const fetchShops = async () => {
      try {
        const { data } = await axios.get(apiUrl('/shops'));
        setShops(data);
      } catch (err) {
        console.error('Error fetching shops:', err);
      } finally {
        setFetchingShops(false);
      }
    };
    fetchShops();
  }, [role]);

  const resetForm = () => {
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setShopId('');
  };

  useEffect(() => {
    if (success) resetForm();
  }, [success]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onClearMessages?.();

    if (role === 'employee' && !shopId) return;

    onSubmit({
      name,
      username,
      email,
      password,
      role,
      shopId: role === 'employee' ? shopId : null,
    });
  };

  const isAdmin = role === 'admin';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Username *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            placeholder="user_123"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email *</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          placeholder="user@example.com"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            placeholder="••••••••"
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
        </p>
      </div>

      {isAdmin && (
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Admin accounts have access to all shops.
        </p>
      )}

      {role === 'employee' && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assign Shop *</label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              required
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none"
            >
              <option value="" disabled>Select a Shop</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
          {fetchingShops && (
            <p className="text-xs text-slate-500 animate-pulse">Loading shops...</p>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-xl border border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm rounded-xl border border-green-200 dark:border-green-800">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || (role === 'employee' && fetchingShops)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-60 transition-all"
      >
        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
        {submitting ? 'Creating...' : isAdmin ? 'Create Admin' : 'Create Employee'}
      </button>
    </form>
  );
};

export default CreateUserForm;
