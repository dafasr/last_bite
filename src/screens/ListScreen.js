import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

const ListScreen = ({ orders, onUpdateStatus }) => {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const categories = ["Semua", "Disiapkan", "Siap Diambil", "Selesai"];

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderItemHeader}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.orderPrice}>Rp {item.price}</Text>
      </View>
      <Text style={styles.orderItems}>{item.items}</Text>
      {item.note && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>Catatan Pembeli:</Text>
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      )}
      <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
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
    switch (selectedCategory) {
      case "Disiapkan":
        return orders.filter((o) => o.status === "Preparing");
      case "Siap Diambil":
        return orders.filter((o) => o.status === "Ready for Pickup");
      case "Selesai":
        return orders.filter((o) => o.status === "Completed");
      case "Semua":
      default:
        return orders;
    }
  }, [orders, selectedCategory]);

  const renderCategoryTab = ({ item }) => (
    <TouchableOpacity
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
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Preparing":
        return { backgroundColor: "#7F8C8D" }; // Abu-abu
      case "Ready for Pickup":
        return { backgroundColor: "#2ECC71" }; // Hijau
      case "Completed":
        return { backgroundColor: "#3498DB" }; // Biru
      default:
        return { backgroundColor: "#7F8C8D" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daftar Pesanan</Text>
        </View>
        <View>
          <FlatList
            data={categories}
            renderItem={renderCategoryTab}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryListContainer}
          />
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
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
    marginBottom: 10,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2ECC71",
  },
  orderItems: {
    fontSize: 14,
    color: "#7F8C8D",
    marginBottom: 10,
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
    alignSelf: "flex-start",
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
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
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
  categoryListContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#e9ecef",
    marginHorizontal: 5,
  },
  activeCategoryTab: {
    backgroundColor: "#2ECC71",
  },
  categoryTabText: {
    color: "#495057",
    fontWeight: "600",
  },
  activeCategoryTabText: {
    color: "#FFFFFF",
  },
});

export default ListScreen;
