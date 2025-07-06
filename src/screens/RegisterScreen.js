import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useAuth } from "../hooks";
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

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
  const [errors, setErrors] = useState({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: -6.2,
    longitude: 106.816666,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  
  const { isLoading, registerUser } = useAuth();

  useEffect(() => {
    setMapRegion({
      latitude: latitude,
      longitude: longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  }, [latitude, longitude]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      return true;
    } else {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Izin Ditolak',
        textBody: 'Izin lokasi ditolak.',
        button: 'Tutup',
      });
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setIsLocating(true);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setIsLocating(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Gagal mendapatkan lokasi saat ini. ' + error.message,
        button: 'Tutup',
      });
    } finally {
      setIsLocating(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!username) {
      newErrors.username = "Nama pengguna wajib diisi.";
    } else if (username.length < 3) {
      newErrors.username = "Nama pengguna minimal 3 karakter.";
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
      newErrors.username = "Nama pengguna hanya boleh berisi huruf dan angka.";
    }
    if (!email) newErrors.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Format email tidak valid.";
    if (!password) {
      newErrors.password = "Kata sandi wajib diisi.";
    } else if (password.length < 8) {
      newErrors.password = "Kata sandi minimal 8 karakter.";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)) {
      newErrors.password =
        "Sandi harus mengandung huruf besar, kecil, dan angka.";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Kata sandi tidak cocok.";
    }
    if (!fullName) newErrors.fullName = "Nama lengkap wajib diisi.";
    if (!phoneNumber) {
      newErrors.phoneNumber = "Nomor telepon wajib diisi.";
    } else if (!/^\d+$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Nomor telepon hanya boleh berisi angka.";
    } else if (phoneNumber.length < 10 || phoneNumber.length > 15) {
      newErrors.phoneNumber = "Nomor telepon harus antara 10 hingga 15 digit.";
    }
    if (!storeName) newErrors.storeName = "Nama toko wajib diisi.";
    if (!storeDescription)
      newErrors.storeDescription = "Deskripsi toko wajib diisi.";
    if (!address) newErrors.address = "Alamat wajib diisi.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const result = await registerUser({
      username,
      email,
      password,
      fullName,
      phoneNumber,
      storeName,
      storeDescription,
      latitude,
      longitude,
      address,
      status: "INACTIVE",
    });

    if (!result.success) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: result.message,
        button: 'Tutup',
      });
    } else {
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Sukses',
        textBody: 'Registrasi berhasil! Silakan login.',
        button: 'OK',
        onPressButton: () => {
          Dialog.hide();
          navigation.navigate("Login");
        },
      });
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
            placeholder="Nama Pengguna"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) setErrors({ ...errors, username: null });
            }}
          />
          {errors.username && (
            <Text style={styles.errorText}>{errors.username}</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputWithEye}
              placeholder="Kata Sandi"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              secureTextEntry={!isPasswordVisible}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={isPasswordVisible ? "eye" : "eye-off"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputWithEye}
              placeholder="Konfirmasi Kata Sandi"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword)
                  setErrors({ ...errors, confirmPassword: null });
              }}
              secureTextEntry={!isConfirmPasswordVisible}
            />
            <TouchableOpacity
              onPress={() =>
                setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
              }
              style={styles.eyeIcon}
            >
              <Ionicons
                name={isConfirmPasswordVisible ? "eye" : "eye-off"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="Nama Lengkap"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) setErrors({ ...errors, fullName: null });
            }}
          />
          {errors.fullName && (
            <Text style={styles.errorText}>{errors.fullName}</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="Nomor Telepon"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (errors.phoneNumber)
                setErrors({ ...errors, phoneNumber: null });
            }}
            keyboardType="phone-pad"
          />
          {errors.phoneNumber && (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="Nama Toko"
            value={storeName}
            onChangeText={(text) => {
              setStoreName(text);
              if (errors.storeName) setErrors({ ...errors, storeName: null });
            }}
          />
          {errors.storeName && (
            <Text style={styles.errorText}>{errors.storeName}</Text>
          )}
          <TextInput
            style={styles.input}
            placeholder="Deskripsi Toko"
            value={storeDescription}
            onChangeText={(text) => {
              setStoreDescription(text);
              if (errors.storeDescription)
                setErrors({ ...errors, storeDescription: null });
            }}
          />
          {errors.storeDescription && (
            <Text style={styles.errorText}>{errors.storeDescription}</Text>
          )}
          <Text style={styles.mapLabel}>
            Pilih Lokasi di Peta (Latitude: {latitude.toFixed(4)}, Longitude:{" "}
            {longitude.toFixed(4)})
          </Text>
          <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation} disabled={isLocating}>
            {isLocating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.locationButtonText}>Gunakan Lokasi Saat Ini</Text>
            )}
          </TouchableOpacity>
          <MapView
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
          >
            <Marker coordinate={{ latitude: latitude, longitude: longitude }} />
          </MapView>
          <TextInput
            style={styles.input}
            placeholder="Detail Alamat"
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              if (errors.address) setErrors({ ...errors, address: null });
            }}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Mendaftar..." : "Daftar"}
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
  errorText: {
    color: "red",
    marginBottom: 10,
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  inputWithEye: {
    flex: 1,
    paddingHorizontal: 15,
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
});

export default RegisterScreen;
