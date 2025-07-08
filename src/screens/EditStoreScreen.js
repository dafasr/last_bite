import React, { useState, useEffect } from "react";
import {
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
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { getSellerProfile, updateSellerProfile } from "../api/apiClient";
import { useAuthContext } from "../context/AuthContext";

const EditStoreScreen = ({ navigation, route }) => {
  const { sellerProfileId } = useAuthContext();
  const sellerId = sellerProfileId;

  useEffect(() => {}, [sellerId, loading]);

  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [storeImageUrl, setStoreImageUrl] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState(null);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const response = await getSellerProfile(sellerId);
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
        setStoreImageUrl(storeImageUrl);
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
            Dialog.show({
              type: ALERT_TYPE.WARNING,
              title: "Izin Ditolak",
              textBody: "Akses lokasi diperlukan untuk mengatur lokasi toko.",
              button: "Tutup",
            });
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
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody:
            "Gagal mengambil profil penjual. Silakan periksa koneksi jaringan Anda atau coba lagi nanti.",
          button: "Tutup",
        });
      } finally {
        setLoading(false);
      }
    };

    if (sellerId) {
      fetchSellerProfile();
    }
  }, [sellerId]);

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

  const handleSave = async () => {
    if (!sellerId) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "ID Penjual tidak ditemukan.",
        button: "Tutup",
      });
      return;
    }

    try {
      const updatedData = {
        storeName,
        storeDescription: description, // Use the local 'description' state for storeDescription
        address,
        latitude,
        longitude,
        storeImageUrl,
        status: "ACTIVE", // Set status to ACTIVE, no UI needed
      };
      await updateSellerProfile(sellerId, updatedData);
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Sukses",
        textBody: "Informasi toko berhasil diperbarui!",
        button: "OK",
        onPressButton: () => {
          Dialog.hide(); // Explicitly hide the dialog
          navigation.goBack();
        },
      });
    } catch (error) {
      console.error("Failed to update seller profile:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Gagal memperbarui informasi toko.",
        button: "Tutup",
      });
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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Informasi Toko</Text>
        </View>

        <View style={styles.form}>
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
            <Text style={styles.label}>Store Image URL</Text>
            <TextInput
              style={styles.input}
              value={storeImageUrl}
              onChangeText={setStoreImageUrl}
              placeholder="Masukkan URL gambar toko"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Lokasi Toko (Ketuk pada peta untuk memilih)
            </Text>
            <Text style={styles.coordinatesText}>
              Latitude: {latitude ? latitude.toFixed(6) : "N/A"}, Longitude:{" "}
              {longitude ? longitude.toFixed(6) : "N/A"}
            </Text>
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
              <Text style={styles.label}>Detail Alamat</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Masukkan detail alamat toko Anda"
              />
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.actionButtonText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flexGrow: 1,
    paddingBottom: 50,
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
  form: {
    margin: 20,
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
  coordinatesText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  actionsContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
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
    backgroundColor: "#2ECC71", // Green
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
});

export default EditStoreScreen;
