import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";

const MerchantHomeScreen = ({
  incomingOrders,
  onAccept,
  onReject,
  soldBagsCount,
}) => {
  const handleWithdraw = () => {
    // Placeholder for withdraw logic
    Alert.alert("Coming Soon", "Withdraw feature is under development.");
  };

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

        <View style={styles.summaryRow}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={styles.balanceAmount}>Rp 1,250,000</Text>
            <TouchableOpacity
              style={styles.withdrawButton}
              onPress={handleWithdraw}
            >
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.soldCard}>
            <Text style={styles.soldLabel}>Bags Sold</Text>
            <Text style={styles.soldAmount}>{soldBagsCount || 0}</Text>
          </View>
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
  summaryRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 20,
  },
  balanceCard: {
    flex: 1.5,
    backgroundColor: "#2ECC71",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    marginRight: 10,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: 5,
    marginBottom: 15,
  },
  withdrawButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  withdrawButtonText: {
    color: "#2ECC71",
    fontWeight: "bold",
    fontSize: 14,
  },
  soldCard: {
    flex: 1,
    backgroundColor: "#3498DB",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    marginLeft: 10,
  },
  soldLabel: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  soldAmount: {
    fontSize: 36,
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
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
