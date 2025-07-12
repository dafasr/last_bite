import React, { useState, useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useImagePicker } from "../hooks";
import {
  Image,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Alert } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import apiClient, { updateSellerProfile, uploadImage } from "../api/apiClient";
import { useAuthContext } from "../context/AuthContext";

const EditStoreScreen = ({ navigation, route }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current; // Initial value for scale: 0

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);
  const { sellerProfileId } = useAuthContext();
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const {
    image: storeImage,
    pickImage: pickStoreImage,
    setImage: setStoreImage,
  } = useImagePicker();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLatitude(latitude);
    setLongitude(longitude);
    setMapRegion({
      ...mapRegion,
      latitude,
      longitude,
    });
  };

  const handleChooseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Ditolak",
          "Akses lokasi diperlukan untuk mendapatkan lokasi saat ini.",
          [{ text: "Tutup" }]
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error("Failed to get current location:", error);
      Alert.alert("Error", "Gagal mendapatkan lokasi saat ini.", [
        { text: "Tutup" },
      ]);
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const response = await apiClient.get("/sellers/me");
        const {
          storeName,
          storeDescription: description,
          address,
          latitude,
          longitude,
          storeImageUrl,
          status,
        } = response.data.data;
        setStoreName(storeName);
        setDescription(description);
        setAddress(address);
        setLatitude(latitude);
        setLongitude(longitude);
        setStoreImage({ uri: storeImageUrl });
        setStatus(status);

        if (latitude && longitude) {
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        } else {
          let { status: locationStatus } =
            await Location.requestForegroundPermissionsAsync();
          if (locationStatus !== "granted") {
            Alert.alert(
              "Izin Ditolak",
              "Akses lokasi diperlukan untuk mengatur lokasi toko.",
              [{ text: "Tutup" }]
            );
            setLoading(false);
            return;
          }
          let location = await Location.getCurrentPositionAsync({});
          setMapRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "Gagal mengambil profil penjual. Silakan periksa koneksi jaringan Anda atau coba lagi nanti.",
          [{ text: "Tutup" }]
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalStoreImageUrl = storeImage ? storeImage.uri : "";

      if (storeImage && storeImage.uri && !storeImage.uri.startsWith("http")) {
        const imageFormData = new FormData();
        imageFormData.append("file", {
          uri: storeImage.uri,
          type: storeImage.mimeType,
          name: storeImage.fileName,
        });
        const imageResponse = await uploadImage(imageFormData);
        finalStoreImageUrl = imageResponse.data.url;
      }

      const updatedData = {
        storeName,
        storeDescription: description, // Use the local 'description' state for storeDescription
        address,
        latitude,
        longitude,
        storeImageUrl: finalStoreImageUrl,
        status: "ACTIVE", // Set status to ACTIVE, no UI needed
      };
      await updateSellerProfile(sellerProfileId, updatedData);
      Alert.alert("Sukses", "Informasi toko berhasil diperbarui!", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to update seller profile:", error);
      Alert.alert("Error", "Gagal memperbarui informasi toko.", [
        { text: "Tutup" },
      ]);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView
        contentContainerStyle={styles.scrollViewContent}
        style={{ transform: [{ scale: scaleAnim }] }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.formContainer} // Changed to formContainer
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Toko</Text>
            <TextInput
              style={styles.input}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="Masukkan nama toko Anda"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Keterangan</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Ceritakan kepada kami tentang toko Anda"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Foto Toko</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={pickStoreImage}
            >
              <Text style={styles.imagePickerButtonText}>Pilih Foto Toko</Text>
            </TouchableOpacity>
            {storeImage && storeImage.uri && storeImage.uri !== "" && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: storeImage.uri }}
                  style={styles.imagePreview}
                />
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Lokasi Toko (Ketuk pada peta untuk memilih)
            </Text>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleChooseCurrentLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.locationButtonText}>
                  Pilih Lokasi Saat Ini
                </Text>
              )}
            </TouchableOpacity>
            {mapRegion && (
              <MapView
                style={styles.map}
                region={mapRegion}
                onPress={handleMapPress}
              >
                {latitude && longitude && (
                  <Marker coordinate={{ latitude, longitude }} />
                )}
              </MapView>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alamat</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Alamat"
                value={address}
                onChangeText={setAddress}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionButtonText}>Simpan Perubahan</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    width: "100%",
    marginBottom: 20, // Added margin bottom
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  map: {
    height: 200,
    width: "100%",
    borderRadius: 10,
    marginBottom: 10,
  },
  actionsContainer: {
    marginTop: -20, // Adjusted marginTop
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: "#2ECC71", // Green, removed marginTop
  },
  cancelButton: {
    backgroundColor: "#E74C3C", // Red
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  imagePickerButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  imagePickerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  imagePreviewContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  locationButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  locationButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditStoreScreen;
