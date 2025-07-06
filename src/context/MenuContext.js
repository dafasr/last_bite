import React, { createContext, useState, useContext } from "react";
import { deleteMenuItem, updateMenuItem } from "../api/apiClient";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [surpriseBags, setSurpriseBags] = useState([]);

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
      console.log(updatedData);
      const response = await updateMenuItem(id, updatedData);
      console.log(response.data);
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
