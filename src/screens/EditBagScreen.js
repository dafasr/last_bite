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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useMenu } from "../context/MenuContext";
import { useAuthContext } from "../context/AuthContext";
import apiClient from "../api/apiClient";
import { Picker } from "@react-native-picker/picker";
import { TimerPickerModal } from "react-native-timer-picker";

const EditBagScreen = ({ navigation, route }) => {
  const { bag } = route.params;
  const { updateBag } = useMenu();
  const { sellerProfileId } = useAuthContext();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [quantityAvailable, setQuantityAvailable] = useState("");
  const [displayStartTime, setDisplayStartTime] = useState("");
  const [displayEndTime, setDisplayEndTime] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);

  useEffect(() => {
    if (bag) {
      setName(bag.name);
      setDescription(bag.description);
      setImageUrl(bag.imageUrl);
      setOriginalPrice(String(bag.originalPrice));
      setDiscountedPrice(String(bag.discountedPrice));
      setQuantityAvailable(String(bag.quantityAvailable));
      setDisplayStartTime(bag.displayStartTime);
      setDisplayEndTime(bag.displayEndTime);
      setStatus(bag.status);
    }
  }, [bag]);

  const handleSave = async () => {
    if (!sellerProfileId) {
      Alert.alert("Error", "Seller profile ID not found. Please log in again.");
      return;
    }

    if (!name || !originalPrice || !discountedPrice || !quantityAvailable || !displayStartTime || !displayEndTime) {
      Alert.alert("Error", "Harap isi semua field yang wajib diisi.");
      return;
    }

    try {
      const payload = {
        sellerProfileId,
        name,
        description,
        imageUrl,
        originalPrice: parseFloat(originalPrice),
        discountedPrice: parseFloat(discountedPrice),
        quantityAvailable: parseInt(quantityAvailable, 10),
        displayStartTime,
        displayEndTime,
        status,
      };
      console.log("Update Bag Request Payload:", payload);
      await updateBag(bag.id, payload);
      Alert.alert("Sukses", "Surprise Bag berhasil diperbarui!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Failed to update menu item:", error);
      Alert.alert("Error", error.response?.data?.message || "Terjadi kesalahan saat memperbarui Surprise Bag.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
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

            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              placeholder="http://example.com/image.jpg"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

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

            <View style={styles.priceRow}>
              <View style={styles.priceInputContainer}>
                <Text style={styles.label}>Tersedia Dari (Jam)</Text>
                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => setStartTimePickerVisible(true)}
                >
                  <Text style={displayStartTime ? styles.timeText : styles.placeholderText}>
                    {displayStartTime ? displayStartTime.slice(11, 16) : "Pilih Jam"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.priceInputContainer}>
                <Text style={styles.label}>Tersedia Sampai (Jam)</Text>
                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => setEndTimePickerVisible(true)}
                >
                  <Text style={displayEndTime ? styles.timeText : styles.placeholderText}>
                    {displayEndTime ? displayEndTime.slice(11, 16) : "Pilih Jam"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TimerPickerModal
              visible={isStartTimePickerVisible}
              setIsVisible={setStartTimePickerVisible}
              onConfirm={(pickedDuration) => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(pickedDuration.hours).padStart(2, '0');
                const minutes = String(pickedDuration.minutes).padStart(2, '0');
                const seconds = String(pickedDuration.seconds).padStart(2, '0');
                setDisplayStartTime(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
                setStartTimePickerVisible(false);
              }}
              modalTitle="Pilih Jam Mulai"
              onCancel={() => setStartTimePickerVisible(false)}
              closeOnOverlayPress
            />

            <TimerPickerModal
              visible={isEndTimePickerVisible}
              setIsVisible={setEndTimePickerVisible}
              onConfirm={(pickedDuration) => {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(pickedDuration.hours).padStart(2, '0');
                const minutes = String(pickedDuration.minutes).padStart(2, '0');
                const seconds = String(pickedDuration.seconds).padStart(2, '0');
                setDisplayEndTime(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
                setEndTimePickerVisible(false);
              }}
              modalTitle="Pilih Jam Selesai"
              onCancel={() => setEndTimePickerVisible(false)}
              closeOnOverlayPress
            />

            <Text style={styles.label}>Kuantitas</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              value={quantityAvailable}
              onChangeText={setQuantityAvailable}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={status}
                onValueChange={(itemValue) => setStatus(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Available" value="AVAILABLE" />
                <Picker.Item label="Sold Out" value="SOLD_OUT" />
                <Picker.Item label="Not Available" value="NOT_AVAILABLE" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginHorizontal: -5,
  },
  priceInputContainer: {
    flex: 1,
    marginHorizontal: 5,
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
  pickerContainer: {
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 50,
    backgroundColor: "#f7f7f7",
  },
  timeInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
});

export default EditBagScreen;
