import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../layouts/Sidebar';
import Header from '../layouts/Header';
import ShopManagement from '../shops/ShopManagement';
import { Zap, Store, LogOut } from 'lucide-react';

const SuperAdminApp = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('shops');
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

  const goToShops = (id) => {
    setCurrentPage(id);
    navigate(`/${id}`);
    closeMobileMenu();
  };

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
        <aside
          className={`fixed lg:relative inset-y-0 left-0 z-40 flex flex-col h-full max-h-[100dvh] shrink-0
            w-72 max-w-[min(18rem,88vw)] transition-[transform,width] duration-300 ease-in-out
            ${sideBarCollapsed ? 'lg:w-20' : 'lg:w-72'}
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            bg-white/95 dark:bg-slate-900/95 lg:bg-white/80 lg:dark:bg-slate-900/80
            backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 shadow-xl lg:shadow-none`}
        >
          <div className="p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              {(!sideBarCollapsed || mobileMenuOpen) && (
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white">SBMS</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin</p>
                </div>
              )}
            </div>
          </div>
          <nav className="flex-1 p-4">
            <button
              type="button"
              onClick={() => goToShops('shops')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                currentPage === 'shops'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Store className="w-5 h-5" />
              {(!sideBarCollapsed || mobileMenuOpen) && (
                <span className="font-medium">Shops</span>
              )}
            </button>
          </nav>
          {(!sideBarCollapsed || mobileMenuOpen) && (
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Super Admin</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-500"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </aside>

        <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
          <Header
            sidebarCollapsed={sideBarCollapsed}
            onToggleSidebar={handleToggleSidebar}
            mobileMenuOpen={mobileMenuOpen}
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
            onLogout={logout}
            hideShopSelector
          />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="page-content">
              <Routes>
                <Route path="/shops" element={<ShopManagement />} />
                <Route path="/" element={<Navigate to="/shops" replace />} />
                <Route path="*" element={<Navigate to="/shops" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminApp;
