import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [sellerProfileId, setSellerProfileId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      let profileId;
      try {
        userToken = await AsyncStorage.getItem("userToken");
        profileId = await AsyncStorage.getItem("sellerProfileId");
      } catch (e) {
        console.error("Restoring token failed", e);
      }

      if (userToken && profileId) {
        setSellerProfileId(profileId);
        setIsAuthenticated(true);
      }

      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const updateSellerProfileId = async (id) => {
    try {
      if (id) {
        await AsyncStorage.setItem("sellerProfileId", id);
        setSellerProfileId(id);
        setIsAuthenticated(true);
      } else {
        await AsyncStorage.removeItem("sellerProfileId");
        setSellerProfileId(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to save sellerProfileId to AsyncStorage", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("sellerProfileId");

      setSellerProfileId(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        sellerProfileId,
        isAuthenticated,
        isLoading,
        updateSellerProfileId,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
