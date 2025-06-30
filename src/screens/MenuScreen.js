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
import { useMenu } from "../context/MenuContext";

const MenuScreen = ({ navigation }) => {
  const { surpriseBags, toggleAvailability, deleteBag } = useMenu();

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

  const renderItem = ({ item }) => (
    <View style={styles.bagItem}>
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
});

export default MenuScreen;
