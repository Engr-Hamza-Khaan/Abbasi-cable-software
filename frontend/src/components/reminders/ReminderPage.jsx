import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Plus, Bell, CheckCircle, AlertCircle, Phone, Calendar, DollarSign, Send, RefreshCw } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

const API_URL = 'http://localhost:5000/api/reminders/customers';

const ReminderPage = () => {
  const { getShopQueryParams } = useShop();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sendingSmsId, setSendingSmsId] = useState(null);
  const [ledgerCustomers, setLedgerCustomers] = useState([]);

  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    dueAmount: '',
    dueDate: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadLedgerCustomers = async () => {
      try {
        const { fetchLedgerCustomers: fetchLedgerApi } = await import('../../services/api');
        const data = await fetchLedgerApi(getShopQueryParams());
        setLedgerCustomers(data);
      } catch (err) {
        console.error('Failed to load ledger customers for reminders', err);
      }
    };
    loadLedgerCustomers();
  }, [selectedShopId, getShopQueryParams]);

  useEffect(() => {
    fetchDues();
  }, [selectedShopId]);

  const fetchDues = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, { params: getShopQueryParams() });
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch reminders:', err);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');

    // Auto-fill phone if selecting a ledger customer
    if (name === 'customerName') {
      const selected = ledgerCustomers.find(c => c.name.toUpperCase() === value.toUpperCase());
      if (selected && selected.phone) {
        setFormData(prev => ({ ...prev, phoneNumber: selected.phone }));
      }
    }
  };

  const validateForm = () => {
    if (!formData.customerName) return 'Customer name is required';
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) return 'Valid phone number is required';
    if (!formData.dueAmount || isNaN(formData.dueAmount) || Number(formData.dueAmount) <= 0) return 'Valid amount is required';
    if (!formData.dueDate) return 'Due date is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_URL, formData, { params: getShopQueryParams() });
      if (response.data.success) {
        setSuccess('Reminder scheduled successfully!');
        setShowModal(false);
        setFormData({ customerName: '', phoneNumber: '', dueAmount: '', dueDate: '' });
        fetchDues();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule reminder');
    }
    setLoading(false);
  };

  const handleMarkPaid = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, { paymentStatus: 'Paid' }, { params: getShopQueryParams() });
      fetchDues();
    } catch (err) {
      console.error('Error marking as paid:', err);
    }
  };

  const handleSendSms = async (id) => {
    setSendingSmsId(id);
    console.log(`[Frontend Debug] Attempting to send SMS for Customer ID: ${id}`);
    console.log(`[Frontend Debug] Request URL: ${API_URL}/${id}/send-sms`);
    try {
      const response = await axios.post(`${API_URL}/${id}/send-sms`, null, { params: getShopQueryParams() });
      console.log(`[Frontend Debug] Success API Response:`, response.data);
      if (response.data.success) {
        setSuccess('SMS sent successfully!');
        fetchDues();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error(`[Frontend Debug] API Error Response:`, err.response?.data || err.message);
      setError(err.response?.data?.error || 'Failed to send SMS');
      setTimeout(() => setError(''), 3000);
    }
    setSendingSmsId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            Customer Dues Reminders
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Automated SMS alerts for pending payments.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchDues} 
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh List"
          >
            <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-300 ${loading && 'animate-spin'}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-blue-500/30 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Schedule Reminder
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm animate-slide-down">
          <CheckCircle className="w-5 h-5" /> {success}
        </div>
      )}
      
      {error && !showModal && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400 font-semibold shadow-sm animate-slide-down">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-black uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400">Customer</th>
                <th className="p-4 font-black uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400">Contact</th>
                <th className="p-4 font-black uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400 text-right">Due Amount</th>
                <th className="p-4 font-black uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400 text-center">Due Date</th>
                <th className="p-4 font-black uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400 text-center">Status</th>
                <th className="p-4 font-black uppercase text-xs tracking-wider text-slate-500 dark:text-slate-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No reminders found. Create one to get started.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200 uppercase">{c.customerName}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" /> {c.phoneNumber}
                      </div>
                    </td>
                    <td className="p-4 text-right font-black text-rose-600 dark:text-rose-400">
                      Rs. {Number(c.dueAmount).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        {new Date(c.dueDate).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {c.paymentStatus === 'Paid' ? (
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/50">
                          Paid
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold text-xs rounded-full uppercase tracking-wider border border-amber-200 dark:border-amber-800/50">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {c.paymentStatus !== 'Paid' && (
                          <>
                            <button
                              onClick={() => handleSendSms(c.id)}
                              disabled={sendingSmsId === c.id}
                              className={`p-2 rounded-lg flex items-center justify-center transition-all ${c.reminderSent ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500' : 'bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white'}`}
                              title={c.reminderSent ? "Reminder already sent" : "Send SMS Now"}
                            >
                              {sendingSmsId === c.id ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleMarkPaid(c.id)}
                              className="p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white rounded-lg transition-all"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {c.paymentStatus === 'Paid' && (
                          <span className="text-slate-400 text-sm italic">Cleared</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700 animate-slide-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
              <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" /> Schedule Reminder
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-semibold rounded-xl border border-rose-200 dark:border-rose-800">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Customer Name</label>
                <input
                  type="text"
                  name="customerName"
                  list="ledger-customers"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="Select or enter name"
                />
                <datalist id="ledger-customers">
                  {ledgerCustomers.map(c => <option key={c.name} value={c.name} />)}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
                    placeholder="+923000000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Due Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      name="dueAmount"
                      value={formData.dueAmount}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Save & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderPage;
