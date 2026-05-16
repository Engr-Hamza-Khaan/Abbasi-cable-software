import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Plus, Eye, Download, ArrowLeft, Search, UserPlus, Phone } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useShop } from '../../context/ShopContext';
import { fetchLedgerCustomers, upsertLedgerCustomer } from '../../services/api';

const Ledger = ({ sales = [], transactions = [], getWriteShopId }) => {
  const { getShopQueryParams } = useShop();
  const [metadataCustomers, setMetadataCustomers] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [view, setView] = useState('list'); // 'list' | 'preview'
  const [selectedCustomerName, setSelectedCustomerName] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state for adding metadata (opening balance/phone) for a customer
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', openingBalance: 0, openingDate: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchLedgerCustomers(getShopQueryParams());
        setMetadataCustomers(data);
      } catch (err) {
        console.error('Failed to load ledger customers', err);
      } finally {
        setLoadingMeta(false);
      }
    };
    load();
  }, [getShopQueryParams]);

  // Derive the list of all unique customers from sales, transactions, and metadata
  const allCustomers = useMemo(() => {
    const customerMap = new Map();

    // 1. Add from metadata (manual additions)
    metadataCustomers.forEach(c => {
      customerMap.set(c.name.toUpperCase(), {
        name: c.name.toUpperCase(),
        phone: c.phone || '',
        openingBalance: parseFloat(c.openingBalance) || 0,
        openingDate: c.openingDate || '2020-01-01'
      });
    });

    // 2. Add from sales
    sales.forEach(s => {
      if (s.customer) {
        const name = s.customer.toUpperCase();
        if (!customerMap.has(name)) {
          customerMap.set(name, { name, phone: s.contact || '', openingBalance: 0, openingDate: '2020-01-01' });
        } else {
          // Update phone if missing
          const existing = customerMap.get(name);
          if (!existing.phone && s.contact) existing.phone = s.contact;
        }
      }
    });

    return Array.from(customerMap.values());
  }, [metadataCustomers, sales]);

  // Filter customers based on search
  const filteredCustomersList = allCustomers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to get all transactions for a specific customer
  const getCustomerTransactions = (customerName) => {
    const name = customerName.toUpperCase();
    const metadata = metadataCustomers.find(c => c.name.toUpperCase() === name);

    let ledgerEntries = [];

    // 1. Add Opening Balance
    if (metadata) {
      ledgerEntries.push({
        id: 'opening-' + name,
        date: metadata.openingDate,
        particulars: 'OPENING PREVIOUS BALANCE',
        qty: '',
        rate: '',
        cash: 0,
        credit: 0,
        balance: metadata.openingBalance,
        isOpening: true,
        timestamp: new Date(metadata.openingDate).getTime()
      });
    }

    // 2. Add Sales
    sales.forEach(s => {
      if (s.customer && s.customer.toUpperCase() === name) {
        // The Sale entry (Credit side)
        ledgerEntries.push({
          id: 'sale-' + s.id,
          date: s.date,
          particulars: `${s.productName} (${s.size || ''} ${s.type || ''} ${s.core || ''})`.toUpperCase(),
          qty: s.length,
          rate: s.price,
          cash: 0,
          credit: s.total,
          timestamp: new Date(s.date).getTime()
        });

        // The immediate Payment (if any)
        if (s.paidAmount > 0) {
          ledgerEntries.push({
            id: 'sale-pay-' + s.id,
            date: s.date,
            particulars: `CASH RECEIVED (AGAINST SALE)`,
            qty: '',
            rate: '',
            cash: s.paidAmount,
            credit: 0,
            timestamp: new Date(s.date).getTime() + 1 // Ensure it comes after sale row
          });
        }
      }
    });

    // 3. Add Manual Cash Transactions
    // We look for transactions where the description contains the customer name
    // OR if it's explicitly linked via reference (if we had that)
    transactions.forEach(t => {
      const desc = t.description.toUpperCase();
      // Only include if it contains the name and it's NOT a sale we already processed
      // (SalesModule adds a cashFlowTx for every sale, we should ignore those to avoid double counting)
      if (t.source !== 'sale' && desc.includes(name)) {
        ledgerEntries.push({
          id: 'tx-' + t.id,
          date: t.date,
          particulars: t.description.toUpperCase(),
          qty: '',
          rate: '',
          cash: t.type === 'income' ? (t.cashAmount || t.amount) : 0,
          credit: t.type === 'expense' ? t.amount : (t.creditAmount || 0), // Credit in ledger increases balance (Sales), but here manual credit is confusing. Usually manual income is cash.
          timestamp: new Date(t.date).getTime()
        });
      }
    });

    // Sort by date/timestamp
    ledgerEntries.sort((a, b) => a.timestamp - b.timestamp);

    // Calculate Running Balance
    let runningBalance = 0;
    return ledgerEntries.map(entry => {
      if (entry.isOpening) {
        runningBalance = entry.balance;
      } else {
        runningBalance = runningBalance + (entry.credit || 0) - (entry.cash || 0);
      }
      return { ...entry, runningBalance };
    });
  };

  const handleAddMetadata = async (e) => {
    e.preventDefault();
    const shopId = getWriteShopId?.();
    if (!shopId) {
      alert('Please select a specific shop before saving customer metadata.');
      return;
    }

    try {
      const saved = await upsertLedgerCustomer(
        {
          name: customerForm.name.toUpperCase(),
          phone: customerForm.phone,
          openingBalance: customerForm.openingBalance,
          openingDate: customerForm.openingDate,
        },
        shopId
      );

      const existingIndex = metadataCustomers.findIndex(
        (c) => c.name.toUpperCase() === saved.name.toUpperCase()
      );
      if (existingIndex > -1) {
        const updated = [...metadataCustomers];
        updated[existingIndex] = saved;
        setMetadataCustomers(updated);
      } else {
        setMetadataCustomers([...metadataCustomers, saved]);
      }

      setShowCustomerModal(false);
      setCustomerForm({ name: '', phone: '', openingBalance: 0, openingDate: new Date().toISOString().split('T')[0] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const generatePDF = (customerName, entries, finalBalance, totalCredit, totalCash) => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("ABBASI CABLE", pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("High Quality Electric Cables & Wires", pageWidth / 2, 26, { align: 'center' });

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 35, pageWidth - 15, 35);

    // Ledger Info
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.text(`CUSTOMER LEDGER: ${customerName}`, 15, 45);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 15, 52);

    const headers = [['Date', 'Particulars', 'QTY', 'Rate', 'CASH (IN)', 'Credit (OUT)', 'Balance']];
    const body = entries.map(e => [
      new Date(e.date).toLocaleDateString('en-GB'),
      e.particulars,
      e.qty || '-',
      e.rate ? e.rate.toLocaleString() : '-',
      e.cash > 0 ? e.cash.toLocaleString() : '-',
      e.credit > 0 ? e.credit.toLocaleString() : '-',
      Math.abs(e.runningBalance).toLocaleString() + (e.runningBalance > 0 ? ' DR' : e.runningBalance < 0 ? ' CR' : '')
    ]);

    autoTable(doc, {
      startY: 60,
      head: headers,
      body: body,
      foot: [
        [
          { content: 'TOTAL PERIOD MOVEMENT', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: totalCash > 0 ? totalCash.toLocaleString() : '', styles: { halign: 'right', fontStyle: 'bold', textColor: [22, 163, 74] } },
          { content: totalCredit > 0 ? totalCredit.toLocaleString() : '', styles: { halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] } },
          { content: '', styles: {} }
        ],
        [
          { content: 'CURRENT CLOSING BALANCE', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold', textColor: [255, 255, 255], fillColor: [15, 23, 42] } },
          { content: `${Math.abs(finalBalance).toLocaleString()} ${finalBalance > 0 ? 'DR' : finalBalance < 0 ? 'CR' : ''}`, styles: { halign: 'right', fontStyle: 'bold', textColor: [255, 255, 255], fillColor: [15, 23, 42] } }
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      footStyles: { fillColor: [255, 255, 255], textColor: [15, 23, 42], fontSize: 10 },
      columnStyles: {
        0: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right', fontStyle: 'bold' }
      }
    });

    doc.save(`Ledger_${customerName.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const viewLedger = (name) => {
    setSelectedCustomerName(name);
    setView('preview');
  };

  if (view === 'preview' && selectedCustomerName) {
    const customerData = allCustomers.find(c => c.name === selectedCustomerName);
    const ledgerEntries = getCustomerTransactions(selectedCustomerName);
    const finalBalance = ledgerEntries.length > 0 ? ledgerEntries[ledgerEntries.length - 1].runningBalance : 0;
    const totalCredit = ledgerEntries.filter(e => !e.isOpening).reduce((sum, e) => sum + (e.credit || 0), 0);
    const totalCash = ledgerEntries.filter(e => !e.isOpening).reduce((sum, e) => sum + (e.cash || 0), 0);

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-bold"
          >
            <ArrowLeft className="w-5 h-5" /> Back to List
          </button>
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500 italic bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Automatically synced with transactions
            </p>
            <button
              onClick={() => generatePDF(selectedCustomerName, ledgerEntries, finalBalance, totalCredit, totalCash)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
          {/* Header */}
          <div className="p-8 text-center border-b-4 border-blue-600 bg-slate-50 print:bg-transparent">
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
              {selectedCustomerName}
            </h1>
            {customerData?.phone && <p className="text-slate-600 mt-2 font-bold flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> {customerData.phone}
            </p>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white print:bg-slate-200 print:text-black">
                  <th className="p-4 border border-slate-300 font-black text-center w-32 uppercase text-xs tracking-widest">Date</th>
                  <th className="p-4 border border-slate-300 font-black uppercase text-xs tracking-widest">Particulars</th>
                  <th className="p-4 border border-slate-300 font-black text-center w-20 uppercase text-xs tracking-widest">QTY</th>
                  <th className="p-4 border border-slate-300 font-black text-center w-24 uppercase text-xs tracking-widest">Rate</th>
                  <th className="p-4 border border-slate-300 font-black text-right w-32 uppercase text-xs tracking-widest">CASH (IN)</th>
                  <th className="p-4 border border-slate-300 font-black text-right w-32 uppercase text-xs tracking-widest">Credit (OUT)</th>
                  <th className="p-4 border border-slate-300 font-black text-right w-36 uppercase text-xs tracking-widest">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id} className={`border-b border-slate-200 hover:bg-blue-50 transition-colors ${entry.isOpening ? 'bg-amber-50 font-bold' : ''}`}>
                    <td className="p-4 border border-slate-300 text-center font-bold text-slate-600">
                      {new Date(entry.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4 border border-slate-300 font-bold text-slate-800">
                      {entry.particulars}
                    </td>
                    <td className="p-4 border border-slate-300 text-center font-bold text-slate-600">
                      {entry.qty || '-'}
                    </td>
                    <td className="p-4 border border-slate-300 text-center font-bold text-slate-600">
                      {entry.rate ? entry.rate.toLocaleString() : '-'}
                    </td>
                    <td className="p-4 border border-slate-300 text-right text-emerald-600 font-black">
                      {entry.cash > 0 ? entry.cash.toLocaleString() : '-'}
                    </td>
                    <td className="p-4 border border-slate-300 text-right text-rose-600 font-black">
                      {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                    </td>
                    <td className={`p-4 border border-slate-300 text-right font-black text-lg ${entry.runningBalance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {Math.abs(entry.runningBalance).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {/* Spacing rows */}
                {[...Array(3)].map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-slate-200 h-12">
                    <td className="border border-slate-300" colSpan="7"></td>
                  </tr>
                ))}

                {/* Subtotal */}
                <tr className="bg-slate-50 font-black">
                  <td className="p-4 border border-slate-300 text-right uppercase tracking-wider" colSpan="4">Total Period Movement</td>
                  <td className="p-4 border border-slate-300 text-right text-emerald-600">{totalCash.toLocaleString()}</td>
                  <td className="p-4 border border-slate-300 text-right text-rose-600">{totalCredit.toLocaleString()}</td>
                  <td className="p-4 border border-slate-300"></td>
                </tr>

                {/* Final Balance */}
                <tr className="bg-slate-900 text-white font-black text-xl print:bg-slate-100 print:text-black">
                  <td className="p-6 border border-slate-300 text-right uppercase tracking-widest" colSpan="6">Current Closing Balance</td>
                  <td className="p-6 border border-slate-300 text-right">
                    {Math.abs(finalBalance).toLocaleString()} {finalBalance > 0 ? 'DR' : finalBalance < 0 ? 'CR' : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            Customer Ledgers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Automatic sync enabled with Sales & Cash Flow</p>
        </div>
        <button
          onClick={() => {
            setCustomerForm({ name: '', phone: '', openingBalance: 0, openingDate: new Date().toISOString().split('T')[0] });
            setShowCustomerModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <UserPlus className="w-5 h-5" /> Add Customer Metadata
        </button>
      </div>

      {/* Search and Filters */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
        <input
          type="text"
          placeholder="Search customers by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl outline-none focus:border-blue-500 transition-all shadow-sm font-bold text-slate-800 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomersList.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 font-bold">No customers found matching "{searchTerm}"</p>
          </div>
        ) : (
          filteredCustomersList.map(customer => {
            const entries = getCustomerTransactions(customer.name);
            const balance = entries.length > 0 ? entries[entries.length - 1].runningBalance : 0;

            return (
              <div
                key={customer.name}
                onClick={() => viewLedger(customer.name)}
                className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${balance > 0 ? 'bg-rose-100 text-rose-600' : balance < 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                    {balance > 0 ? 'Due' : balance < 0 ? 'Advance' : 'Cleared'}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1 uppercase tracking-tight truncate">
                  {customer.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-6">
                  {customer.phone || 'No phone number'}
                </p>

                <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-700 pt-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Balance</p>
                    <p className={`text-xl font-black ${balance > 0 ? 'text-rose-600' : balance < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      Rs. {Math.abs(balance).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Metadata Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Customer Metadata</h2>
              <button onClick={() => setShowCustomerModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all">✕</button>
            </div>
            <form onSubmit={handleAddMetadata} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name *</label>
                <input
                  required type="text"
                  list="customer-list"
                  value={customerForm.name}
                  onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full mt-1 px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="Type name to find existing"
                />
                <datalist id="customer-list">
                  {allCustomers.map(c => <option key={c.name} value={c.name} />)}
                </datalist>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input
                  type="text"
                  value={customerForm.phone}
                  onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className="w-full mt-1 px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opening Date</label>
                  <input
                    required type="date"
                    value={customerForm.openingDate}
                    onChange={e => setCustomerForm({ ...customerForm, openingDate: e.target.value })}
                    className="w-full mt-1 px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Opening Balance</label>
                  <input
                    type="number"
                    value={customerForm.openingBalance}
                    onChange={e => setCustomerForm({ ...customerForm, openingBalance: e.target.value })}
                    className="w-full mt-1 px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setShowCustomerModal(false)} className="flex-1 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-500/20">Save Details</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;
