import React, { useState, useMemo, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  RefreshControl,
  ScrollView,
} from "react-native";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { useMenu } from "../context/MenuContext";
import { getMenuItems } from "../api/apiClient";

const MenuScreen = ({ navigation }) => {
  const { surpriseBags, setSurpriseBags, toggleAvailability, deleteBag } =
    useMenu();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMenuItems();
      setSurpriseBags(response.data.data);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Gagal mengambil item menu.",
        button: "Tutup",
      });
    } finally {
      setLoading(false);
    }
  }, [setSurpriseBags]);

  useFocusEffect(
    React.useCallback(() => {
      fetchMenuItems();
    }, [fetchMenuItems])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMenuItems();
    setRefreshing(false);
  }, [fetchMenuItems]);

  // Placeholder untuk fungsi edit
  // Mengarahkan ke layar EditBag dan mengirimkan data 'bag' yang dipilih
  const handleEdit = (bag) => navigation.navigate("EditBag", { bag });

  // Placeholder untuk fungsi tambah
  const handleAddBag = () => navigation.navigate("AddBag");

  const handleDelete = (bagId, bagName) => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: "Hapus Menu",
      textBody: `Apakah Anda yakin ingin menghapus "${bagName}"? Tindakan ini tidak dapat dibatalkan.`,
      button: "Hapus",
      onPressButton: () => {
        deleteBag(bagId);
        Dialog.hide();
      },
      showCancelButton: true,
      cancelButton: "Batal",
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.bagItem}>
      <Image
        style={styles.bagImage}
        source={{
          uri:
            item.imageUrl ||
            "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=500&q=80",
        }}
      />
      <View style={styles.bagContent}>
        <Text style={styles.bagName}>{item.name}</Text>

        <View style={styles.orderItemsContainer}>
          <Text style={styles.orderItemsTitle}>📦 Kemungkinan isi:</Text>
          <Text style={styles.orderItemText}>{item.description}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.originalPrice}>
            Rp {item.originalPrice.toLocaleString("id-ID")}
          </Text>
          <Text style={styles.discountedPrice}>
            Rp {item.discountedPrice.toLocaleString("id-ID")}
          </Text>
        </View>

        <View style={styles.availabilityContainer}>
          <Text style={styles.availabilityLabel}>Waktu Tersedia:</Text>
          <Text style={styles.availabilityTime}>
            {item.displayStartTime
              ? item.displayStartTime.slice(11, 16)
              : "N/A"}{" "}
            - {item.displayEndTime ? item.displayEndTime.slice(11, 16) : "N/A"}
          </Text>
        </View>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Kuantitas:</Text>
          <Text style={styles.quantityText}>{item.quantityAvailable}</Text>
        </View>

        <View style={styles.statusInfoContainer}>
          <Text style={styles.statusInfoLabel}>Status:</Text>
          <Text style={styles.statusInfoText}>{item.status}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Text style={styles.actionButtonText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daftar Menu</Text>
          <Text style={styles.headerSubtitle}>
            Kelola menu Anda dengan mudah
          </Text>
        </View>
        <FlatList
          data={surpriseBags}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.id != null ? String(item.id) : String(index)
          }
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>Tidak ada menu</Text>
              <Text style={styles.emptySubtext}>
                Menu Anda akan muncul di sini
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddBag}>
        <Text style={styles.addButtonText}>Tambah Menu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1, overflow: "visible" },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    justifyContent: "center",
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
    padding: 10,
    flexGrow: 1,
    paddingBottom: 80, // Add padding to make space for the button
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
  },

  bagItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    overflow: "hidden",
    width: "48%", // Approximately half the screen width minus some margin
  },
  bagImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bagContent: {
    padding: 20,
  },
  bagName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
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
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  originalPrice: {
    fontSize: 13,
    color: "#E74C3C",
    textDecorationLine: "line-through",
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2ECC71",
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    padding: 8,
    borderRadius: 5,
  },
  availabilityLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "600",
    marginRight: 5,
  },
  availabilityTime: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    padding: 8,
    borderRadius: 5,
  },
  quantityLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "600",
    marginRight: 5,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },
  statusInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    padding: 8,
    borderRadius: 5,
  },
  statusInfoLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "600",
    marginRight: 5,
  },
  statusInfoText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333",
  },

  buttonContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#3498DB",
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#E74C3C", // Red
  },
  addButton: {
    backgroundColor: "#2ECC71",
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 1000, // Ensure it's on top
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MenuScreen;
