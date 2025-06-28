import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Untuk saat ini, kita hanya akan menampilkan alert
    // Logika login sebenarnya (misalnya, memanggil API) akan ditambahkan di sini
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi.");
      return;
    }
    Alert.alert("Login Berhasil", `Selamat datang, ${email}!`);
  };

  const handleForgotPassword = () => {
    Alert.alert("Lupa Password", "Fitur ini sedang dalam pengembangan.");
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      {/* Ganti `require` dengan path logo Anda. Buat folder `assets` di root proyek Anda */}
      {/* <Image source={require("../../assets/logo.png")} style={styles.logo} /> */}
      <Text style={styles.title}>Selamat Datang!</Text>
      <Text style={styles.subtitle}>Silakan masuk untuk melanjutkan</Text>

      {/* Box untuk Form */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Link untuk Registrasi */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Belum punya akun? </Text>
        <TouchableOpacity onPress={handleRegister}>
          <Text style={styles.registerLink}>Daftar sekarang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: { width: 120, height: 120, resizeMode: "contain", marginBottom: 30 },
  title: { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#7F8C8D", marginBottom: 30 }, // Abu-abu
  formContainer: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  forgotPasswordContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: "#FF6B35", // Orange
    fontSize: 14,
  },
  loginButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#2ECC71", // Hijau
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }, // Putih
  registerContainer: {
    flexDirection: "row",
    marginTop: 30,
    justifyContent: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#7F8C8D", // Abu-abu
  },
  registerLink: {
    fontSize: 14,
    color: "#FF6B35", // Orange
    fontWeight: "bold",
  },
});
