import React, { useState } from 'react';
import ProductManagement from './ProductManagement';
import PurchaseModule from './PurchaseModule';
import SalesModule from './SalesModule';
import Reports from './Reports';
import { Package, ShoppingCart, ShoppingBag, BarChart3 } from 'lucide-react';

const InventoryWrapper = ({ products, setProducts, purchases, setPurchases, sales, setSales, setCashTransactions, getWriteShopId, refreshAll }) => {
  const [activeSubPage, setActiveSubPage] = useState('products');

  const tabs = [
    { id: 'products', name: 'Products', icon: Package },
    { id: 'purchase', name: 'Purchase (In)', icon: ShoppingCart },
    { id: 'sales', name: 'Sales (Out)', icon: ShoppingBag },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 sm:gap-0 items-stretch sm:items-center w-full sm:w-auto bg-white dark:bg-slate-800 p-1.5 sm:p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubPage(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center sm:justify-start space-x-1.5 sm:space-x-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all text-xs sm:text-sm ${
                activeSubPage === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-4 shrink-0" />
              <span className="truncate">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Area */}
      <div className="transition-all duration-300">
        {activeSubPage === 'products' && (
          <ProductManagement products={products} setProducts={setProducts} getWriteShopId={getWriteShopId} refreshAll={refreshAll} />
        )}
        {activeSubPage === 'purchase' && (
          <PurchaseModule 
            products={products} setProducts={setProducts} 
            purchases={purchases} setPurchases={setPurchases} 
            setCashTransactions={setCashTransactions}
            getWriteShopId={getWriteShopId}
            refreshAll={refreshAll}
          />
        )}
        {activeSubPage === 'sales' && (
          <SalesModule 
            products={products} setProducts={setProducts} 
            sales={sales} setSales={setSales} 
            setCashTransactions={setCashTransactions}
            getWriteShopId={getWriteShopId}
            refreshAll={refreshAll}
          />
        )}
        {activeSubPage === 'reports' && (
          <Reports purchases={purchases} sales={sales} />
        )}
      </div>
    </div>
  );
};

export default InventoryWrapper;
