import React, { createContext, useState, useContext, useCallback } from "react";
import { Alert } from "react-native";
import {
  getMenuItems,
  deleteMenuItem,
  updateMenuItem,
} from "../api/apiClient";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [surpriseBags, setSurpriseBags] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMenuItems();
      // The entire array from response.data.data, which includes averageRating on each item, is stored.
      setSurpriseBags(response.data.data || []); 
      // We can still store the overall average if the API provides it separately
      if (response.data.averageRating) {
        setAverageRating(response.data.averageRating);
      } else {
        setAverageRating(0); // Default to 0 if not provided
      }
    } catch (error) {
      console.error("Failed to fetch menu items in context:", error);
      Alert.alert("Error", "Gagal mengambil data menu.");
    } finally {
      setLoading(false);
    }
  }, []);

  const addBag = (newBag) => {
    const bagWithId = {
      ...newBag,
      id: String(Date.now()), // Simple unique ID
      status: "AVAILABLE", // Default to available
    };
    setSurpriseBags((prevBags) => [bagWithId, ...prevBags]);
  };

  const updateBag = async (id, updatedData) => {
    try {
      const response = await updateMenuItem(id, updatedData);
      setSurpriseBags((prevBags) =>
        prevBags.map((bag) =>
          bag.id === id ? { ...bag, ...response.data } : bag
        )
      );
    } catch (error) {
      console.error("Failed to update menu item:", error);
      // Optionally, show an alert to the user
    }
  };

  const deleteBag = async (id) => {
    try {
      await deleteMenuItem(id);
      setSurpriseBags((prevBags) => prevBags.filter((bag) => bag.id !== id));
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      Alert.alert(
        "Error",
        "Failed to delete menu item. Please try again later."
      );
    }
  };

  const toggleAvailability = (id) => {
    setSurpriseBags(
      surpriseBags.map((bag) =>
        bag.id === id
          ? {
              ...bag,
              status: bag.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE",
            }
          : bag
      )
    );
  };

  const value = {
    surpriseBags,
    averageRating,
    loading,
    fetchMenuItems,
    setSurpriseBags, // Expose setSurpriseBags
    addBag,
    updateBag,
    toggleAvailability,
    deleteBag,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
