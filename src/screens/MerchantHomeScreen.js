import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

const MerchantHomeScreen = ({ incomingOrders, onAccept, onReject }) => {
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
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => onReject(item.id)}
        >
          <Text style={styles.actionButtonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => onAccept(item.id)}
        >
          <Text style={styles.actionButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "New":
        return { backgroundColor: "#FF6B35" }; // Orange
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
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceAmount}>Rp 1,250,000</Text>
        </View>

        <Text style={styles.sectionTitle}>Incoming Orders</Text>

        <FlatList
          data={incomingOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No new orders.</Text>
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
  balanceCard: {
    backgroundColor: "#2ECC71",
    margin: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 20,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
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
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginLeft: 10,
  },
  rejectButton: {
    backgroundColor: "#E74C3C", // Red
  },
  acceptButton: {
    backgroundColor: "#2ECC71", // Green
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

export default MerchantHomeScreen;
