
import {
  Menu,
  Search,
  Filter,
  Sun,
  Moon,
  Plus,
  Bell,
  Settings,
  Store,
} from "lucide-react";
import profileImage from "../../assets/profilePic.jpg";
import { useShop } from "../../context/ShopContext";

function Header({ sidebarCollapsed, onToggleSidebar, theme, toggleTheme, user }) {
  const { selectedShopId, setSelectedShopId, shops, getSelectedShopName } = useShop();

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-50">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          {/* Menu Button (Always visible) */}
          <button
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={onToggleSidebar}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Dashboard Title (Hidden on small screens) */}
          <div className="hidden xl:block">
            <h1 className="text-lg md:text-2xl font-black text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
              Welcome back, {user?.name || 'User'}! What’s happening today?
            </p>
          </div>
        </div>

        {/* Center - Shop Selection */}
        <div className="w-full sm:w-auto flex-1 max-w-md order-last sm:order-none">
          {user?.role === 'admin' ? (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Store className="h-5 w-5 text-blue-500" />
              </div>
              <select
                value={selectedShopId || ''}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer appearance-none shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id} className="bg-white dark:bg-slate-900 font-medium">
                    {shop.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              <Store className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                {getSelectedShopName()}
              </span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Quick Action Button (Hidden on small screens) */}
          {/* <button className="hidden lg:flex items-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow transition-all">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New</span>
          </button> */}

          {/* Theme Toggle */}
          <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={toggleTheme}>
            {theme === 'light' ? (<Sun className="w-5 h-5" />) : (<Moon className="w-5 h-5" />)}
          </button>

          {/* Notification */}
          <button className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* Settings */}
          <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-700">
            <img
              src={profileImage}
              alt="User"
              className="w-8 h-8 rounded-full ring-2 ring-blue-500 object-cover"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Hamza Khan
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
