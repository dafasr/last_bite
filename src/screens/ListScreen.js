import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

const ListScreen = ({ acceptedOrders, onUpdateStatus }) => {
  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderItemHeader}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <Text style={styles.orderPrice}>Rp {item.price}</Text>
      </View>
      <Text style={styles.orderItems}>{item.items}</Text>
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
    </View>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Preparing":
        return { backgroundColor: "#7F8C8D" }; // Abu-abu
      case "Ready for Pickup":
        return { backgroundColor: "#2ECC71" }; // Hijau
      default:
        return { backgroundColor: "#7F8C8D" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Accepted Orders</Text>
        </View>
        <FlatList
          data={acceptedOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No accepted orders yet.</Text>
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
    paddingTop: 20,
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
});

export default ListScreen;
