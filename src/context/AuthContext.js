import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [sellerProfileId, setSellerProfileId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSellerProfileId = async () => {
      try {
        const storedId = await AsyncStorage.getItem('sellerProfileId');
        if (storedId) {
          setSellerProfileId(storedId);
        }
      } catch (error) {
        console.error('Failed to load sellerProfileId from AsyncStorage', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSellerProfileId();
  }, []);

  const updateSellerProfileId = async (id) => {
    try {
      if (id) {
        await AsyncStorage.setItem('sellerProfileId', id);
        setSellerProfileId(id);
      } else {
        await AsyncStorage.removeItem('sellerProfileId');
        setSellerProfileId(null);
      }
    } catch (error) {
      console.error('Failed to save sellerProfileId to AsyncStorage', error);
    }
  };

  const isAuthenticated = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token;
    } catch (error) {
      console.error('Failed to check authentication status', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ sellerProfileId, updateSellerProfileId, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
