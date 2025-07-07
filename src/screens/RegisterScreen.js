import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Animated, // Import Animated
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useAuth } from "../hooks";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import * as ImagePicker from "expo-image-picker";

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
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: -6.2,
    longitude: 106.816666,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [image, setImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { isLoading, registerUser } = useAuth();

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

  // Cloudinary configuration (REPLACE WITH YOUR ACTUAL VALUES)
  const CLOUD_NAME = "YOUR_CLOUD_NAME";
  const UPLOAD_PRESET = "YOUR_UPLOAD_PRESET";

  const uploadImageToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg", // Adjust type if needed
      name: "upload.jpg",
    });
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error(
          "Cloudinary upload failed: " +
            (data.error ? data.error.message : "Unknown error")
        );
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

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
    if (status === "granted") {
      return true;
    } else {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Izin Ditolak",
        textBody: "Izin lokasi ditolak.",
        button: "Tutup",
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
        title: "Error",
        textBody: "Gagal mendapatkan lokasi saat ini. " + error.message,
        button: "Tutup",
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handleChoosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
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

    setIsUploadingImage(true);
    let finalStoreImageUrl = "";
    if (image) {
      try {
        finalStoreImageUrl = await uploadImageToCloudinary(image.uri);
      } catch (error) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: "Gagal mengunggah gambar toko.",
          button: "Tutup",
        });
        setIsUploadingImage(false);
        return;
      }
    }
    setIsUploadingImage(false);

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
      storeImageUrl: finalStoreImageUrl,
    });

    if (!result.success) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: result.message,
        button: "Tutup",
      });
    } else {
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Sukses",
        textBody: "Registrasi berhasil! Silakan login.",
        button: "OK",
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Animated.View
            style={[
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.title}>Daftarkan Toko Anda</Text>
            <Text style={styles.subtitle}>
              Isi detail di bawah untuk memulai
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Nama Pengguna"
              placeholderTextColor="#888"
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
              placeholderTextColor="#888"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputWithEye}
                placeholder="Kata Sandi"
                placeholderTextColor="#888"
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
                  size={20}
                  color="#888"
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
                placeholderTextColor="#888"
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
                  size={20}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Nama Lengkap"
              placeholderTextColor="#888"
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
              placeholderTextColor="#888"
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
              placeholderTextColor="#888"
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
              placeholderTextColor="#888"
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

            <Text style={styles.photoLabel}>Foto Toko</Text>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={handleChoosePhoto}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <ActivityIndicator color="#007BFF" />
              ) : (
                <Text style={styles.outlineButtonText}>Pilih Foto Toko</Text>
              )}
            </TouchableOpacity>
            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.imagePreview}
                />
              </View>
            )}

            <Text style={styles.mapLabel}>
              Pilih Lokasi di Peta (Latitude: {latitude.toFixed(4)}, Longitude:{" "}
              {longitude.toFixed(4)})
            </Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.locationButtonText}>
                  Gunakan Lokasi Saat Ini
                </Text>
              )}
            </TouchableOpacity>
            <MapView
              style={styles.map}
              region={mapRegion}
              onPress={handleMapPress}
            >
              <Marker
                coordinate={{ latitude: latitude, longitude: longitude }}
              />
            </MapView>
            <TextInput
              style={styles.input}
              placeholder="Detail Alamat"
              placeholderTextColor="#888"
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
          </Animated.View>

          <Animated.View
            style={[
              styles.loginContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Masuk sekarang</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F2F5", // Warna latar belakang lebih terang
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: "#F0F2F5",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30, // Padding vertikal disesuaikan
    paddingHorizontal: 25, // Padding horizontal lebih besar
  },
  title: {
    fontSize: 28, // Ukuran font lebih besar
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 20, // Margin bawah disesuaikan
  },
  formContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF", // Latar belakang putih bersih
    padding: 25, // Padding lebih besar
    borderRadius: 15, // Sudut lebih membulat
    borderWidth: 1, // Tambahkan border tipis
    borderColor: "#E0E0E0", // Warna border abu-abu terang
    marginBottom: 20, // Margin bawah untuk form container
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#F8F8F8", // Latar belakang input lebih terang
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0", // Border input lebih terang
    color: "#333",
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  photoLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 10,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  locationButton: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#007BFF", // Warna biru modern
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  locationButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  button: {
    width: "100%",
    height: 55, // Tinggi tombol lebih besar
    backgroundColor: "#28A745", // Warna hijau modern
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    shadowColor: "#28A745",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 20, // Margin atas disesuaikan
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 15, // Ukuran font sedikit lebih besar
    color: "#6C757D", // Warna abu-abu gelap
  },
  loginLink: {
    fontSize: 15, // Ukuran font sedikit lebih besar
    color: "#007BFF", // Warna biru modern
    fontWeight: "bold",
  },
  errorText: {
    color: "#DC3545", // Warna merah yang lebih lembut
    marginBottom: 10,
    marginLeft: 5,
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputWithEye: {
    flex: 1,
    paddingHorizontal: 15,
    color: "#333",
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  outlineButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#007BFF", // Warna border biru modern
    marginBottom: 20,
    shadowColor: "#007BFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  outlineButtonText: {
    color: "#007BFF", // Warna teks biru modern
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
});

export default RegisterScreen;
