// With Framer Motion
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Calendar,
  ChevronDown,
  CreditCard,
  DollarSignIcon,
  FileText,
  icons,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Users,
  Zap
} from 'lucide-react'

import profileImage from '../../assets/profilePic.jpg'

const adminMenuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: "Dashboard", badge: "New" },
  { id: 'inventory', icon: Package, label: "Inventory" },
  { id: 'cash-flow', icon: CreditCard, label: "Cash Flow" },
  { id: 'attendance', icon: Calendar, label: "Attendance" },
  { id: 'manufacturing', icon: Zap, label: "Manufacturing" },
  { id: 'zakat', icon: DollarSignIcon, label: "Zakat" },
  { 
    id: 'expense', 
    icon: ShoppingBag, 
    label: "Expense",
    submenu: [
      { id: 'expense-home', label: "Home" },
      { id: 'expense-shop', label: "Shop" },
      { id: 'expense-transport', label: "Transport" },
    ]
  },
  { id: 'reports', icon: FileText, label: "Reports" },
  { id: 'settings', icon: Settings, label: "Settings" },
];

const userMenuItems = [
  { id: 'inventory', icon: Package, label: "Inventory" },
  { id: 'reports', icon: FileText, label: "Reports" },
];

function Sidebar({ collapsed, onToggle, currentPage, onPageChange, inventoryCount, user, onLogout }) {
  const navigate = useNavigate();
  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems;
  const [expandeditems, setExpandedItems] = useState(new Set(['analytics']));
  const toogleExpended = (itemid) => {
    const newExpended = new Set(expandeditems);

    if (newExpended.has(itemid)) {
      newExpended.delete(itemid);
    } else {
      newExpended.add(itemid);
    }
    setExpandedItems(newExpended);
  };

  return (
    <div className={`${collapsed ? 'w-20' : 'w-72'} transition-[width] duration-500 ease-in-out bg-white/80 dark:bg-slate-900/80
    backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col relative z-10`}>
      {/* Logo */}
      <div className='p-6 border-b border-slate-200/50 dark:border-slate-700/50'>
        <div className='flex items-center space-x-3'>
          <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg'>
            <Zap className='w-6 h-6 text-white' />
          </div>

          {/* Conditional Rendering */}
          {!collapsed && (
            <div>
              <h1 className='text-xl font-bold text-slate-800 dark:text-white'>SBMS</h1>
              <p className='text-xs text-slate-500 dark:text-slate-400'>Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
        {menuItems.map((item) => {
          return (
            <div key={item.id}>
              <button className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 
                ${currentPage === item.id
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 "
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 "
                }`} onClick={() => {
                  if (item.submenu) {
                    toogleExpended(item.id);
                  } else {
                    onPageChange(item.id);
                    navigate(`/${item.id}`);
                  }
                }}>

                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5`} />
                  {/* Conditional Rendering */}

                  {!collapsed && (
                    <>
                      <span className='font-medium ml-2'>{item.label}</span>

                      {item.badge && (
                        <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.id === 'inventory' ? (
                        <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                          {inventoryCount}
                        </span>
                      ) : item.count && (
                        <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}



                </div>

                {!collapsed && item.submenu && (
                  <ChevronDown className='w-4 h-4 transition-transform' />
                )}
              </button>

              {/* Sub Menu */}
              {!collapsed && item.submenu && expandeditems.has(item.id) && (
                <div className='ml-8 mt-2 space-y-1'>
                  {item.submenu.map((subitem) => {
                    return <button 
                      key={subitem.id}
                      onClick={() => {
                        onPageChange(subitem.id);
                        navigate(`/${subitem.id}`);
                      }}
                      className={`w-full text-left p-2 text-sm rounded-lg transition-all 
                        ${currentPage === subitem.id 
                          ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 font-bold" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                        }`}
                    >
                      {subitem.label}
                    </button>
                  })}
                </div>
              )}

            </div>
          )
        })}
      </nav>

      {/* User profile */}
      {!collapsed && (
        <div className='p-4 border-t border-slate-200/50 dark:border-slate-700/50'>
          <div className='flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50'>
            <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold ring-2 ring-blue-500'>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-slate-800 dark:text-white truncate'>
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">
                  {user?.role || 'Staff'}
                </p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <icons.LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar

// New Code 

// import React, { useState } from "react";
// import {
//   BarChart3,
//   Calendar,
//   ChevronDown,
//   CreditCard,
//   FileText,
//   LayoutDashboard,
//   MessageSquare,
//   Package,
//   Settings,
//   ShoppingBag,
//   Users,
//   Zap,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import profileImage from "../../assets/profilePic.jpg";

// const menuItems = [
//     id: "dashboard",
//     icon: LayoutDashboard,
//     label: "Dashboard",
//     badge: "New",
//   },
//   {
//     id: "analytics",
//     icon: BarChart3,
//     label: "Analytics",
//     submenu: [
//       { id: "overview", label: "Overview" },
//       { id: "reports", label: "Reports" },
//       { id: "insights", label: "Insights" },
//     ],
//   },
//   {
//     id: "users",
//     icon: Users,
//     label: "Users",
//     count: "2.4k",
//     submenu: [
//       { id: "all-user", label: "All Users" },
//       { id: "roles", label: "Roles & Permission" },
//       { id: "activity", label: "User Activity" },
//     ],
//   },
//   {
//     id: "inventory",
//     icon: Package,
//     label: "Inventory",
//     count: "847",
//   },
//   {
//     id: "transactions",
//     icon: CreditCard,
//     label: "Transactions",
//   },
//   {
//     id: "messages",
//     icon: MessageSquare,
//     label: "Messages",
//     badge: "12",
//   },
//   {
//     id: "calendar",
//     icon: Calendar,
//     label: "Calendar",
//   },
//   {
//     id: "reports",
//     icon: FileText,
//     label: "Reports",
//   },
//   {
//     id: "settings",
//     icon: Settings,
//     label: "Settings",
//   },
// ];

// function Sidebar({ collapsed, onToggle, currentPage, onPageChange }) {
//   const [expandeditems, setExpandedItems] = useState(new Set(["analytics"]));

//   const toggleExpanded = (itemid) => {
//     const newExpanded = new Set(expandeditems);
//     if (newExpanded.has(itemid)) newExpanded.delete(itemid);
//     else newExpanded.add(itemid);
//     setExpandedItems(newExpanded);
//   };

//   return (
//     <motion.div
//       animate={{
//         width: collapsed ? 80 : 288, // 80px = w-20, 288px = w-72
//         transition: { type: "spring", stiffness: 100, damping: 15 },
//       }}
//       className="h-screen bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col relative z-10"
//     >
//       {/* Logo */}
//       <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
//         <div className="flex items-center space-x-3">
//           <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//             <Zap className="w-6 h-6 text-white" />
//           </div>

//           <AnimatePresence>
//             {!collapsed && (
//               <motion.div
//                 initial={{ opacity: 0, x: -10 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -10 }}
//                 transition={{ duration: 0.2 }}
//               >
//                 <h1 className="text-xl font-bold text-slate-800 dark:text-white">
//                   Nexus
//                 </h1>
//                 <p className="text-xs text-slate-500 dark:text-slate-400">
//                   Admin Panel
//                 </p>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
//         {menuItems.map((item) => (
//           <div key={item.id}>
//             <button
//               onClick={() => {
//                 if (item.submenu) toggleExpanded(item.id);
//                 else onPageChange(item.id);
//               }}
//                 ${
//                   currentPage === item.id
//                     ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
//                     : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
//                 }`}
//             >
//               <div className="flex items-center space-x-3">
//                 <item.icon className="w-5 h-5" />
//                 <AnimatePresence>
//                   {!collapsed && (
//                     <motion.div
//                       initial={{ opacity: 0, x: -10 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       exit={{ opacity: 0, x: -10 }}
//                       transition={{ duration: 0.2 }}
//                       className="flex items-center gap-2"
//                     >
//                       <span className="font-medium">{item.label}</span>
//                       {item.badge && (
//                         <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
//                           {item.badge}
//                         </span>
//                       )}
//                       {item.count && (
//                         <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
//                           {item.count}
//                         </span>
//                       )}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </div>
//               {!collapsed && item.submenu && (
//                 <ChevronDown
//                   className={`w-4 h-4 transition-transform ${
//                     expandeditems.has(item.id) ? "rotate-180" : ""
//                   }`}
//                 />
//               )}
//             </button>

//             {/* Submenu Animation */}
//             <AnimatePresence>
//               {!collapsed && item.submenu && expandeditems.has(item.id) && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   transition={{ duration: 0.3, ease: "easeInOut" }}
//                   className="ml-8 mt-2 space-y-1"
//                 >
//                   {item.submenu.map((subitem) => (
//                     <button
//                       key={subitem.id}
//                       className="w-full text-left p-2 text-sm text-slate-600
//                       dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200
//                       hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-all"
//                     >
//                       {subitem.label}
//                     </button>
//                   ))}
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         ))}
//       </nav>

//       {/* User Profile */}
//       <AnimatePresence>
//         {!collapsed && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 10 }}
//             transition={{ duration: 0.3 }}
//             className="p-4 border-t border-slate-200/50 dark:border-slate-700/50"
//           >
//             <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
//               <img
//                 src={profileImage}
//                 alt="User"
//                 className="w-10 h-10 rounded-full ring-2 ring-blue-500"
//               />
//               <div>
//                 <p className="text-sm font-medium text-slate-800 dark:text-white">
//                   Hamza Khan
//                 </p>
//                 <p className="text-xs text-slate-500 dark:text-slate-400">
//                   Administrator
//                 </p>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// }

// export default Sidebar;

// V3 Code
// import { useState } from "react";
// import {
//   LayoutDashboard,
//   Settings,
//   LogOut,
//   Menu,
// } from "lucide-react";

// function Sidebar({ collapsed, onToggle, currentPage, onPageChange }) {
//   const [hovered, setHovered] = useState(false);

//   const isExpanded = hovered || !collapsed;

//   const menuItems = [
//     { name: "dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
//     { name: "settings", icon: <Settings size={20} />, label: "Settings" },
//     { name: "logout", icon: <LogOut size={20} />, label: "Logout" },
//   ];

//   return (
//     <>
//       {/* Sidebar container */}
//       <div
//         className={`fixed top-0 left-0 h-full bg-white dark:bg-slate-900 shadow-lg border-r 
//         border-slate-200/50 dark:border-slate-700/50
//         transition-transform duration-300 ease-in-out
//         ${collapsed ? "-translate-x-44" : "translate-x-0"} 
//         w-64 z-40`}
//         onMouseEnter={() => setHovered(true)}
//         onMouseLeave={() => setHovered(false)}
//       >
//         {/* Sidebar Header */}
//         <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700/50">
//           <h1
//             className={`text-lg font-semibold text-slate-800 dark:text-slate-200 transition-opacity duration-300 ${
//               isExpanded ? "opacity-100" : "opacity-0"
//             }`}
//           >
//             My Dashboard
//           </h1>
//           <button
//             onClick={onToggle}
//             className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
//           >
//             <Menu size={20} />
//           </button>
//         </div>

//         {/* Menu Items */}
//         <div className="flex flex-col gap-1 mt-4 px-2">
//           {menuItems.map((item) => (
//             <button
//               key={item.name}
//               onClick={() => onPageChange(item.name)}
//               className={`flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 
//               hover:bg-blue-100 dark:hover:bg-slate-800 transition-all ${
//                 currentPage === item.name
//                   ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
//                   : ""
//               }`}
//             >
//               {item.icon}
//               <span
//                 className={`whitespace-nowrap transition-all duration-300 ${
//                   isExpanded ? "opacity-100" : "opacity-0 w-0"
//                 }`}
//               >
//                 {item.label}
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Content padding so sidebar doesn't overlap */}
//       <div
//         className={`transition-all duration-300 ease-in-out ${
//           collapsed ? "ml-20" : "ml-64"
//         }`}
//       ></div>
//     </>
//   );
// }

// export default Sidebar;

