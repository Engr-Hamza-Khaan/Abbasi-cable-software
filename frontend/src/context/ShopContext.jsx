import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const { user } = useAuth();
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [shops, setShops] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/shops');
        setShops(response.data);
        
        // Initial shop selection logic
        if (user) {
          if (user.role === 'admin') {
            const storedShopId = localStorage.getItem('abbasi-cable-selected-shop');
            if (storedShopId) {
              setSelectedShopId(storedShopId);
            } else if (response.data.length > 0) {
              setSelectedShopId(response.data[0].id);
              localStorage.setItem('abbasi-cable-selected-shop', response.data[0].id);
            }
          } else {
            // Employee - always use their assigned shopId
            setSelectedShopId(user.shopId);
          }
        }
      } catch (err) {
        console.error('Error fetching shops:', err);
      } finally {
        setLoadingShops(false);
      }
    };

    fetchShops();
  }, [user]);

  const switchShop = (shopId) => {
    if (user && user.role === 'admin') {
      setSelectedShopId(shopId);
      localStorage.setItem('abbasi-cable-selected-shop', shopId);
    }
  };

  const getSelectedShopName = () => {
    const shop = shops.find(s => s.id === selectedShopId);
    return shop ? shop.name : 'Unknown Shop';
  };

  return (
    <ShopContext.Provider value={{ 
      selectedShopId, 
      setSelectedShopId: switchShop, 
      shops, 
      loadingShops,
      getSelectedShopName
    }}>
      {children}
    </ShopContext.Provider>
  );
};
