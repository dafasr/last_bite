import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { useAuthContext } from "../context/AuthContext";
import apiClient, { uploadImage } from "../api/apiClient";
import { Picker } from "@react-native-picker/picker";
import { TimerPickerModal } from "react-native-timer-picker";
import { useImagePicker, useTimePicker } from "../hooks";

const AddBagScreen = ({ navigation }) => {
  const { sellerProfileId } = useAuthContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [quantityAvailable, setQuantityAvailable] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [loading, setLoading] = useState(false);

  const { image, pickImage, setImage } = useImagePicker();
  const {
    displayTime: displayStartTime,
    setPickerVisible: setStartTimePickerVisible,
    isPickerVisible: isStartTimePickerVisible,
    handleConfirm: handleConfirmStartTime,
    initialHours: initialStartHours,
    initialMinutes: initialStartMinutes,
    initialSeconds: initialStartSeconds,
  } = useTimePicker();
  const {
    displayTime: displayEndTime,
    setPickerVisible: setEndTimePickerVisible,
    isPickerVisible: isEndTimePickerVisible,
    handleConfirm: handleConfirmEndTime,
    initialHours: initialEndHours,
    initialMinutes: initialEndMinutes,
    initialSeconds: initialEndSeconds,
  } = useTimePicker();

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);

    if (!sellerProfileId) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Seller profile ID not found. Please log in again.",
        button: "Tutup",
      });
      setLoading(false);
      return;
    }

    if (
      !name ||
      !originalPrice ||
      !discountedPrice ||
      !quantityAvailable ||
      !displayStartTime ||
      !displayEndTime ||
      !image
    ) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Harap isi semua field yang wajib diisi dan pilih gambar.",
        button: "Tutup",
      });
      setLoading(false);
      return;
    }

    try {
      // Step 1: Upload image
      const imageFormData = new FormData();
      imageFormData.append("file", {
        uri: image.uri,
        type: image.mimeType,
        name: image.fileName,
      });

      const imageResponse = await uploadImage(imageFormData);
      const imageUrl = imageResponse.data.url;

      if (!imageUrl) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: "Gagal mengunggah gambar. URL tidak ditemukan.",
          button: "Tutup",
        });
        setLoading(false);
        return;
      }

      // Step 2: Create menu item with the returned image URL
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
        status: "AVAILABLE",
      };

      const response = await apiClient.post("/menu-items", payload);

      if (response.status === 201) {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Sukses",
          textBody: "Menu berhasil ditambahkan!",
          button: "OK",
          onPressButton: () => {
            Dialog.hide();
            navigation.goBack();
          },
        });
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: "Gagal menambahkan Menu. Silakan coba lagi.",
          button: "Tutup",
        });
      }
    } catch (error) {
      console.error("Failed to add menu item:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody:
          error.response?.data?.message ||
          "Terjadi kesalahan saat menambahkan Menu.",
        button: "Tutup",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView>
          {/* <View style={styles.header}>
            <Text style={styles.headerTitle}>Tambah Menu Baru</Text>
          </View> */}

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

            <Text style={styles.label}>Foto</Text>
            <TouchableOpacity style={styles.outlineButton} onPress={pickImage}>
              <Text style={styles.outlineButtonText}>Pilih Foto</Text>
            </TouchableOpacity>
            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.imagePreview}
                />
              </View>
            )}

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
                  <Text
                    style={
                      displayStartTime
                        ? styles.timeText
                        : styles.placeholderText
                    }
                  >
                    {displayStartTime || "Pilih Jam"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.priceInputContainer}>
                <Text style={styles.label}>Tersedia Sampai (Jam)</Text>
                <TouchableOpacity
                  style={styles.timeInput}
                  onPress={() => setEndTimePickerVisible(true)}
                >
                  <Text
                    style={
                      displayEndTime ? styles.timeText : styles.placeholderText
                    }
                  >
                    {displayEndTime || "Pilih Jam"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TimerPickerModal
              visible={isStartTimePickerVisible}
              setIsVisible={setStartTimePickerVisible}
              onConfirm={handleConfirmStartTime}
              modalTitle="Pilih Jam Mulai"
              onCancel={() => setStartTimePickerVisible(false)}
              closeOnOverlayPress
              initialHours={initialStartHours}
              initialMinutes={initialStartMinutes}
              initialSeconds={initialStartSeconds}
            />

            <TimerPickerModal
              visible={isEndTimePickerVisible}
              setIsVisible={setEndTimePickerVisible}
              onConfirm={handleConfirmEndTime}
              modalTitle="Pilih Jam Selesai"
              onCancel={() => setEndTimePickerVisible(false)}
              closeOnOverlayPress
              initialHours={initialEndHours}
              initialMinutes={initialEndMinutes}
              initialSeconds={initialEndSeconds}
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

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Simpan Menu</Text>
              )}
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
    marginBottom: 20,
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
  buttonDisabled: {
    backgroundColor: "#A5D6A7",
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
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

export default AddBagScreen;
