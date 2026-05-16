import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useShop } from './ShopContext';
import {
  fetchProducts,
  fetchPurchases,
  fetchSales,
  fetchCashTransactions,
  fetchExpenses,
} from '../services/api';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const { user } = useAuth();
  const { selectedShopId, getShopQueryParams } = useShop();

  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [cashTransactions, setCashTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getWriteShopId = () => {
    if (user?.role === 'employee') return user.shopId;
    return selectedShopId || null;
  };

  const refreshAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const shopParams = getShopQueryParams();
      const [p, pu, s, c, e] = await Promise.all([
        fetchProducts(shopParams),
        fetchPurchases(shopParams),
        fetchSales(shopParams),
        user.role === 'admin' ? fetchCashTransactions(shopParams) : Promise.resolve([]),
        fetchExpenses(shopParams),
      ]);
      setProducts(p);
      setPurchases(pu);
      setSales(s);
      setCashTransactions(c);
      setExpenses(e);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedShopId]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const productsWithTotalStock = products.map((p) => ({
    ...p,
    stock: (p.variants || []).reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0),
  }));

  return (
    <InventoryContext.Provider
      value={{
        products,
        setProducts,
        productsWithTotalStock,
        purchases,
        setPurchases,
        sales,
        setSales,
        cashTransactions,
        setCashTransactions,
        expenses,
        setExpenses,
        loading,
        error,
        refreshAll,
        getWriteShopId,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
