import React, { useState, useEffect, useCallback } from "react";
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
} from "react-native";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import apiClient from "../api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
// --- END OF THEME ---

const MerchantHomeScreen = () => {
  const [balance, setBalance] = useState(0);
  const [soldBagsCount, setSoldBagsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [incomingOrders, setIncomingOrders] = useState([]);

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

      const ordersResponse = await apiClient.get("/orders/seller/me");
      const paidOrders = ordersResponse.data.data.filter(
        (order) => order.status === "PAID"
      );
      setIncomingOrders(paidOrders);
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleWithdraw = () => {
    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: "Segera Hadir",
      textBody: "Fitur penarikan sedang dalam pengembangan.",
      button: "Tutup",
    });
  };

  const handleReject = async (orderId) => {
    try {
      await apiClient.put(`/orders/${orderId}/cancel`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to reject order:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Gagal menolak pesanan.",
        button: "Tutup",
      });
    }
  };

  const handleAccept = async (orderId) => {
    try {
      await apiClient.put(`/orders/${orderId}/accept`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Failed to accept order:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Gagal menerima pesanan.",
        button: "Tutup",
      });
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderItemHeader}>
        <View style={styles.customerInfoContainer}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.orderIdText}>Order ID: {item.orderId}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.orderPrice}>
            Rp {item.totalAmount?.toLocaleString("id-ID")}
          </Text>
        </View>
      </View>

      <View style={styles.orderItemsContainer}>
        <Text style={styles.orderItemsTitle}>📦 Order Items:</Text>
        {item.orderItems?.map((orderItem, index) => (
          <View key={`${item.id}-${index}`} style={styles.orderItemRow}>
            <Text style={styles.orderItemText}>
              {orderItem.quantity}x {orderItem.menuItemName}
            </Text>
            <Text style={styles.orderItemPrice}>
              Rp {orderItem.pricePerItem?.toLocaleString("id-ID")}
            </Text>
          </View>
        ))}
      </View>

      {item.payment && (
        <View style={styles.paymentContainer}>
          <Text style={styles.paymentLabel}>💳 Payment Status:</Text>
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
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleReject(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>❌ Tolak</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAccept(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>✅ Terima</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dasbor Merchant</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCardBase, styles.balanceCard]}>
            <Text style={styles.cardIcon}>💰</Text>
            <Text style={styles.cardLabel}>Saldo Anda</Text>
            <Text style={styles.balanceAmount}>
              Rp {balance.toLocaleString("id-ID")}
            </Text>
            <TouchableOpacity
              style={styles.withdrawButton}
              onPress={handleWithdraw}
              activeOpacity={0.8}
            >
              <Text style={styles.withdrawButtonText}>💸 Tarik Saldo</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.summaryCardBase, styles.soldCard]}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardLabel}>Tas Terjual</Text>
            <Text style={styles.soldAmount}>{soldBagsCount}</Text>
            <Text style={styles.soldSubtext}>Total penjualan</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Pesanan Masuk</Text>
          <Text style={styles.sectionSubtitle}>
            {incomingOrders.length} pesanan menunggu konfirmasi
          </Text>
        </View>

        <FlatList
          data={incomingOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item, index) =>
            item.id ? item.id.toString() : index.toString()
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>Tidak ada pesanan baru</Text>
              <Text style={styles.emptySubtext}>
                Pesanan akan muncul di sini
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
    </SafeAreaView>
  );
};

// --- REFACTORED STYLESHEET ---
const styles = StyleSheet.create({
  // --- Base ---
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  // --- Header ---
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#F8F9FA", // Match safe area background
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
  },

  // --- Summary Cards ---
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
  },
  balanceCard: {
    flex: 1.2,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  soldCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: SIZES.base,
  },
  cardLabel: {
    ...FONTS.cardLabel,
    marginBottom: 4,
  },
  balanceAmount: {
    ...FONTS.h2,
    fontSize: 24, // Custom size
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 16,
  },
  soldAmount: {
    ...FONTS.h1,
    fontSize: 32, // Custom size
    color: COLORS.secondary,
    marginBottom: 4,
  },
  soldSubtext: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  withdrawButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.radius,
    paddingHorizontal: 16,
    borderRadius: SIZES.radius,
    alignSelf: "flex-start",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  withdrawButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontSize: SIZES.body3,
  },
  // --- Section Header ---
  sectionHeader: {
    marginHorizontal: SIZES.padding,
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.h2,
    color: COLORS.title,
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...FONTS.body2,
    color: COLORS.darkGray,
  },
  // --- List ---
  listContainer: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: SIZES.h3,
    fontWeight: "600",
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  emptySubtext: {
    ...FONTS.body2,
    color: COLORS.gray,
    textAlign: "center",
  },
  // --- Order Item Card ---
  orderItem: {
    backgroundColor: COLORS.card,
    padding: SIZES.padding,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    ...SHADOWS.light,
  },
  orderItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  customerInfoContainer: {
    flex: 1,
    marginRight: SIZES.radius,
  },
  customerName: {
    ...FONTS.h3,
    color: COLORS.title,
    marginBottom: 4,
  },
  orderIdText: {
    ...FONTS.body2,
    color: COLORS.darkGray,
  },
  priceContainer: {
    backgroundColor: COLORS.priceBg,
    paddingHorizontal: SIZES.radius,
    paddingVertical: SIZES.base,
    borderRadius: SIZES.base,
  },
  orderPrice: {
    ...FONTS.h4,
    color: COLORS.primary,
  },
  orderItemsContainer: {
    marginBottom: 16,
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: SIZES.radius,
  },
  orderItemsTitle: {
    ...FONTS.h4,
    color: COLORS.title,
    marginBottom: SIZES.radius,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.base,
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
    fontWeight: "600",
  },
  paymentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: COLORS.paymentBg,
    padding: SIZES.radius,
    borderRadius: SIZES.base,
  },
  paymentLabel: {
    ...FONTS.body2,
    fontWeight: "600",
    color: COLORS.title,
  },
  paymentStatusBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.radius,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paymentStatusText: {
    ...FONTS.body3,
    fontSize: SIZES.body3,
    color: COLORS.white,
  },
  noteContainer: {
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.noteBg,
    padding: 16,
    borderRadius: SIZES.radius,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  noteLabel: {
    ...FONTS.h4,
    fontSize: SIZES.body2,
    color: COLORS.title,
    marginBottom: SIZES.base,
  },
  noteText: {
    ...FONTS.body2,
    color: COLORS.darkGray,
    lineHeight: 20,
    fontStyle: "italic",
  },
  // --- Actions ---
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: SIZES.radius,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: SIZES.radius,
    alignItems: "center",
    ...SHADOWS.light,
    elevation: 3,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    ...FONTS.body3,
    fontSize: SIZES.font,
    color: COLORS.white,
  },
});

export default MerchantHomeScreen;
