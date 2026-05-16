import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { getMainBranchShopId, resolveAdminShopId } from '../utils/shopUtils';

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
        const shopList = response.data;
        setShops(shopList);

        if (user) {
          if (user.role === 'admin') {
            const storedShopId = localStorage.getItem('abbasi-cable-selected-shop');
            const defaultId = resolveAdminShopId(shopList, storedShopId);
            setSelectedShopId(defaultId);
            if (defaultId) {
              localStorage.setItem('abbasi-cable-selected-shop', defaultId);
            }
          } else {
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
    if (user && user.role === 'admin' && shopId) {
      setSelectedShopId(shopId);
      localStorage.setItem('abbasi-cable-selected-shop', shopId);
    }
  };

  const getSelectedShopName = () => {
    const shop = shops.find((s) => s.id === selectedShopId);
    return shop ? shop.name : 'Unknown Shop';
  };

  const getShopQueryParams = () => {
    if (user?.role === 'admin' && selectedShopId) {
      return { shopId: selectedShopId };
    }
    if (user?.role === 'employee' && user.shopId) {
      return { shopId: user.shopId };
    }
    return {};
  };

  return (
    <ShopContext.Provider
      value={{
        selectedShopId,
        setSelectedShopId: switchShop,
        shops,
        loadingShops,
        getSelectedShopName,
        getShopQueryParams,
        mainBranchShopId: getMainBranchShopId(shops),
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
