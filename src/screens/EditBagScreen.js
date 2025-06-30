import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { useMenu } from "../context/MenuContext";

const EditBagScreen = ({ navigation, route }) => {
  const { bag } = route.params; // Mengambil data bag yang dikirim dari MenuScreen
  const { updateBag } = useMenu();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // Mengisi form dengan data bag yang sudah ada saat komponen dimuat
  useEffect(() => {
    if (bag) {
      setName(bag.name);
      setDescription(bag.description);
      setOriginalPrice(String(bag.originalPrice));
      setDiscountedPrice(String(bag.discountedPrice));
      setQuantity(String(bag.quantity));
    }
  }, [bag]);

  const handleSave = () => {
    // Validasi dasar
    if (!name || !originalPrice || !discountedPrice || !quantity) {
      Alert.alert("Error", "Harap isi semua field yang wajib diisi.");
      return;
    }

    // Panggil fungsi updateBag dari context
    updateBag(bag.id, {
      name,
      description,
      originalPrice: parseFloat(originalPrice),
      discountedPrice: parseFloat(discountedPrice),
      quantity: parseInt(quantity, 10),
    });

    Alert.alert("Sukses", "Surprise Bag berhasil diperbarui!", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const handleUploadImage = () => {
    Alert.alert(
      "Segera Hadir",
      "Fitur unggah gambar sedang dalam pengembangan."
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Surprise Bag</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Nama Bag</Text>
          <TextInput
            style={styles.input}
            placeholder="cth: Paket Roti Spesial"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Deskripsi (Kemungkinan Isi)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="cth: Roti Coklat, Roti Keju, Donat"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Gambar</Text>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={handleUploadImage}
          >
            <Text style={styles.outlineButtonText}>Unggah Gambar</Text>
          </TouchableOpacity>

          <View style={styles.priceRow}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.label}>Harga Asli (Rp)</Text>
              <TextInput
                style={styles.input}
                placeholder="50000"
                value={originalPrice}
                onChangeText={setOriginalPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.priceInputContainer}>
              <Text style={styles.label}>Harga Diskon (Rp)</Text>
              <TextInput
                style={styles.input}
                placeholder="25000"
                value={discountedPrice}
                onChangeText={setDiscountedPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Kuantitas</Text>
          <TextInput
            style={styles.input}
            placeholder="10"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Simpan Perubahan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  formContainer: {
    margin: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 15,
  },
  priceRow: {
    flexDirection: "row",
    marginHorizontal: -5, // Menghilangkan margin ekstra pada sisi
  },
  priceInputContainer: {
    flex: 1,
    marginHorizontal: 5, // Memberi jarak antar input
  },
  outlineButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3498DB",
    marginBottom: 20,
  },
  outlineButtonText: {
    color: "#3498DB",
    fontSize: 16,
    fontWeight: "bold",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#2ECC71",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default EditBagScreen;
