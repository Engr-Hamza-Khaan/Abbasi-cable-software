
import {
  Menu,
  Sun,
  Moon,
  Store,
  Filter,
} from "lucide-react";
import { useShop } from "../../context/ShopContext";

function Header({ sidebarCollapsed, onToggleSidebar, mobileMenuOpen, theme, toggleTheme, user }) {
  const { selectedShopId, setSelectedShopId, shops, getSelectedShopName } = useShop();

  const shopSelector = user?.role === 'admin' ? (
    <div className="relative group w-full">
      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
        <Store className="h-5 w-5 text-blue-500 shrink-0" />
      </div>
      <select
        value={selectedShopId || ''}
        onChange={(e) => setSelectedShopId(e.target.value)}
        className="w-full pl-10 sm:pl-11 pr-9 sm:pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer appearance-none shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 truncate"
      >
        {shops.map((shop) => (
          <option key={shop.id} value={shop.id} className="bg-white dark:bg-slate-900 font-medium">
            {shop.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center pointer-events-none">
        <Filter className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center gap-2 sm:gap-3 w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl min-w-0">
      <Store className="h-5 w-5 text-blue-500 shrink-0" />
      <span className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider truncate">
        {getSelectedShopName()}
      </span>
    </div>
  );

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-3 sm:px-4 md:px-6 py-3 md:py-4 sticky top-0 z-50">
      <div className="flex items-center gap-2 md:gap-3">
        {/* Left: menu + titles (desktop) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:block p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:block lg:hidden min-w-0">
            <h1 className="text-base font-bold text-slate-800 dark:text-white truncate">SBMS</h1>
          </div>

          <div className="hidden xl:block">
            <h1 className="text-lg md:text-2xl font-black text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
              Welcome back, {user?.name || 'User'}! What’s happening today?
            </p>
          </div>
        </div>

        {/* Shop selector — full remaining width on mobile */}
        <div className="flex-1 min-w-0 md:max-w-md">
          {shopSelector}
        </div>

        {/* Theme + profile — tablet/desktop only */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
          <button
            type="button"
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 lg:gap-3 min-w-0 pl-2 lg:pl-3 border-l border-slate-200 dark:border-slate-700">
            <div
              className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-blue-500 shrink-0"
              aria-hidden="true"
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px] lg:max-w-[180px]">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">
                {user?.role === 'admin' ? 'Administrator' : 'Employee'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
