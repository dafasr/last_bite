import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  Animated, // Import Animated
} from "react-native";
import { useAuth } from "../hooks";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { isLoading, loginUser } = useAuth();

  // Animated values
  const fadeAnim = useState(new Animated.Value(0))[0]; // Initial value for opacity: 0
  const slideAnim = useState(new Animated.Value(50))[0]; // Initial value for slide: 50 (from bottom)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // 1 second
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000, // 1 second
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!username || !password) {
      Alert.alert("Error", "Username dan password wajib diisi.", [
        { text: "Tutup" },
      ]);
      return;
    }
    const result = await loginUser({ username, password });
    if (!result.success) {
      Keyboard.dismiss();
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Username atau password salah.",
      });
    }
  };

  const handleForgotPassword = () => {
    Keyboard.dismiss();
    Alert.alert("Informasi", "Fitur ini sedang dalam pengembangan.", [
      { text: "Tutup" },
    ]);
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Aplikasi */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
            />
          </Animated.View>

          {/* Box untuk Form */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20} // Ukuran ikon lebih kecil
                color="#888" // Warna ikon lebih lembut
                style={styles.icon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholderTextColor="#888" // Warna placeholder
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20} // Ukuran ikon lebih kecil
                color="#888" // Warna ikon lebih lembut
                style={styles.icon}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Kata sandi"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#888" // Warna placeholder
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20} // Ukuran ikon lebih kecil
                  color="#888" // Warna ikon lebih lembut
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? "Sedang masuk..." : "Masuk"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Link untuk Registrasi */}
          <Animated.View
            style={[
              styles.registerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Daftar sekarang</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5", // Warna latar belakang lebih terang
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25, // Padding horizontal lebih besar
  },
  logo: {
    width: 200, // Ukuran logo lebih kecil
    height: 200, // Ukuran logo lebih kecil
    resizeMode: "contain",
    marginBottom: 30, // Margin bawah lebih besar
  },
  formContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF", // Latar belakang putih bersih
    padding: 25, // Padding lebih besar
    borderRadius: 15, // Sudut lebih membulat
    // Menghilangkan shadow untuk tampilan minimalis
    // shadowColor: "#000",
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 5,
    // elevation: 5,
    borderWidth: 1, // Tambahkan border tipis
    borderColor: "#E0E0E0", // Warna border abu-abu terang
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#F8F8F8", // Latar belakang input lebih terang
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0", // Border input lebih terang
    paddingHorizontal: 15,
  },
  inputField: {
    flex: 1,
    height: "100%",
    color: "#333",
    fontSize: 16,
    paddingLeft: 10,
  },
  icon: {
    marginRight: 10,
  },
  eyeIcon: {
    paddingHorizontal: 5,
  },
  forgotPasswordContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 20, // Margin bawah lebih besar
  },
  forgotPasswordText: {
    color: "#6C757D", // Warna abu-abu gelap untuk teks lupa password
    fontSize: 14,
    fontWeight: "500", // Sedikit lebih tebal
  },
  loginButton: {
    width: "100%",
    height: 55, // Tinggi tombol lebih besar
    backgroundColor: "#28a745", // Warna hijau
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#28a745", // Shadow untuk tombol
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5, // Spasi antar huruf
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 30, // Margin atas lebih besar
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 15, // Ukuran font sedikit lebih besar
    color: "#6C757D", // Warna abu-abu gelap
  },
  registerLink: {
    fontSize: 15, // Ukuran font sedikit lebih besar
    color: "#28a745", // Warna hijau
    fontWeight: "bold",
  },
});
