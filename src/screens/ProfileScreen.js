import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
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

  const fetchSellerProfile = async () => {
    if (!sellerProfileId) {
      setIsLoading(false);
      setError("Seller ID not found.");
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'ID Penjual tidak ditemukan.',
        button: 'Tutup',
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
        title: 'Error',
        textBody: 'Gagal memuat profil. Silakan coba lagi.',
        button: 'Tutup',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!isAuthLoading) {
        fetchSellerProfile();
      }
    }, [isAuthLoading, sellerProfileId])
  );

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
    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: 'Ubah Kata Sandi',
      textBody: 'Fitur untuk mengubah kata sandi sedang dalam pengembangan.',
      button: 'Tutup',
    });
  };

  const handleHelpAndFeedback = () => {
    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: 'Bantuan & Masukan',
      textBody: 'Fitur untuk bantuan dan masukan sedang dalam pengembangan.',
      button: 'Tutup',
    });
  };

  const handleOfficialWebsite = () => {
    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: 'Tentang Kami',
      textBody: 'Tautan ke situs web resmi kami akan segera tersedia.',
      button: 'Tutup',
    });
  };

  const handleLogout = async () => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: 'Logout',
      textBody: 'Apakah Anda yakin ingin keluar?',
      button: 'Keluar',
      onPressButton: async () => {
        Dialog.hide();
        await logoutUser();
        navigation.navigate("Login");
      },
      showCancelButton: true,
      cancelButton: 'Batal',
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
        <TouchableOpacity style={styles.retryButton} onPress={fetchSellerProfile}>
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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
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
    paddingBottom: 20,
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
  profileContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#2ECC71",
  },
  storeName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFC107", // Gold color for the star
    marginRight: 5,
  },
  reviewsText: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  menuContainer: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    overflow: "hidden", // Ensures the border radius is respected by children
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  menuItemArrow: {
    fontSize: 20,
    color: "#7F8C8D",
  },
  actionsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButton: {
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
