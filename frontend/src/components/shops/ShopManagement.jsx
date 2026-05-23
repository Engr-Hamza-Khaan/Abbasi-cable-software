import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, Plus, MapPin, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

const ShopManagement = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', location: '', phone: '' });

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${user?.token}` },
  });

  const fetchShops = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${API_BASE}/shops`);
      setShops(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await axios.post(`${API_BASE}/shops`, form, getAuthConfig());
      setShops((prev) => [...prev, data]);
      setForm({ name: '', location: '', phone: '' });
      setSuccess('Shop created successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shop');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Shop Management</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Create and manage shops for the multi-branch system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8 space-y-5"
        >
          <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Add New Shop</h3>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm border border-green-200 dark:border-green-800">
              {success}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Shop Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              placeholder="Abbasi Cable - Branch Name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              placeholder="Area, City"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              placeholder="021-1234567"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-60 transition-all"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {submitting ? 'Creating...' : 'Create Shop'}
          </button>
        </form>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
              <Store className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              All Shops ({shops.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : shops.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">No shops yet. Create the first one.</p>
          ) : (
            <ul className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
              {shops.map((shop) => (
                <li
                  key={shop.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700"
                >
                  <p className="font-bold text-slate-800 dark:text-white">{shop.name}</p>
                  {shop.location && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {shop.location}
                    </p>
                  )}
                  {shop.phone && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {shop.phone}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopManagement;
