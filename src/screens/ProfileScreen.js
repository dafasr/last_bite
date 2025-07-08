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
import { useAuthContext } from "../context/AuthContext";
import { getSellerProfile } from "../api/apiClient";
import { useFocusEffect } from "@react-navigation/native";

const ProfileScreen = ({ navigation }) => {
  const {
    sellerProfileId,
    isLoading: isAuthLoading,
    logout,
  } = useAuthContext();
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
        await logout();
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
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header with Gradient Effect */}
        <View style={styles.header}>
          {/* <View style={styles.headerOverlay} />
          <Text style={styles.headerTitle}>My Profile</Text> */}
        </View>

        {/* Enhanced Profile Card */}
        <View style={styles.profileContainer}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri:
                  merchantProfile.storeImageUrl ||
                  "https://via.placeholder.com/150",
              }}
              style={styles.profileImage}
            />
            <View style={styles.profileImageBorder} />
          </View>

          <Text style={styles.storeName}>{merchantProfile.storeName}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.starContainer}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.ratingText}>
                {merchantProfile.averageRating?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </View>

          {/* Profile Stats */}
          {/* <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150+</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2.5K</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
          </View> */}
        </View>

        {/* Enhanced Description Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Store Description</Text>
            <View style={styles.cardTitleUnderline} />
          </View>
          <Text style={styles.description}>
            {merchantProfile.storeDescription}
          </Text>
        </View>

        {/* Enhanced Menu Container */}
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuHeaderTitle}>Settings</Text>
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={handleEditStore}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: "#2ECC71" }]}>
                <Text style={styles.menuIconText}>🏪</Text>
              </View>
              <Text style={styles.menuItemText}>Edit Store Information</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("EditUserInformation")}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: "#3498DB" }]}>
                <Text style={styles.menuIconText}>👤</Text>
              </View>
              <Text style={styles.menuItemText}>Edit User Information</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleChangePassword}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: "#9B59B6" }]}>
                <Text style={styles.menuIconText}>🔐</Text>
              </View>
              <Text style={styles.menuItemText}>Change Password</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleHelpAndFeedback}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: "#F39C12" }]}>
                <Text style={styles.menuIconText}>💬</Text>
              </View>
              <Text style={styles.menuItemText}>Help & Feedback</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.lastMenuItem]}
            onPress={handleOfficialWebsite}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: "#E67E22" }]}>
                <Text style={styles.menuIconText}>ℹ️</Text>
              </View>
              <Text style={styles.menuItemText}>About Us</Text>
            </View>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Enhanced Logout Button */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
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
    backgroundColor: "#f8f9fa",
  },
  container: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  header: {
    height: 150,
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: "#2ECC71",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 12,
    position: "relative",
    overflow: "hidden",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(46, 204, 113, 0.1)",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileContainer: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -80,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 1,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 6,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  profileImageBorder: {
    position: "absolute",
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 83,
    borderWidth: 3,
    borderColor: "#2ECC71",
    opacity: 0.3,
  },
  storeName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFC107",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  starIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2ECC71",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#7F8C8D",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E8E8E8",
    marginHorizontal: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 25,
    padding: 25,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2c3e50",
    marginBottom: 8,
  },
  cardTitleUnderline: {
    width: 50,
    height: 3,
    backgroundColor: "#2ECC71",
    borderRadius: 2,
  },
  description: {
    fontSize: 16,
    color: "#555",
    lineHeight: 26,
    fontWeight: "400",
  },
  menuContainer: {
    marginTop: 25,
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 8,
    overflow: "hidden",
  },
  menuHeader: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  menuHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
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
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconText: {
    fontSize: 16,
  },
  menuItemText: {
    fontSize: 17,
    color: "#2c3e50",
    fontWeight: "600",
  },
  menuItemArrow: {
    fontSize: 24,
    color: "#BDC3C7",
    fontWeight: "300",
  },
  actionsContainer: {
    marginTop: 35,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  logoutButton: {
    backgroundColor: "#E74C3C",
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#555",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#3498DB",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#3498DB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  emptyText: {
    fontSize: 16,
    color: "#7F8C8D",
    fontWeight: "500",
  },
});

export default ProfileScreen;
