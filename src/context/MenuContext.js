import React, { createContext, useState, useContext } from "react";

// Data dummy awal untuk state
const initialSurpriseBags = [
  {
    id: "1",
    name: "Paket Roti Manis",
    description: "Roti Coklat, Roti Keju, Donat Gula",
    originalPrice: 50000,
    discountedPrice: 25000,
    quantity: 10,
    isAvailable: true,
  },
  {
    id: "2",
    name: "Paket Kue Kering",
    description: "Nastar, Kastengel, Putri Salju",
    originalPrice: 75000,
    discountedPrice: 40000,
    quantity: 5,
    isAvailable: false,
  },
  {
    id: "3",
    name: "Paket Jajanan Pasar",
    description: "Lemper, Risoles, Kue Lumpur",
    originalPrice: 40000,
    discountedPrice: 20000,
    quantity: 15,
    isAvailable: true,
  },
];

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [surpriseBags, setSurpriseBags] = useState(initialSurpriseBags);

  const addBag = (newBag) => {
    const bagWithId = {
      ...newBag,
      id: String(Date.now()), // ID unik sederhana
      isAvailable: true, // Default ke tersedia saat ditambahkan
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
        bag.id === id ? { ...bag, isAvailable: !bag.isAvailable } : bag
      )
    );
  };

  const value = {
    surpriseBags,
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
