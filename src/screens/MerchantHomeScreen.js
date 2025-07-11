import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Animated,
  Easing,
  ScrollView, // Added ScrollView
} from "react-native";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import apiClient from "../api/apiClient";
import { useOrders } from "../context/OrderContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- THEME CONSTANTS ---
const COLORS = {
  primary: "#27AE60", // Green
  secondary: "#3498DB", // Blue
  danger: "#E74C3C", // Red
  warning: "#F39C12", // Yellow
  white: "#FFFFFF",
  black: "#000000",
  lightGray: "#F8F9FA",
  lightGray2: "#ECF0F1",
  gray: "#BDC3C7",
  darkGray: "#7F8C8D",
  title: "#2C3E50",
  text: "#2C3E50",
  background: "#F8F9FA",
  card: "#FFFFFF",
  priceBg: "#E8F5E8",
  paymentBg: "#EBF3FD",
  noteBg: "#FFF9E6",
};

const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 20,
  h1: 28,
  h2: 22,
  h3: 18,
  h4: 16,
  body2: 14,
  body3: 12,
  body4: 11,
};

const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: "800" },
  h2: { fontSize: SIZES.h2, fontWeight: "700" },
  h3: { fontSize: SIZES.h3, fontWeight: "700" },
  h4: { fontSize: SIZES.h4, fontWeight: "700" },
  body2: { fontSize: SIZES.body2, fontWeight: "500" },
  body3: { fontSize: SIZES.body3, fontWeight: "700" },
  body4: { fontSize: SIZES.body4, fontWeight: "500" },
  cardLabel: {
    fontSize: SIZES.body2,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
};

const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dark: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Animation Hook
const useAnimation = (initialValue = 0) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animate = useCallback(
    (toValue, duration = 300, easing = Easing.out(Easing.quad)) => {
      Animated.timing(animatedValue, {
        toValue,
        duration,
        easing,
        useNativeDriver: true,
      }).start();
    },
    [animatedValue]
  );

  return [animatedValue, animate];
};

