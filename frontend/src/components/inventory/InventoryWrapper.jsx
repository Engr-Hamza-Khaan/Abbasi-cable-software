import React, { useState } from 'react';
import ProductManagement from './ProductManagement';
import PurchaseModule from './PurchaseModule';
import SalesModule from './SalesModule';
import Reports from './Reports';
import { Package, ShoppingCart, ShoppingBag, BarChart3 } from 'lucide-react';

const InventoryWrapper = ({ products, setProducts, purchases, setPurchases, sales, setSales, setCashTransactions }) => {
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
      <div className="flex flex-wrap items-center bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubPage(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeSubPage === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-5 h-4" />
              <span className="text-sm">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Area */}
      <div className="transition-all duration-300">
        {activeSubPage === 'products' && (
          <ProductManagement products={products} setProducts={setProducts} />
        )}
        {activeSubPage === 'purchase' && (
          <PurchaseModule 
            products={products} setProducts={setProducts} 
            purchases={purchases} setPurchases={setPurchases} 
            setCashTransactions={setCashTransactions}
          />
        )}
        {activeSubPage === 'sales' && (
          <SalesModule 
            products={products} setProducts={setProducts} 
            sales={sales} setSales={setSales} 
            setCashTransactions={setCashTransactions}
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
