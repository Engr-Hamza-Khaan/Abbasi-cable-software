import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ShopStateContext = createContext();

export const useShopState = () => useContext(ShopStateContext);

export const ShopStateProvider = ({ children }) => {
  const { selectedShopId } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [cashTransactions, setCashTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data when shop changes
  useEffect(() => {
    if (!selectedShopId) return;
    
    setIsLoaded(false);
    
    const prefix = `shop-${selectedShopId}-`;
    
    const loadData = (key, defaultValue) => {
      const saved = localStorage.getItem(prefix + key);
      return saved ? JSON.parse(saved) : defaultValue;
    };

    setProducts(loadData('inventory-products', []));
    setPurchases(loadData('inventory-purchases', []));
    setSales(loadData('inventory-sales', []));
    setCashTransactions(loadData('cashTransactions', []));
    setExpenses(loadData('inventory-expenses', []));
    
    setIsLoaded(true);
  }, [selectedShopId]);

  // Save data when state changes
  useEffect(() => {
    if (!selectedShopId || !isLoaded) return;
    
    const prefix = `shop-${selectedShopId}-`;
    
    localStorage.setItem(prefix + 'inventory-products', JSON.stringify(products));
    localStorage.setItem(prefix + 'inventory-purchases', JSON.stringify(purchases));
    localStorage.setItem(prefix + 'inventory-sales', JSON.stringify(sales));
    localStorage.setItem(prefix + 'cashTransactions', JSON.stringify(cashTransactions));
    localStorage.setItem(prefix + 'inventory-expenses', JSON.stringify(expenses));
  }, [products, purchases, sales, cashTransactions, expenses, selectedShopId, isLoaded]);

  const productsWithTotalStock = products.map(p => ({
    ...p,
    stock: (p.variants || []).reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
  }));

  return (
    <ShopStateContext.Provider value={{
      products: productsWithTotalStock,
      setProducts,
      purchases,
      setPurchases,
      sales,
      setSales,
      cashTransactions,
      setCashTransactions,
      expenses,
      setExpenses,
      isLoaded
    }}>
      {children}
    </ShopStateContext.Provider>
  );
};
