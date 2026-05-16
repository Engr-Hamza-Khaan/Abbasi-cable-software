import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShopStateProvider, useShopState } from './context/ShopStateContext';
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
import Ledger from './components/ledger/Ledger';
import Bulty from './components/bulty/Bulty';
import ReminderPage from './components/reminders/ReminderPage';

const AppContent = () => {
  const { user, logout } = useAuth();
  const { 
    products, setProducts, 
    purchases, setPurchases, 
    sales, setSales, 
    cashTransactions, setCashTransactions, 
    expenses, setExpenses 
  } = useShopState();

  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

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
                                    <Route path="/dashboard" element={user.role === 'admin' ? <Dashboard products={products} sales={sales} purchases={purchases} transactions={cashTransactions} expenses={expenses} /> : <Navigate to="/inventory" />} />
                  <Route path="/inventory" element={
                    <InventoryWrapper 
                      products={products} 
                      setProducts={setProducts} 
                      purchases={purchases} 
                      setPurchases={setPurchases} 
                      sales={sales} 
                      setSales={setSales} 
                      setCashTransactions={setCashTransactions}
                    />
                  } />
                  <Route path="/reports" element={<Reports purchases={purchases} sales={sales} />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/manufacturing" element={<Manufacturing />} />
                  <Route path="/zakat" element={<Zakat products={products} />} />
                  <Route path="/expense-home" element={<ExpenseManager type="home" expenses={expenses} setExpenses={setExpenses} setCashTransactions={setCashTransactions} />} />
                  <Route path="/expense-shop" element={<ExpenseManager type="shop" expenses={expenses} setExpenses={setExpenses} setCashTransactions={setCashTransactions} />} />
                  <Route path="/expense-transport" element={<ExpenseManager type="transport" expenses={expenses} setExpenses={setExpenses} setCashTransactions={setCashTransactions} />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Admin Only Routes */}
                <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                  <Route path="/cash-flow" element={<CashFlowDashboard transactions={cashTransactions} setTransactions={setCashTransactions} />} />
                  <Route path="/ledger" element={<Ledger sales={sales} transactions={cashTransactions} />} />
                  <Route path="/reminders" element={<ReminderPage />} />
                  <Route path="/bulty" element={<Bulty />} />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>

              {/* Legacy Page Rendering (Disabled but fixed for reference) */}
              {false && (
                <>
                  {currentPage === 'dashboard' && user.role === 'admin' && <Dashboard products={products} sales={sales} purchases={purchases} />}
                  {currentPage === 'inventory' && (
                    <InventoryWrapper 
                      products={products} 
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
        <ShopStateProvider>
          <AppContent />
        </ShopStateProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
