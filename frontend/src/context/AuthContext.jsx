import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);

  const fetchShops = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/shops');
      setShops(response.data);
      
      // Auto-select first shop if none selected or stored shop is invalid
      const storedShopId = localStorage.getItem('abbasi-cable-selected-shop');
      const shopExists = response.data.some(s => (s.id || s._id).toString() === storedShopId);
      
      if ((!storedShopId || !shopExists) && response.data.length > 0) {
        const firstShopId = (response.data[0].id || response.data[0]._id).toString();
        setSelectedShopId(firstShopId);
      } else if (storedShopId && shopExists) {
        setSelectedShopId(storedShopId);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('abbasi-cable-user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      
      // Default selectedShopId to user's shopId if not set
      const storedShopId = localStorage.getItem('abbasi-cable-selected-shop');
      setSelectedShopId(storedShopId || (parsedUser.shopId ? parsedUser.shopId.toString() : null));
      
      fetchShops();
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedShopId) {
      localStorage.setItem('abbasi-cable-selected-shop', selectedShopId);
    }
  }, [selectedShopId]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });
      setUser(response.data);
      localStorage.setItem('abbasi-cable-user', JSON.stringify(response.data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setSelectedShopId(response.data.shopId ? response.data.shopId.toString() : null);
      fetchShops();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const signup = async (name, username, email, password, role, shopId) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        username,
        email,
        password,
        role,
        shopId,
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('abbasi-cable-user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, shops, selectedShopId, setSelectedShopId }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
