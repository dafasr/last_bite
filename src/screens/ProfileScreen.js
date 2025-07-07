import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { useAuth } from "../hooks";
import { useAuthContext } from "../context/AuthContext";
import { getSellerProfile } from "../api/apiClient";
import { useFocusEffect } from "@react-navigation/native";

const ProfileScreen = ({ navigation }) => {
  const { logoutUser } = useAuth();
  const { sellerProfileId, isLoading: isAuthLoading } = useAuthContext();
  const [merchantProfile, setMerchantProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSellerProfile = useCallback(async () => {
    if (!sellerProfileId) {
      setIsLoading(false);
      setError("Seller ID not found.");
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "ID Penjual tidak ditemukan.",
        button: "Tutup",
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await getSellerProfile(sellerProfileId);
      const data = response.data.data;
      setMerchantProfile({
        storeName: data.storeName,
        averageRating: data.averageRating,
        storeDescription: data.storeDescription,
        storeImageUrl: data.storeImageUrl,
      });
    } catch (err) {
      console.error("Failed to fetch seller profile:", err);
      setError("Failed to load profile. Please try again.");
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Gagal memuat profil. Silakan coba lagi.",
        button: "Tutup",
      });
    } finally {
      setIsLoading(false);
    }
  }, [sellerProfileId]);

  useFocusEffect(
    React.useCallback(() => {
      if (!isAuthLoading) {
        fetchSellerProfile();
      }
    }, [isAuthLoading, fetchSellerProfile])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSellerProfile();
    setRefreshing(false);
  }, [fetchSellerProfile]);

  const handleUpdateStore = (updatedData) => {
    setMerchantProfile((prevProfile) => ({
      ...prevProfile,
      storeName: updatedData.storeName,
      storeDescription: updatedData.description,
    }));
  };

  const handleEditStore = () => {
    navigation.navigate("EditStore", {
      storeName: merchantProfile.storeName,
      description: merchantProfile.storeDescription,
    });
  };

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword");
  };

  const handleHelpAndFeedback = () => {
    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: "Bantuan & Masukan",
      textBody: "Fitur untuk bantuan dan masukan sedang dalam pengembangan.",
      button: "Tutup",
    });
  };

  const handleOfficialWebsite = () => {
    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: "Tentang Kami",
      textBody: "Tautan ke situs web resmi kami akan segera tersedia.",
      button: "Tutup",
    });
  };

  const handleLogout = async () => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: "Logout",
      textBody: "Apakah Anda yakin ingin keluar?",
      button: "Keluar",
      onPressButton: async () => {
        Dialog.hide();
        await logoutUser();
        navigation.navigate("Login");
      },
      showCancelButton: true,
      cancelButton: "Batal",
    });
  };

  if (isLoading || isAuthLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchSellerProfile}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!merchantProfile) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No profile data available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          {/* <Text style={styles.headerTitle}>My Profile</Text> */}
        </View>

        <View style={styles.profileContainer}>
          <Image
            source={{
              uri:
                merchantProfile.storeImageUrl ||
                "https://via.placeholder.com/150",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.storeName}>{merchantProfile.storeName}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              ★ {merchantProfile.averageRating?.toFixed(1) || "N/A"}
            </Text>
            {/* <Text style={styles.reviewsText}>
              ({merchantProfile.reviews} reviews)
            </Text> */}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Store Description</Text>
          <Text style={styles.description}>
            {merchantProfile.storeDescription}
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={handleEditStore}>
            <Text style={styles.menuItemText}>Edit Store Information</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("EditUserInformation")}
          >
            <Text style={styles.menuItemText}>Edit User Information</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleChangePassword}
          >
            <Text style={styles.menuItemText}>Change Password</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleHelpAndFeedback}
          >
            <Text style={styles.menuItemText}>Help & Feedback</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleOfficialWebsite}
          >
            <Text style={styles.menuItemText}>About Us</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.actionButtonText}>Logout</Text>
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
    paddingBottom: 100,
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#2ECC71", // A vibrant green
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF", // White text for contrast
    textAlign: "center",
  },
  profileContainer: {
    alignItems: "center",
    padding: 25,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -50, // Pull it up into the header area
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 1, // Ensure it's above other elements
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 15,
    borderWidth: 5,
    borderColor: "#FFFFFF", // White border around the image
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  storeName: {
    fontSize: 26,
    fontWeight: "900",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFC107",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF", // White text for rating
    marginRight: 5,
  },
  reviewsText: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  menuContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    fontSize: 17,
    color: "#333",
    fontWeight: "500",
  },
  menuItemArrow: {
    fontSize: 22,
    color: "#7F8C8D",
    fontWeight: "bold",
  },
  actionsContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  logoutButton: {
    backgroundColor: "#E74C3C", // Red
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
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
  retryButton: {
    backgroundColor: "#3498DB",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
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
});

export default ProfileScreen;
