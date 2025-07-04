import React, { createContext, useState, useContext } from "react";

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

  const updateBag = (id, updatedData) => {
    setSurpriseBags(
      surpriseBags.map((bag) =>
        // Cari bag dengan id yang cocok, lalu gabungkan data lama dengan data baru
        bag.id === id ? { ...bag, ...updatedData } : bag
      )
    );
  };

  const deleteBag = (id) => {
    setSurpriseBags((prevBags) => prevBags.filter((bag) => bag.id !== id));
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
