import { useState } from "react";

export const useMerchant = () => {
  const [isLoading, setIsLoading] = useState(false);

  const registerMerchant = async ({ storeName, description, address }) => {
    setIsLoading(true);

    // 1. Validation
    if (!storeName || !description || !address) {
      setIsLoading(false);
      return { success: false, message: "Lengkapi semua kolom isian" };
    }

    // 2. Simulate API call
    try {
      // Di masa depan, ini akan menjadi panggilan API ke backend Anda
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulasi delay jaringan
      setIsLoading(false);
      return { success: true, message: "Toko berhasil didaftarkan" };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat registrasi.",
      };
    }
  };

  return {
    isLoading,
    registerMerchant,
  };
};
