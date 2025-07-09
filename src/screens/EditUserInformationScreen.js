import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import apiClient from "../api/apiClient";
import { Alert } from "react-native";

const EditUserInformationScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/users/me");
        setUserData(response.data.data);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load user data. Please try again.");
        Alert.alert(
          "Error",
          "Gagal memuat data pengguna. Silakan coba lagi.",
          [{ text: "Tutup" }]
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = {
        fullName: userData.fullName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
      };
      await apiClient.put("/users/me", payload);
      Alert.alert(
        "Sukses",
        "Informasi pengguna berhasil diperbarui.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack(); // Go back after successful save
            },
          },
        ]
      );
    } catch (err) {
      console.error("Failed to update user data:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message ||
          "Gagal memperbarui informasi pengguna. Silakan coba lagi.",
        [{ text: "Tutup" }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No user data available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={userData.username}
            editable={false} // Username usually not editable
          />

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={userData.fullName}
            onChangeText={(text) =>
              setUserData({ ...userData, fullName: text })
            }
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={userData.email}
            onChangeText={(text) => setUserData({ ...userData, email: text })}
            keyboardType="email-address"
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={userData.phoneNumber}
            onChangeText={(text) =>
              setUserData({ ...userData, phoneNumber: text })
            }
            keyboardType="phone-pad"
          />

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
              <Text style={styles.actionButtonText}>Batal</Text>
            </TouchableOpacity>
          </View>
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
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  emptyText: {
    fontSize: 16,
    color: "#7F8C8D",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // Increased shadow for depth
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    width: "100%",
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10, // More rounded corners
    paddingHorizontal: 15,
    paddingVertical: 12, // Increased vertical padding
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FFFFFF",
  },
  disabledInput: {
    backgroundColor: "#e9e9e9", // Lighter background for disabled
    color: "#a0a0a0",
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: "#2ECC71", // Green
  },
  saveButtonDisabled: {
    backgroundColor: "#A5D6A7",
  },
  cancelButton: {
    backgroundColor: "#E74C3C", // Red
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditUserInformationScreen;
