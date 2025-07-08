import { useState } from "react";
import apiClient from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { updateSellerProfileId, logout } = useAuthContext();

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

      // Asumsikan token dan status ada di response.data.data
      // Sesuaikan path ini jika struktur response dari API Anda berbeda
      if (response.data && response.data.data && response.data.data.token) {
        const { token, status } = response.data.data;

        if (status === 'INACTIVE') {
          setIsLoading(false);
          return { success: false, message: 'Akun Anda tidak aktif. Silakan hubungi admin.' };
        }

        await AsyncStorage.setItem("userToken", token);

        // Fetch user profile after successful login
        const userProfileResponse = await apiClient.get("/users/me");
        if (userProfileResponse.data && userProfileResponse.data.data && userProfileResponse.data.data.id) {
          await updateSellerProfileId(userProfileResponse.data.data.id);
        }
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
    await logout();
    setIsLoading(false);
  };

  return {
    isLoading,
    loginUser,
    registerUser,
    logoutUser,
  };
};