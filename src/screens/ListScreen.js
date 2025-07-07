import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";

// Konfigurasi terpusat untuk semua status pesanan
const STATUS_CONFIG = {
  Preparing: { displayName: "Disiapkan", color: "#7F8C8D" }, // Abu-abu
  "Ready for Pickup": { displayName: "Siap Diambil", color: "#2ECC71" }, // Hijau
  Completed: { displayName: "Selesai", color: "#3498DB" }, // Biru
  Rejected: { displayName: "Ditolak", color: "#E74C3C" }, // Merah
};

// Membuat daftar kategori secara dinamis dari konfigurasi
const categories = [
  "Semua",
  ...Object.values(STATUS_CONFIG).map((config) => config.displayName),
];

const ListScreen = ({ orders, onUpdateStatus }) => {
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderItemHeader}>
        <View style={styles.customerInfoContainer}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>
              {STATUS_CONFIG[item.status]?.displayName || item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.orderPrice}>Rp {item.price}</Text>
      </View>
      <View style={styles.orderItemsContainer}>
        {item.items.map((orderItem, index) => (
          <Text key={index} style={styles.orderItemText}>
            {orderItem.quantity}x {orderItem.name}
          </Text>
        ))}
      </View>
      {item.note && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>Catatan Pembeli:</Text>
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      )}
      {item.status === "Preparing" && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onUpdateStatus(item.id, "Ready for Pickup")}
          >
            <Text style={styles.actionButtonText}>Tandai Siap Diambil</Text>
          </TouchableOpacity>
        </View>
      )}
      {item.status === "Ready for Pickup" && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => onUpdateStatus(item.id, "Completed")}
          >
            <Text style={styles.actionButtonText}>Selesaikan Pesanan</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const filteredOrders = useMemo(() => {
    if (selectedCategory === "Semua") {
      return orders;
    }
    // Mencari status internal (misal: "Preparing") berdasarkan nama tampilan yang dipilih (misal: "Disiapkan")
    const internalStatus = Object.keys(STATUS_CONFIG).find(
      (key) => STATUS_CONFIG[key].displayName === selectedCategory
    );
    return orders.filter((o) => o.status === internalStatus);
  }, [orders, selectedCategory]);

  const getStatusStyle = (status) => {
    // Mengambil warna dari konfigurasi, dengan warna default jika status tidak ditemukan
    return { backgroundColor: STATUS_CONFIG[status]?.color || "#7F8C8D" };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daftar Pesanan</Text>
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Tidak ada pesanan di kategori ini.
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
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
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  orderItem: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  orderItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  customerInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
    flexShrink: 1,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2ECC71",
  },
  orderItemsContainer: {
    marginBottom: 10,
  },
  orderItemText: {
    fontSize: 14,
    color: "#7F8C8D",
    // Use lineHeight to add space between items if there are multiple
    lineHeight: 20,
  },
  noteContainer: {
    marginTop: 5,
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f0f8ff", // AliceBlue for a subtle highlight
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: "#3498DB",
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  noteText: {
    fontSize: 14,
    color: "#555",
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionContainer: {
    marginTop: 15,
    alignItems: "flex-end",
  },
  actionButton: {
    backgroundColor: "#3498DB", // Biru
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  completeButton: {
    backgroundColor: "#2ECC71", // Hijau
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#7F8C8D",
  },
  categoryContainerWrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryContainer: {
    flexDirection: "row",
    // flexGrow: 1 ensures the container itself can grow inside the ScrollView
    // if its children are smaller than the ScrollView.
    flexGrow: 1,
  },
  categoryTab: {
    // flexGrow allows tabs to expand and fill available space
    flexGrow: 1,
    // minWidth ensures tabs are readable even if there are many
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
});

export default ListScreen;
