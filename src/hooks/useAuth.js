import { useState } from "react";
import axios from "axios";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginUser = async ({ username, password }) => {
    setIsLoading(true);
    // 1. Validasi input
    if (!username || !password) {
      const message = "Username dan password harus diisi.";
      setIsLoading(false);
      return { success: false, message };
    }

    // 2. Panggilan API menggunakan axios
    try {
      const response = await axios.post(
        "http://10.10.102.131:8080/api/auth/login",
        {
          username,
          password,
        }
      );
      setIsLoading(false);
      // Jika berhasil, kembalikan status sukses
      return { success: true, data: response.data };
    } catch (error) {
      setIsLoading(false);
      // Jika gagal, kembalikan pesan error
      return {
        success: false,
        message: error.response?.data?.message || "Terjadi kesalahan saat login.",
      };
    }
  };

  const registerUser = async ({
    username,
    fullName,
    email,
    password,
    phoneNumber,
    storeName,
    storeDescription,
    address,
    latitude,
    longitude,
  }) => {
    setIsLoading(true);
    // 1. Validasi input
    if (
      !username ||
      !fullName ||
      !email ||
      !password ||
      !phoneNumber ||
      !storeName ||
      !storeDescription ||
      !address ||
      !latitude ||
      !longitude
    ) {
      const message = "Lengkapi semua kolom isian";
      setIsLoading(false);
      return { success: false, message };
    }

    // 2. Panggilan API menggunakan axios
    try {
      const response = await axios.post(
        "http://10.10.102.131:8080/api/auth/register-seller",
        {
          username,
          fullName,
          email,
          password,
          phoneNumber,
          storeName,
          storeDescription,
          address,
          latitude,
          longitude,
        }
      );
      setIsLoading(false);
      // Jika berhasil, kembalikan status sukses
      return { success: true, data: response.data };
    } catch (error) {
      setIsLoading(false);
      // Jika gagal, kembalikan pesan error
      return {
        success: false,
        message: error.response?.data?.message || "Terjadi kesalahan saat registrasi.",
      };
    }
  };

  return {
    isLoading,
    loginUser,
    registerUser,
  };
};
