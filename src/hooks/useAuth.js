import { useState } from "react";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginUser = async ({ email, password }) => {
    setIsLoading(true);
    // 1. Validasi input
    if (!email || !password) {
      const message = "Email dan password harus diisi.";
      setIsLoading(false);
      return { success: false, message };
    }

    // 2. Simulasi panggilan API
    try {
      // Di masa depan, di sini akan ada panggilan API (misalnya dengan axios)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulasi delay jaringan
      setIsLoading(false);
      // Jika berhasil, kembalikan status sukses
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      // Jika gagal, kembalikan pesan error
      return {
        success: false,
        message: error.message || "Terjadi kesalahan saat login.",
      };
    }
  };

  const registerUser = async ({
    fullName,
    email,
    phone,
    password,
    retypePassword,
    agree,
  }) => {
    setIsLoading(true);
    // 1. Validasi input
    if (!fullName || !email || !phone || !password || !retypePassword) {
      const message = "Lengkapi semua kolom isian";
      setIsLoading(false);
      return { success: false, message };
    }
    if (password !== retypePassword) {
      const message = "Password tidak cocok";
      setIsLoading(false);
      return { success: false, message };
    }
    if (!agree) {
      const message = "Anda harus menyetujui syarat & ketentuan";
      setIsLoading(false);
      return { success: false, message };
    }

    // 2. Simulasi panggilan API
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsLoading(false);
      return { success: true };
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
    loginUser,
    registerUser,
  };
};
