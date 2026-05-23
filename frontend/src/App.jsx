import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import PrivateRoute from './components/routing/PrivateRoute';
import { useState, useEffect } from 'react';

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
import Ledger from './components/ledger/Ledger';
import Bulty from './components/bulty/Bulty';
import ReminderPage from './components/reminders/ReminderPage';
import ActivityLogPage from './components/activity/ActivityLogPage';
import SuperAdminApp from './components/superadmin/SuperAdminApp';
import EmployeeManagement from './components/users/EmployeeManagement';

const PublicRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

const MainAppContent = () => {
  const { user, logout } = useAuth();
  const {
    productsWithTotalStock,
    products,
    setProducts,
    purchases,
    setPurchases,
    sales,
    setSales,
    cashTransactions,
    setCashTransactions,
    expenses,
    setExpenses,
    loading: inventoryLoading,
    error: inventoryError,
    refreshAll,
    getWriteShopId,
  } = useInventory();

  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileMenuOpen((open) => !open);
    } else {
      setSideBarCollapsed((c) => !c);
    }
  };

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const path = window.location.pathname.replace('/', '');
    if (path) setCurrentPage(path);
    else setCurrentPage('dashboard');
    closeMobileMenu();
  }, [window.location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) closeMobileMenu();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobileMenu}
        />
      )}
      <div className="flex h-screen h-[100dvh] overflow-hidden">
        <Sidebar
          collapsed={sideBarCollapsed}
          mobileOpen={mobileMenuOpen}
          onMobileClose={closeMobileMenu}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          inventoryCount={products.length}
          user={user}
          onLogout={logout}
        />

        <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden transition-all duration-300 ease-in-out">
          <Header
            sidebarCollapsed={sideBarCollapsed}
            onToggleSidebar={handleToggleSidebar}
            mobileMenuOpen={mobileMenuOpen}
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
            onLogout={logout}
          />

          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent safe-bottom">
            <div className="page-content">
              {inventoryLoading && (
                <div className="text-center py-4 text-slate-500">Loading data...</div>
              )}
              {inventoryError && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
                  {inventoryError}
                  <button type="button" onClick={refreshAll} className="ml-4 underline font-bold">
                    Retry
                  </button>
                </div>
              )}
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route element={<PrivateRoute allowedRoles={['admin', 'employee']} />}>
                  <Route
                    path="/dashboard"
                    element={
                      user.role === 'admin' ? (
                        <Dashboard
                          products={productsWithTotalStock}
                          sales={sales}
                          purchases={purchases}
                          transactions={cashTransactions}
                          expenses={expenses}
                        />
                      ) : (
                        <Navigate to="/inventory" />
                      )
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <InventoryWrapper
                        products={productsWithTotalStock}
                        setProducts={setProducts}
                        purchases={purchases}
                        setPurchases={setPurchases}
                        sales={sales}
                        setSales={setSales}
                        setCashTransactions={setCashTransactions}
                        getWriteShopId={getWriteShopId}
                        refreshAll={refreshAll}
                      />
                    }
                  />
                  <Route path="/reports" element={<Reports purchases={purchases} sales={sales} />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/manufacturing" element={<Manufacturing getWriteShopId={getWriteShopId} />} />
                  <Route path="/zakat" element={<Zakat products={productsWithTotalStock} />} />
                  <Route
                    path="/expense-home"
                    element={
                      <ExpenseManager
                        type="home"
                        expenses={expenses}
                        setExpenses={setExpenses}
                        setCashTransactions={setCashTransactions}
                        getWriteShopId={getWriteShopId}
                      />
                    }
                  />
                  <Route
                    path="/expense-shop"
                    element={
                      <ExpenseManager
                        type="shop"
                        expenses={expenses}
                        setExpenses={setExpenses}
                        setCashTransactions={setCashTransactions}
                        getWriteShopId={getWriteShopId}
                      />
                    }
                  />
                  <Route
                    path="/expense-transport"
                    element={
                      <ExpenseManager
                        type="transport"
                        expenses={expenses}
                        setExpenses={setExpenses}
                        setCashTransactions={setCashTransactions}
                        getWriteShopId={getWriteShopId}
                      />
                    }
                  />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                  <Route
                    path="/cash-flow"
                    element={
                      <CashFlowDashboard
                        transactions={cashTransactions}
                        setTransactions={setCashTransactions}
                        getWriteShopId={getWriteShopId}
                      />
                    }
                  />
                  <Route
                    path="/ledger"
                    element={
                      <Ledger
                        sales={sales}
                        transactions={cashTransactions}
                        getWriteShopId={getWriteShopId}
                      />
                    }
                  />
                  <Route path="/reminders" element={<ReminderPage />} />
                  <Route path="/bulty" element={<Bulty getWriteShopId={getWriteShopId} />} />
                  <Route path="/activity-logs" element={<ActivityLogPage />} />
                  <Route path="/employees" element={<EmployeeManagement />} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <PublicRoutes />;
  }

  if (user.role === 'super-admin') {
    return <SuperAdminApp />;
  }

  return (
    <InventoryProvider>
      <MainAppContent />
    </InventoryProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ShopProvider>
          <AppShell />
        </ShopProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
