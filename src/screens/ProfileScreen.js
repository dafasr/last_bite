import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Animated,
  Easing,
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const profileImageScale = useRef(new Animated.Value(0)).current;
  const profileImageRotate = useRef(new Animated.Value(0)).current;
  const menuItemsAnim = useRef(new Animated.Value(0)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Create animated values for each menu item
  const menuAnimations = useRef(
    Array.from({ length: 5 }, () => ({
      scale: new Animated.Value(0.8),
      opacity: new Animated.Value(0),
      translateX: new Animated.Value(30),
    }))
  ).current;

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

  // Start animations when component mounts
  const startAnimations = useCallback(() => {
    // Main container animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      }),
    ]).start();

    // Profile image animations
    Animated.sequence([
      Animated.timing(profileImageScale, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(profileImageRotate, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Stars animation
    Animated.spring(starsAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Menu items staggered animation
    const menuAnimationSequence = menuAnimations.map((anim, index) =>
      Animated.timing(anim.opacity, {
        toValue: 1,
        duration: 600,
        delay: index * 150,
        useNativeDriver: true,
      })
    );

    const menuScaleSequence = menuAnimations.map((anim, index) =>
      Animated.timing(anim.scale, {
        toValue: 1,
        duration: 600,
        delay: index * 150,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: true,
      })
    );

    const menuTranslateSequence = menuAnimations.map((anim, index) =>
      Animated.timing(anim.translateX, {
        toValue: 0,
        duration: 600,
        delay: index * 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    );

    Animated.parallel([
      ...menuAnimationSequence,
      ...menuScaleSequence,
      ...menuTranslateSequence,
    ]).start();

    // Pulse animation for rating
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Reset animations
  const resetAnimations = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.8);
    profileImageScale.setValue(0);
    profileImageRotate.setValue(0);
    starsAnim.setValue(0);
    pulseAnim.setValue(1);
    menuAnimations.forEach((anim) => {
      anim.opacity.setValue(0);
      anim.scale.setValue(0.8);
      anim.translateX.setValue(30);
    });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!isAuthLoading) {
        fetchSellerProfile();
      }
    }, [isAuthLoading, fetchSellerProfile])
  );

  useEffect(() => {
    if (merchantProfile && !isLoading) {
      startAnimations();
    }
  }, [merchantProfile, isLoading, startAnimations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    resetAnimations();
    await fetchSellerProfile();
    setRefreshing(false);
  }, [fetchSellerProfile, resetAnimations]);

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

  // Animated menu item press handler
  const handleMenuItemPress = (callback, index) => {
    Animated.sequence([
      Animated.timing(menuAnimations[index].scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(menuAnimations[index].scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
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

  const profileImageRotateInterpolate = profileImageRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* <View style={styles.headerOverlay} />
          <Text style={styles.headerTitle}>My Profile</Text> */}
        </Animated.View>

        {/* Enhanced Profile Card */}
        <Animated.View
          style={[
            styles.profileContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.profileImageContainer}>
            <Animated.Image
              source={{
                uri:
                  merchantProfile.storeImageUrl ||
                  "https://via.placeholder.com/150",
              }}
              style={[
                styles.profileImage,
                {
                  transform: [
                    { scale: profileImageScale },
                    { rotate: profileImageRotateInterpolate },
                  ],
                },
              ]}
            />
            <View style={styles.profileImageBorder} />
          </View>

          <Animated.Text
            style={[
              styles.storeName,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {merchantProfile.storeName}
          </Animated.Text>

          <Animated.View
            style={[
              styles.ratingContainer,
              {
                opacity: starsAnim,
                transform: [{ scale: pulseAnim }, { translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.starContainer}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.ratingText}>
                {merchantProfile.averageRating?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Enhanced Description Card */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Store Description</Text>
            <View style={styles.cardTitleUnderline} />
          </View>
          <Text style={styles.description}>
            {merchantProfile.storeDescription}
          </Text>
        </Animated.View>

        {/* Enhanced Menu Container */}
        <Animated.View
          style={[
            styles.menuContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.menuHeader}>
            <Text style={styles.menuHeaderTitle}>Settings</Text>
          </View>

          <Animated.View
            style={[
              styles.menuItem,
              {
                opacity: menuAnimations[0].opacity,
                transform: [
                  { scale: menuAnimations[0].scale },
                  { translateX: menuAnimations[0].translateX },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItemTouchable}
              onPress={() => handleMenuItemPress(handleEditStore, 0)}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#2ECC71" }]}>
                  <Text style={styles.menuIconText}>🏪</Text>
                </View>
                <Text style={styles.menuItemText}>Edit Store Information</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.menuItem,
              {
                opacity: menuAnimations[1].opacity,
                transform: [
                  { scale: menuAnimations[1].scale },
                  { translateX: menuAnimations[1].translateX },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItemTouchable}
              onPress={() =>
                handleMenuItemPress(
                  () => navigation.navigate("EditUserInformation"),
                  1
                )
              }
              activeOpacity={0.8}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#3498DB" }]}>
                  <Text style={styles.menuIconText}>👤</Text>
                </View>
                <Text style={styles.menuItemText}>Edit User Information</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.menuItem,
              {
                opacity: menuAnimations[2].opacity,
                transform: [
                  { scale: menuAnimations[2].scale },
                  { translateX: menuAnimations[2].translateX },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItemTouchable}
              onPress={() => handleMenuItemPress(handleChangePassword, 2)}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#9B59B6" }]}>
                  <Text style={styles.menuIconText}>🔐</Text>
                </View>
                <Text style={styles.menuItemText}>Change Password</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.menuItem,
              {
                opacity: menuAnimations[3].opacity,
                transform: [
                  { scale: menuAnimations[3].scale },
                  { translateX: menuAnimations[3].translateX },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItemTouchable}
              onPress={() => handleMenuItemPress(handleHelpAndFeedback, 3)}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#F39C12" }]}>
                  <Text style={styles.menuIconText}>💬</Text>
                </View>
                <Text style={styles.menuItemText}>Help & Feedback</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.menuItem,
              styles.lastMenuItem,
              {
                opacity: menuAnimations[4].opacity,
                transform: [
                  { scale: menuAnimations[4].scale },
                  { translateX: menuAnimations[4].translateX },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItemTouchable}
              onPress={() => handleMenuItemPress(handleOfficialWebsite, 4)}
              activeOpacity={0.8}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: "#E67E22" }]}>
                  <Text style={styles.menuIconText}>ℹ️</Text>
                </View>
                <Text style={styles.menuItemText}>About Us</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Enhanced Logout Button */}
        <Animated.View
          style={[
            styles.actionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
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
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemTouchable: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 25,
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
