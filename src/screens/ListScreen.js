import React, { useState, useMemo, useCallback } from "react";
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
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import apiClient from "../api/apiClient";

// Konfigurasi terpusat untuk semua status pesanan
const STATUS_CONFIG = {
  ACCEPT: { displayName: "Disiapkan", color: "#7F8C8D" }, // Abu-abu
  PREPARING: { displayName: "Disiapkan", color: "#7F8C8D" }, // Abu-abu
  READY_FOR_PICKUP: { displayName: "Siap Diambil", color: "#2ECC71" }, // Hijau
  COMPLETED: { displayName: "Selesai", color: "#3498DB" }, // Biru
  CANCELLED: { displayName: "Ditolak", color: "#E74C3C" }, // Merah
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

const ListScreen = ({ onUpdateStatus }) => {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  

  const handleUpdateStatus = useCallback(async (orderId, newStatus) => {
    try {
      if (newStatus === "Ready for Pickup") {
        await apiClient.put(`/orders/${orderId}/ready`);
        // After successful API call, refresh the orders
        fetchOrders();
      } else if (newStatus === "Completed") {
        // Assuming there will be a similar endpoint for 'Completed'
        // For now, just update locally or handle as per existing logic
        // await apiClient.put(`/orders/${orderId}/complete`);
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Gagal memperbarui status pesanan.",
        button: "Tutup",
      });
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/orders/seller/me");
      setOrders(response.data.data);
      console.log("Fetched order IDs:", response.data.data.map(order => order.id));
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Gagal mengambil daftar pesanan.",
        button: "Tutup",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const renderOrderItem = ({ item }) => {
    return (
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
          {item.orderItems &&
            item.orderItems.map((orderItem, index) => (
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
              <Text style={styles.paymentStatusText}>
                {item.payment.status}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>📝 Catatan Pembeli:</Text>
          <Text style={styles.noteText}>
            {item.notes || "Tidak ada catatan"}
          </Text>
        </View>

        <View style={styles.actionContainer}>
          {item.status === "PREPARING" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleUpdateStatus(item.id, "READY_FOR_PICKUP")}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>✅ Siap Diambil</Text>
            </TouchableOpacity>
          )}
          {item.status === "READY_FOR_PICKUP" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleUpdateStatus(item.id, "COMPLETED")}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>✅ Selesai</Text>
            </TouchableOpacity>
          )}
          {item.status !== "COMPLETED" && item.status !== "CANCELLED" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleUpdateStatus(item.id, "CANCELLED")}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>❌ Batalkan</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) {
      console.log("filteredOrders: orders is not an array", orders);
      return [];
    }
    if (selectedCategory === "Semua") {
      const statusesToDisplay = [
        "PREPARING",
        "READY_FOR_PICKUP",
        "COMPLETED",
        "CANCELLED",
        "ACCEPT",
      ];
      return orders.filter((order) => statusesToDisplay.includes(order.status));
    }
    // Find all internal statuses that match the selected display name
    const internalStatuses = Object.keys(STATUS_CONFIG).filter(
      (key) => STATUS_CONFIG[key].displayName === selectedCategory
    );
    return orders.filter((o) => internalStatuses.includes(o.status));
  }, [orders, selectedCategory]);

  

  return (
    <SafeAreaView style={styles.safeArea}>
      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2ECC71" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Daftar Pesanan</Text>
          <Text style={styles.headerSubtitle}>
            Kelola pesanan Anda dengan mudah
          </Text>
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
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item, index) => item.id != null ? String(item.id) : String(index)}
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
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    textAlign: "center",
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderItem: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#E74C3C",
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
  
  customerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 4,
  },
  
  priceContainer: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#27AE60",
  },
  orderItemsContainer: {
    marginBottom: 16,
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
  },
  orderItemsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 12,
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
  },
  orderItemText: {
    fontSize: 14,
    color: "#2C3E50",
    fontWeight: "500",
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "600",
  },
  paymentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#EBF3FD",
    padding: 12,
    borderRadius: 8,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  paymentStatusBadge: {
    backgroundColor: "#27AE60",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paymentStatusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  noteContainer: {
    marginBottom: 20,
    backgroundColor: "#FFF9E6",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F39C12",
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#7F8C8D",
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rejectButton: {
    backgroundColor: "#E74C3C",
  },
  acceptButton: {
    backgroundColor: "#27AE60",
  },
  completeButton: {
    backgroundColor: "#27AE60",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#7F8C8D",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#BDC3C7",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#BDC3C7",
    textAlign: "center",
  },
  
  categoryContainerWrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryContainer: {
    flexDirection: "row",
    flexGrow: 1,
  },
  categoryTab: {
    flexGrow: 1,
    minWidth: 110,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCategoryTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#2ECC71",
  },
  categoryTabText: {
    color: "#495057",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  activeCategoryTabText: {
    color: "#2ECC71",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});

export default ListScreen;
