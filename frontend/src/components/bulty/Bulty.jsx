import React, { useState, useEffect } from 'react';
import { 
  Truck, Search, Plus, Filter, Download, X, 
  Trash2, Edit2, Calendar, Hash, User, 
  FileText, CreditCard, Calculator, MoreVertical
} from 'lucide-react';

const Bulty = () => {
  const [showModal, setShowModal] = useState(false);
  const [bulties, setBulties] = useState(() => {
    const saved = localStorage.getItem('bulty-records');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [formData, setFormData] = useState({
    agencyName: '',
    date: new Date().toISOString().split('T')[0],
    bultyNo: '',
    item: '',
    qty: '',
    weight: '',
    weightRate: '',
    mazduri: '',
    lifterCharges: '',
    localRent: '',
    nakadKharcha: '',
    sender: '',
    payment: '',
    paymentDescription: ''
  });

  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('bulty-records', JSON.stringify(bulties));
  }, [bulties]);

  // Calculations
  const calculateTotal = (weight, rate) => (parseFloat(weight) || 0) * (parseFloat(rate) || 0);
  
  const calculateInTotal = (weight, rate, mazduri, lifter, rent, nakad) => {
    const total = calculateTotal(weight, rate);
    return total + (parseFloat(mazduri) || 0) + (parseFloat(lifter) || 0) + (parseFloat(rent) || 0) + (parseFloat(nakad) || 0);
  };

  const calculateBalance = (inTotal, payment) => inTotal - (parseFloat(payment) || 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const weight = parseFloat(formData.weight) || 0;
    const rate = parseFloat(formData.weightRate) || 0;
    const mazduri = parseFloat(formData.mazduri) || 0;
    const lifter = parseFloat(formData.lifterCharges) || 0;
    const rent = parseFloat(formData.localRent) || 0;
    const nakad = parseFloat(formData.nakadKharcha) || 0;
    const payment = parseFloat(formData.payment) || 0;

    const total = calculateTotal(weight, rate);
    const inTotal = calculateInTotal(weight, rate, mazduri, lifter, rent, nakad);
    const balance = calculateBalance(inTotal, payment);

    const newRecord = {
      ...formData,
      id: editId || Date.now(),
      total,
      inTotal,
      balance,
      weight,
      weightRate: rate,
      mazduri,
      lifterCharges: lifter,
      localRent: rent,
      nakadKharcha: nakad,
      payment
    };

    if (editId) {
      setBulties(bulties.map(b => b.id === editId ? newRecord : b));
    } else {
      setBulties([newRecord, ...bulties]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      agencyName: '',
      date: new Date().toISOString().split('T')[0],
      bultyNo: '',
      item: '',
      qty: '',
      weight: '',
      weightRate: '',
      mazduri: '',
      lifterCharges: '',
      localRent: '',
      nakadKharcha: '',
      sender: '',
      payment: '',
      paymentDescription: ''
    });
    setEditId(null);
    setShowModal(false);
  };

  const handleEdit = (record) => {
    setFormData(record);
    setEditId(record.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this bulty record?')) {
      setBulties(bulties.filter(b => b.id !== id));
    }
  };

  const filteredBulties = bulties.filter(b => 
    b.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.bultyNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInTotal = bulties.reduce((sum, b) => sum + b.inTotal, 0);
  const totalBalance = bulties.reduce((sum, b) => sum + b.balance, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Truck className="w-8 h-8 text-blue-600" />
            Bulty Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Track and manage transport receipts and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            New Bulty
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Bulties</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{bulties.length}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total In-Total</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">Rs. {totalInTotal.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Balance</p>
          <p className="text-2xl font-bold text-red-600 mt-1">Rs. {totalBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Agency, Bulty #, or Sender..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date / Bulty #</th>
                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Agency / Sender</th>
                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item / Qty</th>
                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight / Rate</th>
                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">In-Total</th>
                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Payment</th>
                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Balance</th>
                <th className="px-4 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredBulties.length > 0 ? (
                filteredBulties.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-slate-800 dark:text-white">{b.date}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">#{b.bultyNo}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-slate-800 dark:text-white">{b.agencyName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">S: {b.sender}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-800 dark:text-white">{b.item}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Q: {b.qty}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-800 dark:text-white">{b.weight} kg</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">@ {b.weightRate}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-sm font-bold text-slate-800 dark:text-white">Rs. {b.inTotal.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-sm font-medium text-green-600">Rs. {b.payment.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className={`text-sm font-bold ${b.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Rs. {b.balance.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(b)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(b.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-20 text-center text-slate-500 dark:text-slate-400">
                    No bulty records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in duration-300">
            <div className="sticky top-0 bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {editId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editId ? 'Edit Bulty Record' : 'New Bulty Entry'}
              </h2>
              <button 
                onClick={resetForm}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Primary Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Agency Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input name="agencyName" required value={formData.agencyName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="date" name="date" required value={formData.date} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bulty #</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input name="bultyNo" required value={formData.bultyNo} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Item Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Item</label>
                  <input name="item" required value={formData.item} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Qty</label>
                  <input name="qty" required value={formData.qty} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Weight (KG)</label>
                  <input type="number" step="0.01" name="weight" required value={formData.weight} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rate (per KG)</label>
                  <input type="number" step="0.01" name="weightRate" required value={formData.weightRate} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
                </div>
              </div>

              {/* Charges */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Additional Charges
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Mazduri</label>
                    <input type="number" name="mazduri" value={formData.mazduri} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Lifter Loading</label>
                    <input type="number" name="lifterCharges" value={formData.lifterCharges} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Local Rent</label>
                    <input type="number" name="localRent" value={formData.localRent} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Nakad Kharcha</label>
                    <input type="number" name="nakadKharcha" value={formData.nakadKharcha} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
                  </div>
                </div>
              </div>

              {/* Sender & Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sender</label>
                    <input name="sender" required value={formData.sender} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Description</label>
                    <textarea name="paymentDescription" rows="2" value={formData.paymentDescription} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none"></textarea>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Amount</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="payment" required value={formData.payment} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl font-bold" />
                    </div>
                  </div>

                  {/* Real-time Summary */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Base Total (W x R):</span>
                        <span>Rs. {calculateTotal(formData.weight, formData.weightRate).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-800 dark:text-white text-base pt-2 border-t border-blue-200 dark:border-blue-800">
                        <span>IN-TOTAL:</span>
                        <span>Rs. {calculateInTotal(formData.weight, formData.weightRate, formData.mazduri, formData.lifterCharges, formData.localRent, formData.nakadKharcha).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-red-600">
                        <span>BALANCE:</span>
                        <span>Rs. {calculateBalance(calculateInTotal(formData.weight, formData.weightRate, formData.mazduri, formData.lifterCharges, formData.localRent, formData.nakadKharcha), formData.payment).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
                >
                  {editId ? 'Update Bulty Record' : 'Save Bulty Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bulty;
