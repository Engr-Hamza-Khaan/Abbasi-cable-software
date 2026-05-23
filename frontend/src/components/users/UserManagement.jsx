import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, Mail, Store, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CreateUserForm from './CreateUserForm';
import EditUserModal from './EditUserModal';

const API_BASE = 'http://localhost:5000/api';

const UserManagement = ({
  role,
  title,
  subtitle,
  formTitle,
  listTitle,
  listIcon: ListIcon,
  emptyMessage,
}) => {
  const { user, createUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const token = user?.token;

  const getAuthConfig = useCallback(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const fetchUsers = useCallback(
    async (silent = false) => {
      if (!token) return;
      if (!silent) setLoading(true);
      setListError('');
      try {
        const { data } = await axios.get(`${API_BASE}/users`, getAuthConfig());
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setListError(err.response?.data?.message || 'Failed to load users');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, getAuthConfig]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const upsertUser = (savedUser) => {
    setUsers((prev) => {
      const idx = prev.findIndex((u) => u.id === savedUser.id);
      if (idx === -1) return [savedUser, ...prev];
      const next = [...prev];
      next[idx] = savedUser;
      return next;
    });
  };

  const handleCreate = async (formData) => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    const result = await createUser(formData);
    if (result.success) {
      setSuccess(`${role === 'admin' ? 'Admin' : 'Employee'} account created successfully.`);
      if (result.user?.id) {
        upsertUser(result.user);
      }
      await fetchUsers(true);
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async (target) => {
    if (!window.confirm(`Delete ${target.name}? This cannot be undone.`)) return;

    setDeletingId(target.id);
    setListError('');
    try {
      await axios.delete(`${API_BASE}/users/${target.id}`, getAuthConfig());
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
    } catch (err) {
      setListError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
              <ListIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{formTitle}</h3>
          </div>
          <CreateUserForm
            role={role}
            onSubmit={handleCreate}
            submitting={submitting}
            error={error}
            success={success}
            onClearMessages={() => {
              setError('');
              setSuccess('');
            }}
          />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-xl">
              <ListIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {listTitle} ({users.length})
            </h3>
          </div>

          {listError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm border border-red-200 dark:border-red-800">
              {listError}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">{emptyMessage}</p>
          ) : (
            <ul className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
              {users.map((item) => (
                <li
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">@{item.username}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.email}</span>
                      </p>
                      {item.Shop && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Store className="w-3.5 h-3.5 shrink-0" />
                          {item.Shop.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingUser(item)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          role={role}
          token={token}
          onClose={() => setEditingUser(null)}
          onSaved={(updated) => upsertUser(updated)}
        />
      )}
    </div>
  );
};

export default UserManagement;
