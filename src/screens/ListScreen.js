import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import Modal from "react-native-modal";
import { TextInput, Animated, Dimensions, Easing } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ALERT_TYPE, Dialog, prompt } from "react-native-alert-notification";
import { useOrders } from "../context/OrderContext";

const { width: screenWidth } = Dimensions.get("window");

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

// Konfigurasi terpusat untuk semua status pesanan
const STATUS_CONFIG = {
  PREPARING: {
    displayName: "Disiapkan",
    color: "#FF9500",
    gradient: ["#FF9500", "#FF7A00"],
  },
  READY_FOR_PICKUP: {
    displayName: "Siap Diambil",
    color: "#34C759",
    gradient: ["#34C759", "#30B653"],
  },
  COMPLETED: {
    displayName: "Selesai",
    color: "#007AFF",
    gradient: ["#007AFF", "#0056CC"],
  },
  CANCELLED: {
    displayName: "Ditolak",
    color: "#FF3B30",
    gradient: ["#FF3B30", "#D70015"],
  },
};

// Membuat daftar kategori secara dinamis dari konfigurasi
const categories = [
  "Semua",
  ...[
    ...new Set(
      Object.values(STATUS_CONFIG).map((config) => config.displayName)
    ),
  ],
];

const AnimatedOrderItem = ({ item, onUpdateStatus, onCompleteOrder }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const slideValue = useRef(new Animated.Value(50)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(slideValue, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleButtonPress = (callback) => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  };

  return (
    <Animated.View
      style={[
        styles.orderItem,
        {
          transform: [{ scale: scaleValue }, { translateY: slideValue }],
          opacity: opacityValue,
        },
      ]}
    >
      <View style={styles.orderItemHeader}>
        <View style={styles.customerInfoContainer}>
          <View style={styles.nameAndStatusRow}>
            <Text style={styles.customerName}>{item.customerName}</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    STATUS_CONFIG[item.status]?.color || "#7F8C8D",
                },
              ]}
            >
              <Text style={styles.statusText}>
                {STATUS_CONFIG[item.status]?.displayName || item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.orderIdText}>Order ID: {item.orderId}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.orderPrice}>
            Rp {Number(item.totalAmount || 0).toLocaleString("id-ID")}
          </Text>
        </View>
      </View>

      <View style={styles.orderItemsContainer}>
        <Text style={styles.orderItemsTitle}>📦 Items Pesanan:</Text>
        {item.orderItems &&
          item.orderItems.map((orderItem, index) => (
            <View key={`${item.orderId}-${index}`} style={styles.orderItemRow}>
              <Text style={styles.orderItemText}>
                {orderItem.quantity}x {orderItem.menuItemName}
              </Text>
              <Text style={styles.orderItemPrice}>
                Rp {Number(orderItem.pricePerItem || 0).toLocaleString("id-ID")}
              </Text>
            </View>
          ))}
      </View>

      {item.payment && (
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentLabel}>💳 Status Pembayaran:</Text>
          <View style={styles.paymentStatusBadge}>
            <Text style={styles.paymentStatusText}>{item.payment.status}</Text>
          </View>
        </View>
      )}

      <View style={styles.noteContainer}>
        <Text style={styles.noteLabel}>📝 Catatan Pembeli:</Text>
        <Text style={styles.noteText}>{item.notes || "Tidak ada catatan"}</Text>
      </View>

      <View style={styles.actionContainer}>
        {item.status === "PREPARING" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() =>
              handleButtonPress(() =>
                onUpdateStatus(item.orderId, "READY_FOR_PICKUP")
              )
            }
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>✅ Siap Diambil</Text>
          </TouchableOpacity>
        )}
        {item.status === "READY_FOR_PICKUP" && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() =>
              handleButtonPress(() => onCompleteOrder(item.orderId))
            }
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>✅ Selesai</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const ListScreen = () => {
  const {
    orders,
    loading,
    refreshing,
    loadingMore,
    page,
    hasMore,
    fetchOrders,
    updateOrderStatus,
    completeOrder,
    resetPagination,
  } = useOrders();

  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isModalVisible, setModalVisible] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    fetchOrders(1); // Fetch orders only once when component mounts
  }, []); // Empty dependency array means it runs once on mount

  const onRefresh = useCallback(() => {
    resetPagination();
    fetchOrders(1, true);
  }, [fetchOrders, resetPagination]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchOrders(page);
    }
  }, [loadingMore, hasMore, fetchOrders, page]);

  React.useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const handleCompleteOrder = useCallback(
    async (orderId) => {
      setCurrentOrderId(orderId);
      setModalVisible(true);
    },
    []
  );

  const handleModalSubmit = useCallback(async () => {
    setModalVisible(false);
    if (!currentOrderId) return;

    await completeOrder(currentOrderId, verificationCode);
    setCurrentOrderId(null);
    setVerificationCode("");
  }, [currentOrderId, verificationCode, completeOrder]);

  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    setCurrentOrderId(null);
    setVerificationCode("");
  }, []);

  const handleUpdateStatus = useCallback(
    async (orderId, newStatus) => {
      await updateOrderStatus(orderId, newStatus);
    },
    [updateOrderStatus]
  );

  const renderOrderItem = ({ item, index }) => {
    return (
      <AnimatedOrderItem
        item={item}
        onUpdateStatus={handleUpdateStatus}
        onCompleteOrder={handleCompleteOrder}
      />
    );
  };

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) {
      return [];
    }
    if (selectedCategory === "Semua") {
      // Exclude PENDING_PAYMENT and PAID from "Semua" category
      return orders.filter(
        (o) => o.status !== "PENDING_PAYMENT" && o.status !== "PAID"
      );
    }
    const internalStatuses = Object.keys(STATUS_CONFIG).filter(
      (key) => STATUS_CONFIG[key].displayName === selectedCategory
    );
    return orders.filter((o) => internalStatuses.includes(o.status));
  }, [orders, selectedCategory]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Memuat pesanan...</Text>
        </View>
      ) : (
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Daftar Pesanan</Text>
            {/* <Text style={styles.headerSubtitle}>
              Kelola pesanan Anda dengan mudah
            </Text> */}
            <View style={styles.headerUnderline} />
          </View>

          <View style={styles.categoryContainerWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.categoryTab,
                    selectedCategory === item && styles.activeCategoryTab,
                  ]}
                  onPress={() => setSelectedCategory(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      selectedCategory === item && styles.activeCategoryTabText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <FlatList
            key={selectedCategory}
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => String(item.orderId)}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyText}>Tidak ada pesanan</Text>
                <Text style={styles.emptySubtext}>
                  Pesanan akan muncul di sini ketika ada yang memesan
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#007AFF"]}
                tintColor="#007AFF"
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore && (
                <ActivityIndicator
                  style={{ marginVertical: 20 }}
                  size="large"
                  color="#007AFF"
                />
              )
            }
          />
        </Animated.View>
      )}

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={handleModalCancel}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        useNativeDriver={true}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>🔒 Verifikasi Selesai</Text>
          <Text style={styles.modalText}>
            Masukkan kode verifikasi untuk menyelesaikan pesanan ini:
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan kode verifikasi"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="numeric"
            maxLength={6}
          />
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={handleModalCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonSubmit}
              onPress={handleModalSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Selesaikan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F7FF",
  },
  container: {
    flex: 1,
  },
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
  headerSubtitle: {
    ...FONTS.body2,
    color: COLORS.darkGray,
    fontSize: 15,
  },
  headerUnderline: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 10,
  },
  orderItem: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F0F4F8",
  },
  orderItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  customerInfoContainer: {
    flex: 1,
    marginRight: 12,
  },
  nameAndStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  customerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginRight: 10,
  },
  orderIdText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  priceContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#27AE60",
  },
  orderItemsContainer: {
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderItemsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    borderRadius: 8,
  },
  orderItemText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  paymentStatusBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentStatusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  noteContainer: {
    marginBottom: 20,
    backgroundColor: "#FFFBEB",
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    fontStyle: "italic",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptButton: {
    backgroundColor: "#10B981",
  },
  completeButton: {
    backgroundColor: "#3B82F6",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 40,
  },
  categoryContainerWrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  categoryTab: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  activeCategoryTab: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryTabText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  activeCategoryTabText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F7FF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 28,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 24,
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#E5E7EB",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "#F8FAFC",
    marginBottom: 24,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButtonCancel: {
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalButtonSubmit: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default ListScreen;
