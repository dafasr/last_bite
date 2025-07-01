import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Image,
  Alert,
} from "react-native";
import { useMenu } from "../context/MenuContext";

const categories = ["Semua", "Ready", "Tidak Ready"];

const MenuScreen = ({ navigation }) => {
  const { surpriseBags, toggleAvailability, deleteBag } = useMenu();
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Placeholder untuk fungsi edit
  // Mengarahkan ke layar EditBag dan mengirimkan data 'bag' yang dipilih
  const handleEdit = (bag) => navigation.navigate("EditBag", { bag });

  // Placeholder untuk fungsi tambah
  const handleAddBag = () => navigation.navigate("AddBag");

  const handleDelete = (bagId, bagName) => {
    Alert.alert(
      "Hapus Surprise Bag",
      `Apakah Anda yakin ingin menghapus "${bagName}"? Tindakan ini tidak dapat dibatalkan.`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          onPress: () => deleteBag(bagId),
          style: "destructive",
        },
      ]
    );
  };

  const filteredBags = useMemo(() => {
    if (selectedCategory === "Ready") {
      return surpriseBags.filter((bag) => bag.isAvailable);
    }
    if (selectedCategory === "Tidak Ready") {
      return surpriseBags.filter((bag) => !bag.isAvailable);
    }
    return surpriseBags; // "Semua"
  }, [surpriseBags, selectedCategory]);

  const renderItem = ({ item }) => (
    <View style={styles.bagItem}>
      <Image
        style={styles.bagImage}
        source={{
          uri:
            item.image ||
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
            {item.availableFrom || "N/A"} - {item.availableTo || "N/A"}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Ready</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={item.isAvailable ? "#2ECC71" : "#f4f3f4"}
            onValueChange={() => toggleAvailability(item.id)}
            value={item.isAvailable}
          />
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
        <View style={styles.categoryContainer}>
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
