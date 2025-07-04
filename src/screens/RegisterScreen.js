import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Toast from "../components/Toast";
import { useToast, useAuth } from "../hooks";

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(-6.2);
  const [longitude, setLongitude] = useState(106.816666);

  const { toast, showToast, hideToast } = useToast();
  const { isLoading, registerUser } = useAuth();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      showToast("Password dan konfirmasi password tidak cocok.", "error");
      return;
    }

    const result = await registerUser({
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

    if (!result.success) {
      showToast(result.message, "error");
    } else {
      showToast("Registrasi berhasil! Silakan login.", "success");
      navigation.navigate("Login");
    }
  };

  const handleMapPress = (e) => {
    const { latitude: newLatitude, longitude: newLongitude } =
      e.nativeEvent.coordinate;
    setLatitude(newLatitude);
    setLongitude(newLongitude);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Daftarkan Toko Anda</Text>
        <Text style={styles.subtitle}>Isi detail di bawah untuk memulai</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
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
          <TextInput
            style={styles.input}
            placeholder="Konfirmasi Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Nama Toko"
            value={storeName}
            onChangeText={setStoreName}
          />
          <TextInput
            style={styles.input}
            placeholder="Deskripsi Toko"
            value={storeDescription}
            onChangeText={setStoreDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Alamat"
            value={address}
            onChangeText={setAddress}
          />
          <Text style={styles.mapLabel}>
            Pilih Lokasi di Peta (Latitude: {latitude.toFixed(4)}, Longitude:{" "}
            {longitude.toFixed(4)})
          </Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapPress}
          >
            <Marker coordinate={{ latitude: latitude, longitude: longitude }} />
          </MapView>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Registering..." : "Register"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Masuk sekarang</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {toast.visible && (
        <Toast message={toast.message} type={toast.type} onHide={hideToast} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 30,
  },
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
  mapLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 10,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  locationButton: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#3498DB", // Blue color
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
  },
  locationButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#2ECC71",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 30,
    justifyContent: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  loginLink: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "bold",
  },
});

export default RegisterScreen;
