import Sidebar from './components/layouts/Sidebar';
import Header from './components/layouts/Header';
import { useState, useEffect } from 'react';
import Dashboard from './components/dashboard/Dashboard';
import InventoryWrapper from './components/inventory/InventoryWrapper';
import CashFlowDashboard from './components/cashflow/CashFlowDashboard';

function App() {
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  
  // Lifted Inventory State
  const [products, setProducts] = useState(() => {
    const item = window.localStorage.getItem('inventory-products');
    const initialProducts = [
      { 
        id: 1, name: 'Copper Cable 2.5mm', unit: 'meter', minStock: 200,
        variants: [
          { id: 'v1', label: 'Batch A - 100m', stock: 50, unitPrice: 120, date: '2025-03-20' },
          { id: 'v2', label: 'Batch B - 150m', stock: 1200, unitPrice: 115, date: '2025-04-05' }
        ]
      },
      { 
        id: 2, name: 'Copper Cable 4.0mm', unit: 'meter', minStock: 150,
        variants: [{ id: 'v3', label: 'Main Stock', stock: 840, unitPrice: 180, date: '2025-03-15' }]
      },
      { 
        id: 3, name: 'Armored Cable 10mm', unit: 'meter', minStock: 100,
        variants: [{ id: 'v4', label: 'Warehouse A', stock: 45, unitPrice: 850, date: '2025-04-01' }]
      },
    ];

    if (item) {
      const parsed = JSON.parse(item);
      // Migration: Ensure all old products have a variants array
      return parsed.map(p => ({
        ...p,
        variants: p.variants || [
          { id: Date.now() + Math.random(), label: 'Default Batch', stock: p.stock || 0, unitPrice: 0 }
        ],
        stock: undefined // We will compute this dynamically
      }));
    }
    return initialProducts;
  });

  // Derived state to get total stock for display
  const productsWithTotalStock = products.map(p => ({
    ...p,
    stock: p.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
  }));
  
  const [purchases, setPurchases] = useState(() => {
    const item = window.localStorage.getItem('inventory-purchases');
    return item ? JSON.parse(item) : [
      { id: 101, productId: 1, productName: 'Copper Cable 2.5mm', quantity: 500, unitPrice: 120, vendor: 'Copper King Ltd.', date: '2025-03-25', total: 60000 },
      { id: 102, productId: 2, productName: 'Copper Cable 4.0mm', quantity: 300, unitPrice: 180, vendor: 'Metals Global', date: '2025-03-28', total: 54000 },
      { id: 103, productId: 3, productName: 'Armored Cable 10mm', quantity: 50, unitPrice: 850, vendor: 'Heavy Industry Inc.', date: '2025-04-01', total: 42500 },
      { id: 104, productId: 4, productName: 'Flexible Cable 1.5mm', quantity: 1000, unitPrice: 45, vendor: 'Metals Global', date: '2025-04-02', total: 45000 },
    ];
  });
  
  const [sales, setSales] = useState(() => {
    const item = window.localStorage.getItem('inventory-sales');
    return item ? JSON.parse(item) : [
      { id: 201, productId: 1, productName: 'Copper Cable 2.5mm', quantity: 120, customer: 'Skyline Towers Project', date: '2025-04-01', total: 14400 },
      { id: 202, productId: 2, productName: 'Copper Cable 4.0mm', quantity: 80, customer: 'Blue City Mall', date: '2025-04-02', total: 14400 },
      { id: 203, productId: 5, productName: 'Control Cable 7 Core', quantity: 30, customer: 'Private Industrial Unit', date: '2025-04-03', total: 6000 },
      { id: 204, productId: 1, productName: 'Copper Cable 2.5mm', quantity: 60, customer: 'Ahmed Electricals', date: '2025-04-03', total: 7200 },
    ];
  });

  const [cashTransactions, setCashTransactions] = useState(() => {
    const item = window.localStorage.getItem('cashTransactions');
    return item ? JSON.parse(item) : [];
  });

  // Persist state to localStorage on change
  useEffect(() => {
    window.localStorage.setItem('inventory-products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    window.localStorage.setItem('inventory-purchases', JSON.stringify(purchases));
  }, [purchases]);
  useEffect(() => {
    window.localStorage.setItem('inventory-sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    window.localStorage.setItem('cashTransactions', JSON.stringify(cashTransactions));
  }, [cashTransactions]);

  // Sync Logic
  useEffect(() => {
    let updated = false;
    const newTransactions = [...cashTransactions];

    // Sync Purchases to Expenses
    purchases.forEach(p => {
      const exists = newTransactions.find(t => t.source === 'purchase' && t.referenceId === p.id);
      if (!exists) {
        newTransactions.push({
          id: Date.now() + Math.random(),
          type: 'expense',
          amount: p.total,
          source: 'purchase',
          referenceId: p.id,
          description: `Purchase of ${p.productName} (${p.quantity} ${p.unit || 'unit'})`,
          date: p.date
        });
        updated = true;
      } else if (exists.amount !== p.total || exists.date !== p.date) {
        // Update if amount or date changed
        const idx = newTransactions.findIndex(t => t.id === exists.id);
        newTransactions[idx] = { ...exists, amount: p.total, date: p.date };
        updated = true;
      }
    });

    // Sync Sales to Income
    sales.forEach(s => {
      const exists = newTransactions.find(t => t.source === 'sale' && t.referenceId === s.id);
      if (!exists) {
        newTransactions.push({
          id: Date.now() + Math.random(),
          type: 'income',
          amount: s.total,
          source: 'sale',
          referenceId: s.id,
          description: `Sale of ${s.productName} to ${s.customer}`,
          date: s.date
        });
        updated = true;
      } else if (exists.amount !== s.total || exists.date !== s.date) {
        // Update if amount or date changed
        const idx = newTransactions.findIndex(t => t.id === exists.id);
        newTransactions[idx] = { ...exists, amount: s.total, date: s.date };
        updated = true;
      }
    });

    // Handle Deletions (if a purchase or sale was deleted)
    const validPurchaseIds = purchases.map(p => p.id);
    const validSaleIds = sales.map(s => s.id);
    
    const finalTransactions = newTransactions.filter(t => {
      if (t.source === 'purchase') return validPurchaseIds.includes(t.referenceId);
      if (t.source === 'sale') return validSaleIds.includes(t.referenceId);
      return true; // Keep manual transactions
    });

    if (finalTransactions.length !== cashTransactions.length || updated) {
      setCashTransactions(finalTransactions);
    }
  }, [purchases, sales]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50
      dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500"
    >
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          collapsed={sideBarCollapsed}
          onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          inventoryCount={products.length}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
          {/* Header */}
          <Header
            sidebarCollapsed={sideBarCollapsed}
            onToggleSidebar={() => setSideBarCollapsed(!sideBarCollapsed)}
            theme={theme} toggleTheme={toggleTheme}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-transparent">
            <div className="p-6 space-y-6">
              {currentPage === 'dashboard' && <Dashboard products={productsWithTotalStock} sales={sales} purchases={purchases} />}
              {currentPage === 'inventory' && (
                <InventoryWrapper 
                  products={productsWithTotalStock} 
                  setProducts={setProducts} 
                  purchases={purchases} setPurchases={setPurchases} 
                  sales={sales} setSales={setSales} 
                />
              )}
              {currentPage === 'cash-flow' && (
                <CashFlowDashboard transactions={cashTransactions} setTransactions={setCashTransactions} />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
