import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import PrivateRoute from './components/routing/PrivateRoute';
import { useState, useEffect } from 'react';

// Components
import Sidebar from './components/layouts/Sidebar';
import Header from './components/layouts/Header';
import Dashboard from './components/dashboard/Dashboard';
import InventoryWrapper from './components/inventory/InventoryWrapper';
import CashFlowDashboard from './components/cashflow/CashFlowDashboard';
import Reports from './components/inventory/Reports';
import Attendance from './components/attendance/Attendance';
import Settings from './components/settings/Settings';
import Manufacturing from './components/manufacturing/Manufacturing';
import Zakat from './components/zakat/Zakat';
import ExpenseManager from './components/expense/ExpenseManager';

const AppContent = () => {
  const { user, logout } = useAuth();
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Lifted Inventory State (Moved from original App.jsx)
  const [products, setProducts] = useState(() => {
    const item = window.localStorage.getItem('inventory-products');
    if (item) {
      const parsed = JSON.parse(item);
      return parsed.map(p => ({
        ...p,
        variants: p.variants || [{ id: Date.now() + Math.random(), label: 'Default Batch', stock: p.stock || 0, unitPrice: 0 }],
        stock: undefined
      }));
    }
    return [
      { id: 1, name: 'Copper Cable 2.5mm', unit: 'meter', minStock: 200, variants: [{ id: 'v1', label: 'Batch A - 100m', stock: 50, unitPrice: 120, date: '2025-03-20' }, { id: 'v2', label: 'Batch B - 150m', stock: 1200, unitPrice: 115, date: '2025-04-05' }] },
      { id: 2, name: 'Copper Cable 4.0mm', unit: 'meter', minStock: 150, variants: [{ id: 'v3', label: 'Main Stock', stock: 840, unitPrice: 180, date: '2025-03-15' }] },
      { id: 3, name: 'Armored Cable 10mm', unit: 'meter', minStock: 100, variants: [{ id: 'v4', label: 'Warehouse A', stock: 45, unitPrice: 850, date: '2025-04-01' }] },
    ];
  });

  const productsWithTotalStock = products.map(p => ({
    ...p,
    stock: p.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
  }));

  const [purchases, setPurchases] = useState(() => {
    const item = window.localStorage.getItem('inventory-purchases');
    return item ? JSON.parse(item) : [];
  });

  const [sales, setSales] = useState(() => {
    const item = window.localStorage.getItem('inventory-sales');
    return item ? JSON.parse(item) : [];
  });

  const [cashTransactions, setCashTransactions] = useState(() => {
    const item = window.localStorage.getItem('cashTransactions');
    return item ? JSON.parse(item) : [];
  });

  useEffect(() => {
    window.localStorage.setItem('inventory-products', JSON.stringify(products));
    window.localStorage.setItem('inventory-purchases', JSON.stringify(purchases));
    window.localStorage.setItem('inventory-sales', JSON.stringify(sales));
    window.localStorage.setItem('cashTransactions', JSON.stringify(cashTransactions));
  }, [products, purchases, sales, cashTransactions]);

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  // Sync currentPage with URL for sidebar highlighting
  useEffect(() => {
    const path = window.location.pathname.replace('/', '');
    if (path) {
      setCurrentPage(path);
    } else {
      setCurrentPage('dashboard');
    }
  }, [window.location.pathname]);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          collapsed={sideBarCollapsed}
          onToggle={() => setSideBarCollapsed(!sideBarCollapsed)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          inventoryCount={products.length}
          user={user}
          onLogout={logout}
        />

        <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
          <Header
            sidebarCollapsed={sideBarCollapsed}
            onToggleSidebar={() => setSideBarCollapsed(!sideBarCollapsed)}
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
            onLogout={logout}
          />

          <main className="flex-1 overflow-y-auto bg-transparent">
            <div className="p-6 space-y-6">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Protected Routes */}
                <Route element={<PrivateRoute allowedRoles={['admin', 'user']} />}>
                  <Route path="/dashboard" element={user.role === 'admin' ? <Dashboard products={productsWithTotalStock} sales={sales} purchases={purchases} /> : <Navigate to="/inventory" />} />
                  <Route path="/inventory" element={
                    <InventoryWrapper 
                      products={productsWithTotalStock} 
                      setProducts={setProducts} 
                      purchases={purchases} 
                      setPurchases={setPurchases} 
                      sales={sales} 
                      setSales={setSales} 
                    />
                  } />
                  <Route path="/reports" element={<Reports purchases={purchases} sales={sales} />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/manufacturing" element={<Manufacturing />} />
                  <Route path="/zakat" element={<Zakat />} />
                  <Route path="/expense-home" element={<ExpenseManager type="home" />} />
                  <Route path="/expense-shop" element={<ExpenseManager type="shop" />} />
                  <Route path="/expense-transport" element={<ExpenseManager type="transport" />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Admin Only Routes */}
                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                  <Route path="/cash-flow" element={<CashFlowDashboard transactions={cashTransactions} setTransactions={setCashTransactions} />} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>

              {/* Legacy Page Rendering (Disabled but fixed for reference) */}
              {false && (
                <>
                  {currentPage === 'dashboard' && user.role === 'admin' && <Dashboard products={productsWithTotalStock} sales={sales} purchases={purchases} />}
                  {currentPage === 'inventory' && (
                    <InventoryWrapper 
                      products={productsWithTotalStock} 
                      setProducts={setProducts} 
                      purchases={purchases} setPurchases={setPurchases} 
                      sales={sales} setSales={setSales} 
                    />
                  )}
                  {currentPage === 'cash-flow' && user.role === 'admin' && (
                    <CashFlowDashboard transactions={cashTransactions} setTransactions={setCashTransactions} />
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
