import React, { useState, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Image,
} from "react-native";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { useMenu } from "../context/MenuContext";
import { getMenuItems } from "../api/apiClient";

const MenuScreen = ({ navigation }) => {
  const { surpriseBags, setSurpriseBags, toggleAvailability, deleteBag } =
    useMenu();
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchMenuItems = async () => {
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
      };

      fetchMenuItems();
    }, [])
  );

  // Placeholder untuk fungsi edit
  // Mengarahkan ke layar EditBag dan mengirimkan data 'bag' yang dipilih
  const handleEdit = (bag) => navigation.navigate("EditBag", { bag });

  // Placeholder untuk fungsi tambah
  const handleAddBag = () => navigation.navigate("AddBag");

  const handleDelete = (bagId, bagName) => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: "Hapus Surprise Bag",
      textBody: `Apakah Anda yakin ingin menghapus "${bagName}"? Tindakan ini tidak dapat dibatalkan.`,
      button: "Hapus",
      onPressButton: () => deleteBag(bagId),
      showCancelButton: true,
      cancelButton: "Batal",
    });
  };

  const filteredBags = useMemo(() => {
    return surpriseBags;
  }, [surpriseBags]);

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

        <Text style={styles.bagItemsLabel}>Kemungkinan isi:</Text>
        <Text style={styles.bagItems}>{item.description}</Text>

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
          <Text style={styles.headerTitle}>Your Surprise Bags</Text>
        </View>
        <FlatList
          data={filteredBags}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Tidak ada Surprise Bag di kategori ini.
              </Text>
            </View>
          }
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddBag}>
          <Text style={styles.addButtonText}>+ Tambah Surprise Bag</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1 },
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
    padding: 20,
    flexGrow: 1,
  },
  bagItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    overflow: "hidden", // Ensures the image respects the border radius
  },
  bagImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  bagContent: {
    padding: 20,
  },
  bagName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    // marginBottom is removed as spacing is now handled by the container
  },
  bagItemsLabel: {
    fontSize: 14,
    marginTop: 10,
    color: "#7F8C8D",
    fontWeight: "600",
  },
  bagItems: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  originalPrice: {
    fontSize: 16,
    color: "#E74C3C",
    textDecorationLine: "line-through",
    marginRight: 10,
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2ECC71",
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 5,
  },
  availabilityLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "600",
    marginRight: 8,
  },
  availabilityTime: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 5,
  },
  quantityLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "600",
    marginRight: 8,
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  statusInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 5,
  },
  statusInfoLabel: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "600",
    marginRight: 8,
  },
  statusInfoText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
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
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  categoryContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 15,
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
    fontSize: 16,
  },
  activeCategoryTabText: {
    color: "#2ECC71",
  },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { textAlign: "center", fontSize: 16, color: "#7F8C8D" },
});

export default MenuScreen;