// Animated Components
const AnimatedCard = ({ children, delay = 0, style }) => {
  const [scaleAnim] = useAnimation(0.95);
  const [opacityAnim] = useAnimation(0);
  const [translateYAnim] = useAnimation(20);

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const AnimatedButton = ({ onPress, style, children, ...props }) => {
  const [scaleAnim] = useAnimation(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={1}
      {...props}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const PulseAnimation = ({ children, style }) => {
  const [pulseAnim] = useAnimation(1);

  useEffect(() => {
    const startPulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => startPulse());
    };

    startPulse();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const CountUpAnimation = ({ value, duration = 1000, style, ...props }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.addListener(({ value: animValue }) => {
      setDisplayValue(Math.floor(animValue));
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeAllListeners();
    };
  }, [value]);

  return (
    <Text style={style} {...props}>
      {typeof value === "number" && value > 1000
        ? `Rp ${displayValue.toLocaleString("id-ID")}`
        : displayValue.toString()}
    </Text>
  );
};

const MerchantHomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(0);
  const [soldBagsCount, setSoldBagsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { orders, fetchOrders, updateOrderStatus } = useOrders();

  const incomingOrders = orders.filter((order) => order.status === "PAID");

  // Animation refs
  const [headerAnim] = useAnimation(0);
  const [summaryAnim] = useAnimation(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const sellerResponse = await apiClient.get("/sellers/me");
      if (sellerResponse.data?.data) {
        setBalance(sellerResponse.data.data.balance || 0);
        setSoldBagsCount(sellerResponse.data.data.totalOrders || 0);
      } else {
        console.warn("Seller data not found from /sellers/me");
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Warning",
          textBody: "Could not retrieve seller data. Please log in again.",
          button: "Close",
        });
      }
      await fetchOrders(1, true); // Fetch all orders from context
    } catch (error) {
      console.error("Error fetching data:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Failed to fetch data. Please try again later.",
        button: "Close",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleWithdraw = () => {
    navigation.navigate("DetailNavigator", { screen: "Withdrawal" });
  };

  const handleReject = async (orderId) => {
    await updateOrderStatus(orderId, "CANCELLED");
  };

  const handleAccept = async (orderId) => {
    await updateOrderStatus(orderId, "ACCEPTED");
  };

  const renderOrderItem = ({ item, index }) => (
    <AnimatedCard delay={index * 100} style={styles.orderItem}>
      <View style={styles.orderItemHeader}>
        <View style={styles.customerInfoContainer}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.orderIdText}>Order ID: {item.orderId}</Text>
          <Text style={styles.orderDateText}>
            {new Date(item.createdAt).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <PulseAnimation style={styles.priceContainer}>
          <Text style={styles.orderPrice}>
            Rp {item.totalAmount?.toLocaleString("id-ID")}
          </Text>
        </PulseAnimation>
      </View>

      <View style={styles.orderItemsContainer}>
        <Text style={styles.orderItemsTitle}>📦 Order Items:</Text>
        {item.orderItems?.map((orderItem, orderIndex) => (
          <AnimatedCard
            key={`${item.id}-${orderIndex}`}
            delay={orderIndex * 50}
            style={styles.orderItemRow}
          >
            <Text style={styles.orderItemText}>
              {orderItem.quantity}x {orderItem.menuItemName}
            </Text>
            <Text style={styles.orderItemPrice}>
              Rp {orderItem.pricePerItem?.toLocaleString("id-ID")}
            </Text>
          </AnimatedCard>
        ))}
      </View>

      {item.payment && (
        <AnimatedCard delay={200} style={styles.paymentContainer}>
          <Text style={styles.paymentLabel}>💳 Payment Status:</Text>
          <View style={styles.paymentStatusBadge}>
            <Text style={styles.paymentStatusText}>{item.payment.status}</Text>
          </View>
        </AnimatedCard>
      )}

      <AnimatedCard delay={250} style={styles.noteContainer}>
        <Text style={styles.noteLabel}>📝 Catatan Pembeli:</Text>
        <Text style={styles.noteText}>{item.notes || "Tidak ada catatan"}</Text>
      </AnimatedCard>

      <AnimatedCard delay={300} style={styles.actionContainer}>
        <AnimatedButton
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.orderId)}
        >
          <Text style={styles.actionButtonText}>❌ Tolak</Text>
        </AnimatedButton>
        <AnimatedButton
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAccept(item.orderId)}
        >
          <Text style={styles.actionButtonText}>✅ Terima</Text>
        </AnimatedButton>
      </AnimatedCard>
    </AnimatedCard>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <PulseAnimation>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </PulseAnimation>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollViewContent,
          { paddingBottom: insets.bottom + 50 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Animated Header */}
          <AnimatedCard style={styles.header}>
            <Text style={styles.headerTitle}>Dasbor Partner</Text>
            <View style={styles.headerUnderline} />
          </AnimatedCard>

          {/* Animated Summary Cards */}
          <View style={styles.summaryRow}>
            <AnimatedCard
              delay={200}
              style={[styles.summaryCardBase, styles.balanceCard]}
            >
              <PulseAnimation>
                <Text style={styles.cardIcon}>💰</Text>
              </PulseAnimation>
              <Text style={styles.cardLabel}>Saldo Anda</Text>
              <CountUpAnimation
                value={balance}
                style={styles.balanceAmount}
                duration={1500}
              />
              <AnimatedButton
                style={styles.withdrawButton}
                onPress={handleWithdraw}
              >
                <Text style={styles.withdrawButtonText}>💸 Tarik Saldo</Text>
              </AnimatedButton>
            </AnimatedCard>

            <AnimatedCard
              delay={400}
              style={[styles.summaryCardBase, styles.soldCard]}
            >
              <PulseAnimation>
                <Text style={styles.cardIcon}>📊</Text>
              </PulseAnimation>
              <Text style={styles.cardLabel}>Menu Terjual</Text>
              <CountUpAnimation
                value={soldBagsCount}
                style={styles.soldAmount}
                duration={1200}
              />
              <Text style={styles.soldSubtext}>Total penjualan</Text>
            </AnimatedCard>
          </View>

          {/* Animated Section Header */}
          <AnimatedCard delay={600} style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Pesanan Masuk</Text>
            <Text style={styles.sectionSubtitle}>
              {incomingOrders.length} pesanan menunggu konfirmasi
            </Text>
            <View style={styles.sectionIndicator} />
          </AnimatedCard>

          {/* Animated Order List */}
          <FlatList
            data={incomingOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => String(item.orderId)}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false} // Disable FlatList scrolling
            ListEmptyComponent={
              <AnimatedCard delay={800} style={styles.emptyContainer}>
                <PulseAnimation>
                  <Text style={styles.emptyIcon}>📭</Text>
                </PulseAnimation>
                <Text style={styles.emptyText}>Tidak ada pesanan baru</Text>
                <Text style={styles.emptySubtext}>
                  Pesanan akan muncul di sini
                </Text>
              </AnimatedCard>
            }
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- ENHANCED STYLESHEET WITH ANIMATIONS ---
const styles = StyleSheet.create({
  // --- Base ---
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: "500",
  },

  // --- Enhanced Header ---
  header: {
    paddingTop: 30,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.title,
    marginBottom: 8,
  },
  headerUnderline: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  // --- Enhanced Summary Cards ---
  summaryRow: {
    flexDirection: "row",
    marginHorizontal: SIZES.padding,
    marginBottom: 24,
    gap: SIZES.radius,
  },
  summaryCardBase: {
    backgroundColor: COLORS.card,
    padding: SIZES.padding,
    borderRadius: 20,
    ...SHADOWS.dark,
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  balanceCard: {
    flex: 1.2,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
    backgroundColor: "#FAFBFC",
  },
  soldCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 5,
    borderLeftColor: COLORS.secondary,
    backgroundColor: "#FAFBFC",
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: SIZES.base - 2,
    textAlign: "center",
  },
  cardLabel: {
    ...FONTS.cardLabel,
    marginBottom: 2,
    fontSize: 11,
  },
  balanceAmount: {
    ...FONTS.h4,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 10,
  },
  soldAmount: {
    ...FONTS.h3,
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.secondary,
    marginBottom: 2,
  },
  soldSubtext: {
    ...FONTS.body4,
    color: COLORS.gray,
    fontSize: 11,
  },
  withdrawButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: "flex-start",
    ...SHADOWS.medium,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    elevation: 6,
  },
  withdrawButtonText: {
    ...FONTS.body4,
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },

  // --- Enhanced Section Header ---
  sectionHeader: {
    marginHorizontal: SIZES.padding,
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.lightGray2,
    position: "relative",
  },
  sectionTitle: {
    ...FONTS.h2,
    color: COLORS.title,
    marginBottom: 6,
    fontSize: 24,
  },
  sectionSubtitle: {
    ...FONTS.body2,
    color: COLORS.darkGray,
    fontSize: 15,
  },
  sectionIndicator: {
    position: "absolute",
    bottom: -2,
    left: 0,
    width: 40,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },

  // --- Enhanced List ---
  listContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding + 10,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    ...SHADOWS.light,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: SIZES.h3,
    fontWeight: "700",
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  emptySubtext: {
    ...FONTS.body2,
    color: COLORS.gray,
    textAlign: "center",
  },

  // --- Enhanced Order Item Card ---
  orderItem: {
    backgroundColor: COLORS.card,
    padding: SIZES.base, // Reduced from SIZES.base * 1.5 (12) to SIZES.base (8)
    borderRadius: 16, // Slightly less rounded
    marginBottom: 8, // Reduced from 10
    borderLeftWidth: 5,
    borderLeftColor: COLORS.warning,
    ...SHADOWS.medium,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  orderItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  customerInfoContainer: {
    flex: 1,
    marginRight: SIZES.radius,
  },
  customerName: {
    ...FONTS.h3,
    color: COLORS.title,
    marginBottom: 6,
    fontSize: 19,
  },
  orderIdText: {
    ...FONTS.body2,
    color: COLORS.darkGray,
    fontSize: 13,
  },
  orderDateText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "500",
    marginTop: 4,
  },
  priceContainer: {
    backgroundColor: COLORS.priceBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    ...SHADOWS.light,
  },
  orderPrice: {
    ...FONTS.h4,
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 16,
  },
  orderItemsContainer: {
    marginBottom: 16, // Reduced from 18
    backgroundColor: COLORS.lightGray,
    padding: 12, // Reduced from 18
    borderRadius: 12, // Slightly less rounded
    ...SHADOWS.light,
  },
  orderItemsTitle: {
    ...FONTS.h4,
    color: COLORS.title,
    marginBottom: 12,
    fontSize: 16,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  orderItemText: {
    ...FONTS.body2,
    color: COLORS.text,
    flex: 1,
  },
  orderItemPrice: {
    ...FONTS.body2,
    color: COLORS.darkGray,
    fontWeight: "700",
  },
  paymentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16, // Reduced from 18
    backgroundColor: COLORS.paymentBg,
    padding: 10, // Reduced from 16
    borderRadius: 12,
    ...SHADOWS.light,
  },
  paymentLabel: {
    ...FONTS.body2,
    fontWeight: "700",
    color: COLORS.title,
  },
  paymentStatusBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    ...SHADOWS.light,
  },
  paymentStatusText: {
    ...FONTS.body3,
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "700",
  },
  noteContainer: {
    marginBottom: 18, // Reduced from 20
    backgroundColor: COLORS.noteBg,
    padding: 12, // Reduced from 18
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    ...SHADOWS.light,
  },
  noteLabel: {
    ...FONTS.h4,
    fontSize: 14,
    color: COLORS.title,
    marginBottom: 8,
  },
  noteText: {
    ...FONTS.body2,
    color: COLORS.darkGray,
    lineHeight: 22,
    fontStyle: "italic",
  },

  // --- Enhanced Actions ---
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12, // Increased from 10
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    // Enhanced 3D shadow effect
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
    shadowColor: COLORS.danger,
    shadowOpacity: 0.3,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  actionButtonText: {
    ...FONTS.body3,
    fontSize: 16, // Increased from 15
    color: COLORS.white,
    fontWeight: "700",
  },
});

export default MerchantHomeScreen;
