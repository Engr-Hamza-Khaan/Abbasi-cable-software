import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, FileText, Download, Calendar, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = ({ purchases, sales }) => {
  const [activeTab, setActiveTab] = useState('purchases');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isWithinDateRange = (dateStr) => {
    if (!startDate && !endDate) return true;
    const date = dateStr; // Assuming YYYY-MM-DD
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    return true;
  };

  const handleExport = () => {
    const dataToExport = activeTab === 'purchases' ? purchaseData : salesData;
    const fileName = activeTab === 'purchases' ? 'Purchase_History.xlsx' : 'Sales_History.xlsx';

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'purchases' ? 'Purchases' : 'Sales');
    XLSX.writeFile(wb, fileName);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
    const dataToExport = activeTab === 'purchases' ? purchaseData : salesData;
    const title = activeTab === 'purchases' ? 'Purchase History Report' : 'Sales History Report';
    
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const headers = activeTab === 'purchases' 
      ? [['Product', 'Color', 'Specs', 'Length', 'Total', 'Cash', 'Online', 'Vendor', 'Date']]
      : [['Product', 'Color', 'Specs', 'Length', 'Total', 'Cash', 'Online', 'Customer', 'Date']];

    const body = dataToExport.map(row => {
      const specs = `${row.size || ''} ${row.type || ''} ${row.core || ''}`.trim() || '-';
      if (activeTab === 'purchases') {
        return [
          row.productName,
          row.color || '-',
          specs,
          row.length,
          `${row.total?.toLocaleString()}PKR`,
          `${row.cashAmount?.toLocaleString() || 0}PKR`,
          `${row.onlineAmount?.toLocaleString() || 0}PKR`,
          row.vendor,
          row.date
        ];
      } else {
        return [
          row.productName,
          row.color || '-',
          specs,
          row.length,
          `${row.total?.toLocaleString()}PKR`,
          `${row.cashAmount?.toLocaleString() || 0}PKR`,
          `${row.onlineAmount?.toLocaleString() || 0}PKR`,
          row.customer,
          row.date
        ];
      }
    });

    autoTable(doc, {
      head: headers,
      body: body,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] } // Blue-600
    });

    doc.save(`${title.replace(/ /g, '_')}.pdf`);
  };

  const generateInvoice = (sale) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("ABBASI CABLE", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("High Quality Electric Cables & Wires", pageWidth / 2, 26, { align: 'center' });
    doc.text("Contact: +92 XXX XXXXXXX | Address: Industrial Area, City", pageWidth / 2, 31, { align: 'center' });
    
    // Divider
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.line(15, 38, pageWidth - 15, 38);
    
    // Invoice Details
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.text("SALES INVOICE", 15, 48);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Invoice #: INV-${sale.id.toString().slice(-6)}`, 15, 55);
    doc.text(`Date: ${sale.date}`, 15, 60);
    
    // Customer Info
    doc.setFont(undefined, 'bold');
    doc.text("Bill To:", pageWidth - 60, 48);
    doc.setFont(undefined, 'normal');
    doc.text(sale.customer || "Walk-in Customer", pageWidth - 60, 55);
    if (sale.contact) {
      doc.setFontSize(9);
      doc.text(`Contact: ${sale.contact}`, pageWidth - 60, 60);
    }
    
    // Table
    const specs = `${sale.size || ''} ${sale.type || ''} ${sale.core || ''}`.trim() || '-';
    autoTable(doc, {
      startY: 70,
      head: [['Product Description', 'Specs', 'Color', 'Qty/Length', 'Unit Price', 'Total']],
      body: [[
        sale.productName,
        specs,
        sale.color || '-',
        sale.length,
        `Rs. ${sale.price?.toLocaleString() || '0'}`,
        `Rs. ${sale.total?.toLocaleString() || '0'}`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 5 }
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    
    // Summary
    doc.setFont(undefined, 'bold');
    doc.text("Payment Summary:", 15, finalY);
    
    doc.setFont(undefined, 'normal');
    doc.text(`Total Amount:`, 15, finalY + 7);
    doc.text(`Rs. ${sale.total?.toLocaleString() || '0'}`, 60, finalY + 7);
    
    doc.text(`Paid Amount:`, 15, finalY + 14);
    doc.text(`Rs. ${sale.paidAmount?.toLocaleString() || '0'}`, 60, finalY + 14);
    
    if (sale.credit > 0) {
      doc.setTextColor(220, 38, 38); // red-600
      doc.setFont(undefined, 'bold');
      doc.text(`Remaining Balance:`, 15, finalY + 21);
      doc.text(`Rs. ${sale.credit.toLocaleString()}`, 60, finalY + 21);
    } else {
      doc.setTextColor(22, 163, 74); // green-600
      doc.setFont(undefined, 'bold');
      doc.text(`Status: FULLY PAID`, 15, finalY + 21);
    }
    
    // Footer Notes
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text("Note: Goods once sold will not be returned or exchanged after use.", 15, 270);
    doc.text("Thank you for your business!", pageWidth / 2, 280, { align: 'center' });
    
    doc.save(`Invoice_${sale.customer?.replace(/ /g, '_') || 'Customer'}_${sale.date}.pdf`);
  };

  const purchaseData = purchases.filter(p =>
    (p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendor.toLowerCase().includes(searchTerm.toLowerCase())) &&
    isWithinDateRange(p.date)
  );

  const salesData = sales.filter(s =>
    (s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer.toLowerCase().includes(searchTerm.toLowerCase())) &&
    isWithinDateRange(s.date)
  );

  const totalPurchaseValue = purchaseData.reduce((acc, p) => acc + (p.total || 0), 0);
  const totalSalesLength = salesData.reduce((acc, s) => acc + (s.length || 0), 0);

  return (
    <div className="space-y-8">
      {/* Report Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Purchase Value</p>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RS. {totalPurchaseValue.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Length Issued</p>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{totalSalesLength.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Records Processed</p>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{purchases.length + sales.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Month Avg</p>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">RS. {(totalPurchaseValue / (purchases.length || 1)).toFixed(0)}</p>
        </div>
      </div>

      {/* Tables and Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('purchases')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${activeTab === 'purchases' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
              >
                Purchase History
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${activeTab === 'sales' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
              >
                Sales History
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 shadow-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs dark:text-white"
                />
                <span className="text-slate-400 text-xs font-bold">to</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs dark:text-white"
                />
              </div>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search records..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'purchases' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-4">Product</th>
                  <th className="px-8 py-4">Color</th>
                  <th className="px-8 py-4">Specs</th>
                  <th className="px-8 py-4">Length</th>
                  <th className="px-8 py-4">Total</th>
                  <th className="px-8 py-4">Cash</th>
                  <th className="px-8 py-4">Online</th>
                  <th className="px-8 py-4">Credit</th>
                  <th className="px-8 py-4">Vendor</th>
                  <th className="px-8 py-4">Contact</th>
                  <th className="px-8 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {purchaseData.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                    <td className="px-8 py-5 font-semibold text-slate-800 dark:text-white">{p.productName}</td>
                    <td className="px-8 py-5">
                      {p.color && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color.toLowerCase() }}></span>
                          {p.color}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1">
                        {p.size && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded font-medium">{p.size}mm</span>}
                        {p.type && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded font-medium">{p.type}</span>}
                        {p.core && <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-medium">{p.core}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400">{p.length}</td>
                    <td className="px-8 py-5 font-bold text-slate-800 dark:text-white">{p.total?.toLocaleString()}PKR</td>
                    <td className="px-8 py-5 text-emerald-600 dark:text-emerald-400 font-medium">{p.cashAmount?.toLocaleString() || 0}PKR</td>
                    <td className="px-8 py-5 text-blue-600 dark:text-blue-400 font-medium">
                      <div className="flex flex-col">
                        <span>{p.onlineAmount?.toLocaleString() || 0}PKR</span>
                        {p.paymentDetail && <span className="text-[10px] text-slate-500 truncate max-w-[100px]">TID: {p.paymentDetail}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`font-bold ${p.credit > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                        {p.credit?.toLocaleString()}PKR
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400">{p.vendor}</td>
                    <td className="px-8 py-5 text-slate-500 dark:text-slate-400 text-xs">{p.contact || '-'}</td>
                    <td className="px-8 py-5 text-slate-500 dark:text-slate-500 text-sm whitespace-nowrap">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-8 py-4">Product</th>
                  <th className="px-8 py-4">Color</th>
                  <th className="px-8 py-4">Specs</th>
                  <th className="px-8 py-4">Length Issued</th>
                  <th className="px-8 py-4">Price</th>
                  <th className="px-8 py-4">Total Value</th>
                  <th className="px-8 py-4">Cash</th>
                  <th className="px-8 py-4">Online</th>
                  <th className="px-8 py-4">Credit</th>
                  <th className="px-8 py-4">Customer / Project</th>
                  <th className="px-8 py-4">Contact</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {salesData.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                    <td className="px-8 py-5 font-semibold text-slate-800 dark:text-white">{s.productName}</td>
                    <td className="px-8 py-5">
                      {s.color && (
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color.toLowerCase() }}></span>
                          {s.color}
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-wrap gap-1">
                        {s.size && <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded font-medium">{s.size}mm</span>}
                        {s.type && <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded font-medium">{s.type}</span>}
                        {s.core && <span className="text-[10px] px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-medium">{s.core}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400">{s.length}</td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400">{s.price?.toLocaleString()}PKR</td>
                    <td className="px-8 py-5 font-bold text-slate-800 dark:text-white">{s.total?.toLocaleString()}PKR</td>
                    <td className="px-8 py-5 text-emerald-600 dark:text-emerald-400 font-medium">{s.cashAmount?.toLocaleString() || 0}PKR</td>
                    <td className="px-8 py-5 text-blue-600 dark:text-blue-400 font-medium">
                      <div className="flex flex-col">
                        <span>{s.onlineAmount?.toLocaleString() || 0}PKR</span>
                        {s.paymentDetail && <span className="text-[10px] text-slate-500 truncate max-w-[100px]">TID: {s.paymentDetail}</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`font-bold ${s.credit > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
                        {s.credit?.toLocaleString()}PKR
                      </span>
                    </td>
                    <td className="px-8 py-5 text-slate-600 dark:text-slate-400">{s.customer}</td>
                    <td className="px-8 py-5 text-slate-500 dark:text-slate-400 text-xs">{s.contact || '-'}</td>
                    <td className="px-8 py-5 text-slate-500 dark:text-slate-500 text-sm whitespace-nowrap">{s.date}</td>
                    <td className="px-8 py-5 text-center">
                       <button
                         onClick={() => generateInvoice(s)}
                         className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-all" title="Print Invoice"
                       >
                         <Printer className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {((activeTab === 'purchases' && purchaseData.length === 0) || (activeTab === 'sales' && salesData.length === 0)) && (
            <div className="p-20 text-center text-slate-400 italic">
              No data found for the current search/filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
