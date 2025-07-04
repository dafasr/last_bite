import { useState } from "react";
import apiClient from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      const response = await apiClient.post("/auth/login", {
        username,
        password,
      });

      // Asumsikan token ada di response.data.data.token
      // Sesuaikan path ini jika struktur response dari API Anda berbeda
      if (response.data && response.data.data && response.data.data.token) {
        await AsyncStorage.setItem("userToken", response.data.data.token);
      }

      setIsLoading(false);
      // Jika berhasil, kembalikan status sukses
      return { success: true, data: response.data };
    } catch (error) {
      setIsLoading(false);
      // Jika gagal, kembalikan pesan error
      return {
        success: false,
        message:
          error.response?.data?.message || "Terjadi kesalahan saat login.",
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
      const response = await apiClient.post("/auth/register-seller", {
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
      });
      setIsLoading(false);
      // Jika berhasil, kembalikan status sukses
      return { success: true, data: response.data };
    } catch (error) {
      setIsLoading(false);
      // Jika gagal, kembalikan pesan error
      let errorMessage = "Terjadi kesalahan saat registrasi.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
        if (errorMessage.includes("username already exists")) {
          errorMessage = "Username sudah terdaftar.";
        } else if (errorMessage.includes("email already exists")) {
          errorMessage = "Email sudah terdaftar.";
        }
      }
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    await AsyncStorage.removeItem("userToken");
    // Anda mungkin ingin menambahkan logika lain di sini, seperti membersihkan state global
    setIsLoading(false);
  };

  return {
    isLoading,
    loginUser,
    registerUser,
    logoutUser,
  };
};
