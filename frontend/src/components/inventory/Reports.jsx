import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, FileText, Download, Calendar, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { groupSalesByInvoice, toReceipt } from '../../utils/saleReceipt';

const ColorTag = ({ color }) => {
  if (!color) return <span className="text-slate-400 text-xs">-</span>;
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color.toLowerCase() }} />
      {color}
    </span>
  );
};

const SpecTags = ({ item }) => {
  if (!item.size && !item.type && !item.core) {
    return <span className="text-slate-400 text-xs">-</span>;
  }
  return (
    <div className="flex flex-wrap items-center gap-1">
      {item.size && (
        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded font-medium whitespace-nowrap">
          {item.size}mm
        </span>
      )}
      {item.type && (
        <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded font-medium whitespace-nowrap">
          {item.type}
        </span>
      )}
      {item.core && (
        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-medium whitespace-nowrap">
          {item.core}
        </span>
      )}
    </div>
  );
};

const InvoiceBadge = ({ count }) => (
  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:ring-indigo-800">
    Invoice · {count} items
  </span>
);

const SaleHistoryRows = ({ invoices, onPrintA4, onPrintThermal }) =>
  invoices.flatMap((inv) => {
    const rowSpan = inv.itemCount;
    const sharedCells = (idx) =>
      idx === 0 ? (
        <>
          <td rowSpan={rowSpan} className="px-6 py-4 align-middle font-bold text-slate-800 dark:text-white whitespace-nowrap bg-slate-50/50 dark:bg-slate-800/30">
            {inv.total?.toLocaleString()} PKR
          </td>
          <td rowSpan={rowSpan} className="px-6 py-4 align-middle text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap bg-slate-50/50 dark:bg-slate-800/30">
            {(inv.cashAmount ?? 0).toLocaleString()} PKR
          </td>
          <td rowSpan={rowSpan} className="px-6 py-4 align-middle text-blue-600 dark:text-blue-400 font-medium bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex flex-col gap-0.5">
              <span className="whitespace-nowrap">{(inv.onlineAmount ?? 0).toLocaleString()} PKR</span>
              {inv.paymentDetail && (
                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">TID: {inv.paymentDetail}</span>
              )}
            </div>
          </td>
          <td rowSpan={rowSpan} className="px-6 py-4 align-middle bg-slate-50/50 dark:bg-slate-800/30">
            <span className={`font-bold whitespace-nowrap ${inv.credit > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>
              {(inv.credit ?? 0).toLocaleString()} PKR
            </span>
          </td>
          <td rowSpan={rowSpan} className="px-6 py-4 align-middle text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
            {inv.customer || '-'}
          </td>
          <td rowSpan={rowSpan} className="px-6 py-4 align-middle text-slate-500 dark:text-slate-400 text-xs bg-slate-50/50 dark:bg-slate-800/30">
            {inv.contact || '-'}
          </td>
          <td rowSpan={rowSpan} className="px-6 py-4 align-middle text-slate-500 text-sm whitespace-nowrap bg-slate-50/50 dark:bg-slate-800/30">
            {inv.date}
          </td>
          <td rowSpan={rowSpan} className="px-6 py-4 align-middle text-center bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => onPrintA4(inv)}
                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-all"
                title="Print A4 Invoice"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onPrintThermal(inv)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-all"
                title="Print Thermal Receipt (80mm)"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </td>
        </>
      ) : null;

    if (!inv.isMultiItem) {
      const item = inv.items[0];
      return [
        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
          <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">{item.productName}</td>
          <td className="px-6 py-4"><ColorTag color={item.color} /></td>
          <td className="px-6 py-4"><SpecTags item={item} /></td>
          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 tabular-nums">{item.length}</td>
          <td className="px-6 py-4 text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
            {(item.price ?? 0).toLocaleString()} PKR
          </td>
          {sharedCells(0)}
        </tr>,
      ];
    }

    return inv.items.map((item, idx) => {
      const lineTotal = item.total ?? (item.length || 0) * (item.price || 0);
      return (
        <tr
          key={item.id}
          className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
            idx < inv.itemCount - 1 ? 'border-b border-dashed border-slate-200 dark:border-slate-600' : ''
          }`}
        >
          <td className={`px-6 py-3 align-middle ${idx === 0 ? 'border-l-4 border-indigo-400 dark:border-indigo-500 pl-4' : 'border-l-4 border-transparent pl-4'}`}>
            {idx === 0 && (
              <div className="mb-2 block w-full">
                <InvoiceBadge count={inv.itemCount} />
              </div>
            )}
            <span className="font-semibold text-slate-800 dark:text-white">{item.productName}</span>
          </td>
          <td className="px-6 py-3 align-middle"><ColorTag color={item.color} /></td>
          <td className="px-6 py-3 align-middle min-w-[140px]"><SpecTags item={item} /></td>
          <td className="px-6 py-3 align-middle text-slate-600 dark:text-slate-400 tabular-nums">{item.length}</td>
          <td className="px-6 py-3 align-middle text-slate-600 dark:text-slate-400">
            <div className="tabular-nums whitespace-nowrap">{(item.price ?? 0).toLocaleString()} PKR</div>
            <div className="text-[10px] text-slate-500 mt-0.5 tabular-nums">Line: {lineTotal.toLocaleString()} PKR</div>
          </td>
          {sharedCells(idx)}
        </tr>
      );
    });
  });

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

  const formatInvoiceForExport = (inv) => {
    const products = inv.items.map((i) => `${i.productName} (Ã—${i.length})`).join('; ');
    const colors = [...new Set(inv.items.map((i) => i.color).filter(Boolean))].join(', ') || '-';
    const specsList = inv.items.map((i) => {
      const s = `${i.size || ''} ${i.type || ''} ${i.core || ''}`.trim();
      return s || '-';
    }).join('; ');
    const lengths = inv.items.map((i) => i.length).join(' + ');
    return {
      productName: inv.isMultiItem ? products : inv.items[0].productName,
      color: colors,
      specs: specsList,
      length: inv.isMultiItem ? lengths : inv.items[0].length,
      price: inv.isMultiItem ? '-' : inv.items[0].price,
      total: inv.total,
      cashAmount: inv.cashAmount,
      onlineAmount: inv.onlineAmount,
      credit: inv.credit,
      customer: inv.customer,
      contact: inv.contact,
      date: inv.date,
      invoiceId: inv.invoiceId || inv.id,
      itemCount: inv.itemCount,
    };
  };

  const handleExport = () => {
    const dataToExport = activeTab === 'purchases'
      ? purchaseData
      : groupedSalesData.map(formatInvoiceForExport);
    const fileName = activeTab === 'purchases' ? 'Purchase_History.xlsx' : 'Sales_History.xlsx';

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'purchases' ? 'Purchases' : 'Sales');
    XLSX.writeFile(wb, fileName);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
    const dataToExport = activeTab === 'purchases'
      ? purchaseData
      : groupedSalesData.map(formatInvoiceForExport);
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
        const specsVal = row.specs || specs;
        return [
          row.productName,
          row.color || '-',
          specsVal,
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

  const generateInvoice = (rawSale) => {
    const sale = toReceipt(rawSale);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("ABBASI CABLE", pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("High Quality Electric Cables & Wires", pageWidth / 2, 26, { align: 'center' });
    doc.text("Contact: +92 313 2034012 | Address: Industrial Area, City", pageWidth / 2, 31, { align: 'center' });
    
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
    
    autoTable(doc, {
      startY: 70,
      head: [['Product Description', 'Specs', 'Color', 'Qty/Length', 'Unit Price', 'Total']],
      body: sale.items.map((item) => {
        const specs = `${item.size || ''} ${item.type || ''} ${item.core || ''}`.trim() || '-';
        return [
          item.productName,
          specs,
          item.color || '-',
          item.length,
          `Rs. ${(item.price || 0).toLocaleString()}`,
          `Rs. ${(item.total ?? item.length * item.price).toLocaleString()}`,
        ];
      }),
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
    
    doc.text(`Paid Amount (${sale.paymentType || 'cash'}):`, 15, finalY + 14);
    doc.text(`Rs. ${(sale.paidAmount ?? (sale.cashAmount || 0) + (sale.onlineAmount || 0)).toLocaleString()}`, 60, finalY + 14);
    
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
    // doc.text("Note: Goods once sold will not be returned or exchanged after use.", 15, 270);
    doc.text("Thank you for your business!", pageWidth / 2, 280, { align: 'center' });
    
    doc.save(`Invoice_${sale.customer?.replace(/ /g, '_') || 'Customer'}_${sale.date}.pdf`);
  };

  const generateThermalInvoice = (rawSale) => {
    const sale = toReceipt(rawSale);
    const paidAmount = sale.paidAmount ?? (sale.cashAmount || 0) + (sale.onlineAmount || 0);
    const itemCount = sale.items.length;
    const docHeight = Math.max(150, 72 + itemCount * 28);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, docHeight],
    });

    const pageWidth = doc.internal.pageSize.width;
    let y = 10;

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('ABBASI CABLE', pageWidth / 2, y, { align: 'center' });
    y += 4;

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Electric Cables & Wires', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text('Contact: +92 313 2034012', pageWidth / 2, y, { align: 'center' });
    y += 5;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(5, y, pageWidth - 5, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('SALES RECEIPT', pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Inv #: INV-${sale.id.toString().slice(-6)}`, 5, y);
    y += 4;
    doc.text(`Date: ${sale.date}`, 5, y);
    y += 4;
    doc.text(`Customer: ${sale.customer || 'Walk-in'}`, 5, y);
    y += 4;
    if (sale.contact) {
      doc.text(`Contact: ${sale.contact}`, 5, y);
      y += 4;
    }

    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.line(5, y, pageWidth - 5, y);
    y += 5;

    const colQty = 44;
    const colRate = 52;
    const colAmt = 60;
    const itemColWidth = colQty - 8;

    doc.setFont(undefined, 'bold');
    doc.setFontSize(7);
    doc.text('Item', 5, y);
    doc.text('Qty', colQty, y);
    doc.text('Rate', colRate, y);
    doc.text('Amount', colAmt, y);
    y += 2;
    doc.line(5, y, pageWidth - 5, y);
    y += 4;

    doc.setFont(undefined, 'normal');
    sale.items.forEach((item) => {
      const specs = `${item.size || ''} ${item.type || ''} ${item.core || ''}`.trim();
      const lineTotal = item.total ?? item.length * item.price;

      const splitName = doc.splitTextToSize(item.productName, itemColWidth);
      doc.text(splitName, 5, y);
      y += splitName.length * 3.2;

      let valuesY = y - 3.2;
      if (specs) {
        const splitSpecs = doc.splitTextToSize(`(${specs})`, itemColWidth);
        valuesY = y;
        doc.text(splitSpecs, 5, y);
        y += splitSpecs.length * 3.2;
      }

      doc.text(String(item.length), colQty, valuesY);
      doc.text(String((item.price || 0).toLocaleString()), colRate, valuesY);
      doc.text(String(lineTotal.toLocaleString()), colAmt, valuesY);

      doc.setFontSize(6.5);
      doc.text(`Color: ${item.color || '-'}`, 5, y);
      doc.setFontSize(7);
      y += 3.5;
    });

    doc.line(5, y, pageWidth - 5, y);
    y += 5;

    const paymentLabel = sale.paymentType
      ? sale.paymentType.charAt(0).toUpperCase() + sale.paymentType.slice(1)
      : 'Cash';

    doc.setFont(undefined, 'normal');
    doc.text('Total:', 5, y);
    doc.setFont(undefined, 'bold');
    doc.text(`Rs. ${sale.total.toLocaleString()}`, pageWidth - 5, y, { align: 'right' });
    y += 5;

    doc.setFont(undefined, 'normal');
    doc.text(`Paid (${paymentLabel}):`, 5, y);
    doc.text(`Rs. ${paidAmount.toLocaleString()}`, pageWidth - 5, y, { align: 'right' });
    y += 5;

    if (sale.credit > 0) {
      doc.setFont(undefined, 'normal');
      doc.text('Balance:', 5, y);
      doc.setFont(undefined, 'bold');
      doc.text(`Rs. ${sale.credit.toLocaleString()}`, pageWidth - 5, y, { align: 'right' });
    } else {
      doc.setFont(undefined, 'bold');
      doc.text('Status: FULLY PAID', pageWidth / 2, y, { align: 'center' });
    }
    y += 10;

    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text('Goods once sold will not be returned.', pageWidth / 2, y, { align: 'center' });
    doc.text('Thank you for your business!', pageWidth / 2, y + 4, { align: 'center' });

    doc.save(`Receipt_${sale.customer?.replace(/ /g, '_') || 'Customer'}_${sale.date}.pdf`);
  };

  const purchaseData = purchases.filter(p =>
    (p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendor.toLowerCase().includes(searchTerm.toLowerCase())) &&
    isWithinDateRange(p.date)
  );

  const filteredSales = sales.filter(
    (s) => isWithinDateRange(s.date) && (
      !searchTerm ||
      s.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customer?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const groupedSalesData = groupSalesByInvoice(filteredSales);
  const salesData = filteredSales;

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
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 min-w-[160px]">Product</th>
                  <th className="px-6 py-4 whitespace-nowrap">Color</th>
                  <th className="px-6 py-4 min-w-[140px]">Specs</th>
                  <th className="px-6 py-4 whitespace-nowrap">Length</th>
                  <th className="px-6 py-4 whitespace-nowrap">Unit Price</th>
                  <th className="px-6 py-4 whitespace-nowrap">Invoice Total</th>
                  <th className="px-6 py-4 whitespace-nowrap">Cash</th>
                  <th className="px-6 py-4 whitespace-nowrap">Online</th>
                  <th className="px-6 py-4 whitespace-nowrap">Credit</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                <SaleHistoryRows
                  invoices={groupedSalesData}
                  onPrintA4={generateInvoice}
                  onPrintThermal={generateThermalInvoice}
                />
              </tbody>
            </table>
          )}

          {((activeTab === 'purchases' && purchaseData.length === 0) || (activeTab === 'sales' && groupedSalesData.length === 0)) && (
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
