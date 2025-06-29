import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from "react-native";

// Data dummy untuk contoh, nantinya bisa diganti dengan data dari API
const dummySurpriseBags = [
  {
    id: "1",
    name: "Paket Roti Manis",
    possibleItems: "Roti Coklat, Roti Keju, Donat Gula",
    originalPrice: 50000,
    discountedPrice: 25000,
    isAvailable: true,
  },
  {
    id: "2",
    name: "Paket Kue Kering",
    possibleItems: "Nastar, Kastengel, Putri Salju",
    originalPrice: 75000,
    discountedPrice: 40000,
    isAvailable: false,
  },
  {
    id: "3",
    name: "Paket Jajanan Pasar",
    possibleItems: "Lemper, Risoles, Kue Lumpur",
    originalPrice: 40000,
    discountedPrice: 20000,
    isAvailable: true,
  },
];

const MenuScreen = ({ navigation }) => {
  const [surpriseBags, setSurpriseBags] = useState(dummySurpriseBags);

  // Fungsi untuk mengubah status ketersediaan (ready/tidak)
  const toggleAvailability = (id) => {
    setSurpriseBags(
      surpriseBags.map((bag) =>
        bag.id === id ? { ...bag, isAvailable: !bag.isAvailable } : bag
      )
    );
  };

  // Placeholder untuk fungsi edit
  const handleEdit = (bag) => {
    Alert.alert(
      "Edit Surprise Bag",
      `Fitur untuk mengedit "${bag.name}" sedang dalam pengembangan.`
    );
  };

  // Placeholder untuk fungsi tambah
  const handleAddBag = () => {
    Alert.alert(
      "Add Surprise Bag",
      "Fitur untuk menambah Surprise Bag baru sedang dalam pengembangan."
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.bagItem}>
      <Text style={styles.bagName}>{item.name}</Text>

      <Text style={styles.bagItemsLabel}>Kemungkinan isi:</Text>
      <Text style={styles.bagItems}>{item.possibleItems}</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.originalPrice}>
          Rp {item.originalPrice.toLocaleString("id-ID")}
        </Text>
        <Text style={styles.discountedPrice}>
          Rp {item.discountedPrice.toLocaleString("id-ID")}
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

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEdit(item)}
      >
        <Text style={styles.editButtonText}>Edit Surprise Bag</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Surprise Bags</Text>
        </View>
        <FlatList
          data={surpriseBags}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
    padding: 20,
  },
  bagItem: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  bagName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  bagItemsLabel: {
    fontSize: 14,
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
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  editButton: {
    backgroundColor: "#3498DB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#2ECC71",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
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
});

export default MenuScreen;
