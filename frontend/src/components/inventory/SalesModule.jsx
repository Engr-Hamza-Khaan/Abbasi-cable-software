import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, User, ChevronRight, AlertCircle, ShoppingBag, Printer, FileText, Phone,
  Plus, Trash2, Package, CheckCircle2, ShoppingCart, Calendar, Clock
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { createSale, createReminderCustomer } from '../../services/api';
import { toReceipt, groupSalesByInvoice } from '../../utils/saleReceipt';

const COLOR_TAG_STYLES = {
  red: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' },
  black: { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-800 dark:text-slate-200', border: 'border-slate-300 dark:border-slate-600', dot: 'bg-slate-900 dark:bg-slate-300' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-500' },
  green: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  white: { bg: 'bg-white dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-600', dot: 'bg-slate-200 ring-1 ring-slate-300' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500' },
  brown: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-700' },
  grey: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-600', dot: 'bg-slate-400' },
  gray: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-600', dot: 'bg-slate-400' },
};

const getColorTagStyle = (colorName) => {
  const key = (colorName || '').toLowerCase().trim();
  return COLOR_TAG_STYLES[key] || {
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    dot: 'bg-indigo-500',
  };
};

const ColorTag = ({ color, size = 'md' }) => {
  if (!color) return null;
  const style = getColorTagStyle(color);
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px] gap-1' : 'px-3 py-1 text-xs gap-1.5';
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold border ${style.bg} ${style.text} ${style.border} ${sizeClass}`}
    >
      <span className={`shrink-0 rounded-full ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${style.dot}`} />
      {color}
    </span>
  );
};

const defaultCreditDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

const emptyLineItem = () => ({
  productId: '',
  variantId: '',
  length: 1,
  price: 0,
});

const emptyOrder = () => ({
  cashAmount: 0,
  onlineAmount: 0,
  paymentType: 'cash',
  paymentDetail: '',
  customer: '',
  contact: '',
  date: new Date().toISOString().split('T')[0],
});

const getOrderPaid = (order) => {
  if (order.paymentType === 'cash') return order.cashAmount || 0;
  if (order.paymentType === 'online') return order.onlineAmount || 0;
  return (order.cashAmount || 0) + (order.onlineAmount || 0);
};

const SalesModule = ({ products, setProducts, sales, setSales, setCashTransactions, getWriteShopId, refreshAll }) => {
  const [lineItem, setLineItem] = useState(emptyLineItem);
  const [cartItems, setCartItems] = useState([]);
  const [order, setOrder] = useState(emptyOrder);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isWithinDateRange = (dateStr) => {
    if (!startDate && !endDate) return true;
    if (startDate && dateStr < startDate) return false;
    if (endDate && dateStr > endDate) return false;
    return true;
  };

  const filteredSales = sales.filter((s) => isWithinDateRange(s.date));
  const groupedFilteredSales = groupSalesByInvoice(filteredSales);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditDueDate, setCreditDueDate] = useState(defaultCreditDueDate);
  const [creditModalError, setCreditModalError] = useState('');

  const cartGrandTotal = cartItems.reduce((sum, item) => sum + item.length * item.price, 0);
  const orderPaid = getOrderPaid(order);
  const orderBalance = cartGrandTotal - orderPaid;

  const selectedProduct = products.find((p) => String(p.id) === String(lineItem.productId));
  const selectedVariant = selectedProduct?.variants?.find(
    (v) => v.id.toString() === lineItem.variantId.toString()
  );

  const generateInvoice = (rawSale) => {
    const sale = toReceipt(rawSale);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('ABBASI CABLE', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('High Quality Electric Cables & Wires', pageWidth / 2, 26, { align: 'center' });
    doc.text('Contact: +92 313 2034012 | Address: Industrial Area, City', pageWidth / 2, 31, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.line(15, 38, pageWidth - 15, 38);

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont(undefined, 'bold');
    doc.text('SALES INVOICE', 15, 48);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Invoice #: INV-${sale.id.toString().slice(-6)}`, 15, 55);
    doc.text(`Date: ${sale.date}`, 15, 60);

    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', pageWidth - 60, 48);
    doc.setFont(undefined, 'normal');
    doc.text(sale.customer || 'Walk-in Customer', pageWidth - 60, 55);
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
      styles: { fontSize: 9, cellPadding: 5 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFont(undefined, 'bold');
    doc.text('Payment Summary:', 15, finalY);

    doc.setFont(undefined, 'normal');
    doc.text('Total Amount:', 15, finalY + 7);
    doc.text(`Rs. ${sale.total.toLocaleString()}`, 60, finalY + 7);

    doc.text(`Paid Amount (${sale.paymentType}):`, 15, finalY + 14);
    doc.text(`Rs. ${sale.paidAmount.toLocaleString()}`, 60, finalY + 14);

    if (sale.credit > 0) {
      doc.setTextColor(220, 38, 38);
      doc.setFont(undefined, 'bold');
      doc.text('Remaining Balance:', 15, finalY + 21);
      doc.text(`Rs. ${sale.credit.toLocaleString()}`, 60, finalY + 21);
    } else {
      doc.setTextColor(22, 163, 74);
      doc.setFont(undefined, 'bold');
      doc.text('Status: FULLY PAID', 15, finalY + 21);
    }

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('Thank you for your business!', pageWidth / 2, finalY + 35, { align: 'center' });

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const generateThermalInvoice = (rawSale) => {
    const sale = toReceipt(rawSale);
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
    doc.text(`Rs. ${sale.paidAmount.toLocaleString()}`, pageWidth - 5, y, { align: 'right' });
    y += 5;

    if (sale.credit > 0) {
      doc.setFont(undefined, 'normal');
      doc.text('Balance:', 5, y);
      doc.setFont(undefined, 'bold');
      doc.text(`Rs. ${sale.credit.toLocaleString()}`, pageWidth - 5, y, { align: 'right' });
      y += 5;
      if (sale.dueDate) {
        doc.setFont(undefined, 'normal');
        doc.text(`Due by: ${sale.dueDate}`, pageWidth / 2, y, { align: 'center' });
        y += 5;
      }
    } else {
      doc.setFont(undefined, 'bold');
      doc.text('Status: FULLY PAID', pageWidth / 2, y, { align: 'center' });
    }
    y += 10;

    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text('No return - No exchange without slip', pageWidth / 2, y, { align: 'center' });
    doc.text('Thank you for your business!', pageWidth / 2, y + 4, { align: 'center' });

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleAddToCart = () => {
    setError('');

    if (!lineItem.productId || lineItem.length <= 0) {
      setError('Please select a product and valid length.');
      return;
    }
    if (!selectedProduct || !selectedVariant) {
      setError('Please select a valid batch/variant.');
      return;
    }
    if (selectedVariant.stock < lineItem.length) {
      setError(`Insufficient stock in this batch. Available: ${selectedVariant.stock}`);
      return;
    }

    const existingQty = cartItems
      .filter((c) => c.variantId === selectedVariant.id)
      .reduce((sum, c) => sum + c.length, 0);

    if (existingQty + lineItem.length > selectedVariant.stock) {
      setError(`Insufficient stock. Available: ${selectedVariant.stock} (already ${existingQty} in cart)`);
      return;
    }

    setCartItems([
      ...cartItems,
      {
        cartId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        productId: lineItem.productId,
        variantId: lineItem.variantId,
        productName: selectedProduct.name,
        color: selectedProduct.color,
        size: selectedVariant.size,
        type: selectedVariant.type,
        core: selectedVariant.core,
        label: selectedVariant.label,
        unit: selectedProduct.unit,
        length: lineItem.length,
        price: lineItem.price,
        total: lineItem.length * lineItem.price,
      },
    ]);
    setLineItem(emptyLineItem());
  };

  const handleRemoveFromCart = (cartId) => {
    setCartItems(cartItems.filter((c) => c.cartId !== cartId));
  };

  const processSale = async (paymentDeadline = null) => {
    const shopId = getWriteShopId?.();
    const grandTotal = cartGrandTotal;
    const paidAmount = orderPaid;
    const creditAmount = grandTotal - paidAmount;
    const totalCash =
      order.paymentType === 'online' ? 0 : order.paymentType === 'cash' ? order.cashAmount : order.cashAmount;
    const totalOnline =
      order.paymentType === 'cash' ? 0 : order.paymentType === 'online' ? order.onlineAmount : order.onlineAmount;
    let remCash = totalCash;
    let remOnline = totalOnline;

    setSubmitting(true);
    const createdSales = [];
    const newCashTxs = [];
    const invoiceId = crypto.randomUUID();

    try {
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const isLast = i === cartItems.length - 1;
        let cashAmount;
        let onlineAmount;
        if (isLast) {
          cashAmount = remCash;
          onlineAmount = remOnline;
        } else {
          const ratio = grandTotal > 0 ? item.total / grandTotal : 0;
          cashAmount = Math.round(totalCash * ratio * 100) / 100;
          onlineAmount = Math.round(totalOnline * ratio * 100) / 100;
          remCash -= cashAmount;
          remOnline -= onlineAmount;
        }

        const payload = {
          invoiceId,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          color: item.color,
          size: item.size,
          type: item.type,
          core: item.core,
          length: item.length,
          price: item.price,
          customer: order.customer,
          contact: order.contact,
          paymentType: order.paymentType,
          paymentDetail: order.paymentDetail,
          cashAmount,
          onlineAmount,
          date: order.date,
        };

        const result = await createSale(payload, shopId);
        createdSales.push(result.data);
        if (result.cashTransaction) newCashTxs.push(result.cashTransaction);
      }

      if (creditAmount > 0 && paymentDeadline) {
        try {
          await createReminderCustomer(
            {
              customerName: order.customer.trim(),
              phoneNumber: order.contact.trim(),
              dueAmount: creditAmount,
              dueDate: paymentDeadline,
            },
            shopId
          );
        } catch (reminderErr) {
          console.error('Failed to create payment reminder', reminderErr);
        }
      }

      setSales([...createdSales, ...sales]);
      if (setCashTransactions && newCashTxs.length) {
        setCashTransactions((prev) => [...newCashTxs, ...prev]);
      }
      if (refreshAll) await refreshAll();

      const receipt = {
        id: invoiceId,
        invoiceId,
        date: order.date,
        customer: order.customer,
        contact: order.contact,
        paymentType: order.paymentType,
        total: grandTotal,
        paidAmount,
        credit: creditAmount,
        dueDate: creditAmount > 0 ? paymentDeadline : null,
        items: createdSales.map((s) => ({
          productName: s.productName,
          size: s.size,
          type: s.type,
          core: s.core,
          color: s.color,
          length: s.length,
          price: s.price,
          total: s.total,
        })),
      };

      setLastReceipt(receipt);
      setShowPrintModal(true);
      setCartItems([]);
      setLineItem(emptyLineItem());
      setOrder(emptyOrder());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setCreditModalError('');

    if (cartItems.length === 0) {
      setError('Add at least one item to the sale.');
      return;
    }
    if (!order.customer.trim()) {
      setError('Customer / project name is required.');
      return;
    }

    if (!getWriteShopId?.()) {
      setError('Please select a specific shop before recording a sale.');
      return;
    }

    if (orderBalance > 0) {
      if (!order.contact?.trim()) {
        setError('Contact number is required when there is a credit balance.');
        return;
      }
      setCreditDueDate(defaultCreditDueDate());
      setShowCreditModal(true);
      return;
    }

    processSale();
  };

  const handleCreditConfirm = async () => {
    setCreditModalError('');
    if (!creditDueDate) {
      setCreditModalError('Please set a payment deadline.');
      return;
    }
    if (creditDueDate < order.date) {
      setCreditModalError('Deadline cannot be before the sale date.');
      return;
    }
    setShowCreditModal(false);
    await processSale(creditDueDate);
  };

  const creditModal = (
    <AnimatePresence>
      {showCreditModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100001] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
            onClick={() => !submitting && setShowCreditModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.35)] dark:bg-slate-800 dark:border-slate-700/50"
          >
            <motion.div
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            />
            <motion.div className="p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30"
              >
                <Clock className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-center text-xl font-black text-slate-800 dark:text-white">
                Credit Payment Due
              </h2>
              <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
                Remaining balance of{' '}
                <span className="font-bold text-red-600 dark:text-red-400">
                  Rs. {orderBalance.toLocaleString()}
                </span>{' '}
                — set a deadline before completing this sale.
              </p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-6 space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/50"
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{order.customer}</p>
                </div>
                <motion.div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{order.contact}</p>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-5 space-y-2"
              >
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Payment Deadline
                </label>
                <motion.div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    required
                    min={order.date}
                    value={creditDueDate}
                    onChange={(e) => setCreditDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </motion.div>
                <p className="text-xs text-slate-400">
                  Customer will be added to payment reminders for this due date.
                </p>
              </motion.div>

              {creditModalError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {creditModalError}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-6 flex gap-3"
              >
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowCreditModal(false)}
                  className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCreditConfirm}
                  className="flex-[2] rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:brightness-105 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Confirm & Complete Sale'}
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const printModal = (
    <AnimatePresence>
      {showPrintModal && lastReceipt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
            onClick={() => setShowPrintModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.35)] dark:bg-slate-800 dark:border-slate-700/50"
          >
            <motion.div
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-600"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.15, stiffness: 400 }}
              className="mx-auto -mt-0 flex justify-center pt-8"
            >
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/40"
              >
                <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2.5} />
              </motion.div>
            </motion.div>

            <div className="px-8 pb-8 pt-4 text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                Sale Completed
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                {lastReceipt.items.length} item{lastReceipt.items.length > 1 ? 's' : ''} issued successfully
              </p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-left dark:border-slate-700 dark:bg-slate-900/50"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer</p>
                <p className="font-semibold text-slate-800 dark:text-white">{lastReceipt.customer}</p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="mt-3 flex justify-between border-t border-slate-200 pt-3 dark:border-slate-700"
                >
                  <span className="text-sm text-slate-500">Grand Total</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white">
                    Rs. {lastReceipt.total.toLocaleString()}
                  </span>
                </motion.div>
                {lastReceipt.credit > 0 && (
                  <motion.div className="mt-2 space-y-1 text-right">
                    <p className="text-xs font-bold text-red-500">
                      Balance: Rs. {lastReceipt.credit.toLocaleString()}
                    </p>
                    {lastReceipt.dueDate && (
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                        Due by: {new Date(lastReceipt.dueDate).toLocaleDateString('en-GB')}
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-xs text-slate-400"
              >
                Choose how you&apos;d like to print this receipt
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-5 space-y-3"
              >
                <button
                  type="button"
                  onClick={() => generateInvoice(lastReceipt)}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-emerald-500/50 hover:brightness-105"
                >
                  <FileText className="h-5 w-5" />
                  Print A4 Invoice
                </button>
                <button
                  type="button"
                  onClick={() => generateThermalInvoice(lastReceipt)}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-900 px-5 py-4 font-bold text-white shadow-lg shadow-slate-500/30 transition-all hover:brightness-110 dark:from-slate-600 dark:to-slate-800"
                >
                  <Printer className="h-5 w-5" />
                  Print Thermal (80mm)
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="w-full rounded-2xl py-3 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                >
                  Done — Close
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {typeof document !== 'undefined' && createPortal(printModal, document.body)}
      {typeof document !== 'undefined' && createPortal(creditModal, document.body)}

      {/* Sales Form */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-3 mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl"
          >
            <ShoppingBag className="w-6 h-6 text-red-600 dark:text-red-400" />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Sales / Issue (Stock Out)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add multiple items, then process payment</p>
          </motion.div>
        </motion.div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6 flex items-center border border-red-500/20">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Line item picker */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-5 space-y-4"
          >
            <motion.div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <Package className="w-4 h-4 text-blue-600" />
              Add Item to Sale
            </motion.div>

            <motion.div className="space-y-1" whileFocus={{ scale: 1.005 }}>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Inventory Item</label>
              <select
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={lineItem.productId}
                onChange={(e) => setLineItem({ ...lineItem, productId: e.target.value, variantId: '' })}
              >
                <option value="">-- Select Cable Type --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Total: {p.stock} {p.unit}s)
                  </option>
                ))}
              </select>
            </motion.div>

            {selectedProduct && (
              <>
                <motion.div className="space-y-1">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Batch / Variant</label>
                  <select
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                    value={lineItem.variantId}
                    onChange={(e) => setLineItem({ ...lineItem, variantId: e.target.value })}
                  >
                    <option value="">-- Choose Batch --</option>
                    {selectedProduct.variants?.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label} (Avail: {v.stock} {selectedProduct.unit}s)
                      </option>
                    ))}
                  </select>
                </motion.div>

                {lineItem.variantId && selectedVariant && (
                  <div className="grid grid-cols-3 gap-3">
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-white dark:bg-slate-800 px-3 py-2 border border-slate-200 dark:border-slate-700"
                    >
                      <p className="text-[10px] uppercase font-bold text-slate-400">Size</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedVariant.size || '—'}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="rounded-xl bg-white dark:bg-slate-800 px-3 py-2 border border-slate-200 dark:border-slate-700"
                    >
                      <p className="text-[10px] uppercase font-bold text-slate-400">Type</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedVariant.type || '—'}</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="rounded-xl bg-white dark:bg-slate-800 px-3 py-2 border border-slate-200 dark:border-slate-700"
                    >
                      <p className="text-[10px] uppercase font-bold text-slate-400">Core</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selectedVariant.core || '—'}</p>
                    </motion.div>
                    {selectedProduct.color && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-3 rounded-xl bg-white dark:bg-slate-800 px-3 py-2.5 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                      >
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Color</span>
                        <ColorTag color={selectedProduct.color} />
                      </motion.div>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Issue Length</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={lineItem.length}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setLineItem({ ...lineItem, length: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
              <motion.div className="space-y-1" whileFocus={{ scale: 1.005 }}>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Unit Price (Rs)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={lineItem.price}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setLineItem({ ...lineItem, price: parseFloat(e.target.value) || 0 })}
                />
              </motion.div>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className="w-full py-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add to Cart
            </motion.button>
          </motion.div>

          {/* Cart */}
          {cartItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-2xl border border-blue-200 dark:border-blue-800/50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
                  <ShoppingCart className="w-4 h-4" />
                  Cart ({cartItems.length})
                </div>
                <span className="font-black text-blue-700 dark:text-blue-400">
                  Rs. {cartGrandTotal.toLocaleString()}
                </span>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-48 overflow-y-auto">
                {cartItems.map((item, idx) => (
                  <motion.div
                    key={item.cartId}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800"
                  >
                    <motion.div className="flex-1 min-w-0" layout>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{item.productName}</p>
                        {item.color && <ColorTag color={item.color} size="sm" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.label} · {item.length} × Rs.{item.price.toLocaleString()}
                      </p>
                    </motion.div>
                    <div className="flex items-center gap-3 ml-2">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        Rs. {item.total.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.cartId)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Issue Date</label>
              <input
                required
                type="date"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={order.date}
                onChange={(e) => setOrder({ ...order, date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Order Total</label>
              <motion.div
                key={cartGrandTotal}
                initial={{ scale: 1.02 }}
                animate={{ scale: 1 }}
                className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-400 font-bold text-lg"
              >
                Rs. {cartGrandTotal.toLocaleString()}
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-6"
          >
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Payment Type</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white font-semibold"
                value={order.paymentType}
                onChange={(e) =>
                  setOrder({ ...order, paymentType: e.target.value, cashAmount: 0, onlineAmount: 0, paymentDetail: '' })
                }
              >
                <option value="cash">Cash Only</option>
                <option value="online">Online Only</option>
                <option value="hybrid">Hybrid (Cash + Online)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Paid Amount</label>
              <div className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-white font-bold text-lg">
                Rs. {orderPaid.toLocaleString()}
              </div>
              {orderBalance > 0 && (
                <p className="text-xs text-red-500 font-bold px-1 animate-pulse">
                  Remaining: Rs. {orderBalance.toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>

          <div className={`grid gap-4 ${order.paymentType === 'hybrid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {(order.paymentType === 'cash' || order.paymentType === 'hybrid') && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Cash Amount</label>
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                  value={order.cashAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setOrder({ ...order, cashAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}
            {(order.paymentType === 'online' || order.paymentType === 'hybrid') && (
              <motion.div className="space-y-1" whileFocus={{ scale: 1.005 }}>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Online Amount</label>
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={order.onlineAmount}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setOrder({ ...order, onlineAmount: parseFloat(e.target.value) || 0 })}
                />
              </motion.div>
            )}
          </div>

          {(order.paymentType === 'online' || order.paymentType === 'hybrid' || order.paymentDetail) && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {order.paymentType === 'cash' ? 'Payment Notes' : 'Transaction ID / Reference'}
              </label>
              <input
                type="text"
                placeholder={order.paymentType === 'cash' ? 'Optional notes' : 'Enter transaction ID'}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                value={order.paymentDetail}
                onChange={(e) => setOrder({ ...order, paymentDetail: e.target.value })}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Customer / Project Name</label>
              <motion.div className="relative" whileFocus={{ scale: 1.005 }}>
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Skyline Towers Maintenance"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={order.customer}
                  onChange={(e) => setOrder({ ...order, customer: e.target.value })}
                />
              </motion.div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="e.g. 0300-1234567"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                  value={order.contact}
                  onChange={(e) => setOrder({ ...order, contact: e.target.value })}
                />
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={submitting || cartItems.length === 0}
            whileHover={{ scale: submitting ? 1 : 1.01 }}
            whileTap={{ scale: submitting ? 1 : 0.99 }}
            className="w-full py-4 bg-slate-800 dark:bg-blue-600 hover:bg-slate-900 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 font-bold"
          >
            <Send className="w-5 h-5" />
            <span>{submitting ? 'Processing...' : `Process Sale (${cartItems.length} item${cartItems.length !== 1 ? 's' : ''})`}</span>
          </motion.button>
        </form>
      </div>

      {/* Stock Summary Info */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl text-white shadow-xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 bg-white/10 p-2 rounded-xl mb-4"
          >
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white font-bold w-full"
            />
            <span className="text-white/40 text-[10px] font-bold">TO</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white font-bold w-full"
            />
          </motion.div>
          <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <p className="text-sm opacity-80">Total Issue Transactions</p>
              <p className="text-2xl font-bold">{groupedFilteredSales.length}</p>
            </motion.div>
            <ChevronRight className="w-6 h-6 opacity-40" />
          </div>
          <div className="flex justify-between items-center bg-white/10 p-4 rounded-2xl mt-3">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
              <p className="text-sm opacity-80">Total Units Issued</p>
              <p className="text-2xl font-bold">
                {filteredSales.reduce((acc, sale) => acc + (Number(sale.length) || 0), 0)}
              </p>
            </motion.div>
            <ChevronRight className="w-6 h-6 opacity-40" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Critical Stock Alerts</h3>
          <motion.div className="space-y-3" layout>
            {products
              .filter((p) => p.stock <= p.minStock)
              .slice(0, 3)
              .map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200">{p.name}</p>
                    <p className="text-xs text-red-600 dark:text-red-400">Only {p.stock} units left!</p>
                  </div>
                </motion.div>
              ))}
            {products.filter((p) => p.stock <= p.minStock).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">All stock levels are healthy.</p>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default SalesModule;
