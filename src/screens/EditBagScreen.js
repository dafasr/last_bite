import React, { useState, useEffect } from "react";
import { useImagePicker, useTimePicker } from "../hooks";
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
import { useMenu } from "../context/MenuContext";
import { useAuthContext } from "../context/AuthContext";
import apiClient, { uploadImage } from "../api/apiClient";
import { Picker } from "@react-native-picker/picker";
import { TimerPickerModal } from "react-native-timer-picker";

const EditBagScreen = ({ navigation, route }) => {
  const { bag } = route.params;
  const { updateBag } = useMenu();
  const { sellerProfileId } = useAuthContext();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { image, pickImage, setImage } = useImagePicker();
  const [imageUrl, setImageUrl] = useState(""); // For existing image URL
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountedPrice, setDiscountedPrice] = useState("");
  const [quantityAvailable, setQuantityAvailable] = useState("");

  const {
    displayTime: displayStartTime,
    setPickerVisible: setStartTimePickerVisible,
    isPickerVisible: isStartTimePickerVisible,
    handleConfirm: handleConfirmStartTime,
    initialHours: initialStartHours,
    initialMinutes: initialStartMinutes,
    initialSeconds: initialStartSeconds,
    setDisplayTime: setDisplayStartTime,
  } = useTimePicker();
  const {
    displayTime: displayEndTime,
    setPickerVisible: setEndTimePickerVisible,
    isPickerVisible: isEndTimePickerVisible,
    handleConfirm: handleConfirmEndTime,
    initialHours: initialEndHours,
    initialMinutes: initialEndMinutes,
    initialSeconds: initialEndSeconds,
    setDisplayTime: setDisplayEndTime,
  } = useTimePicker();
  const [loading, setLoading] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  // Populate form with initial data
  useEffect(() => {
    if (bag) {
      setName(bag.name || "");
      setDescription(bag.description || "");
      setImageUrl(bag.imageUrl || "");
      setOriginalPrice(String(bag.originalPrice || ""));
      setDiscountedPrice(String(bag.discountedPrice || ""));
      setQuantityAvailable(String(bag.quantityAvailable || ""));
      setDisplayStartTime(bag.displayStartTime || "");
      setDisplayEndTime(bag.displayEndTime || "");
    }
  }, [bag, setDisplayStartTime, setDisplayEndTime]);

  // Check for changes to enable/disable the save button
  useEffect(() => {
    if (!bag) return;

    const hasChanged =
      bag.name !== name ||
      bag.description !== description ||
      String(bag.originalPrice) !== originalPrice ||
      String(bag.discountedPrice) !== discountedPrice ||
      String(bag.quantityAvailable) !== quantityAvailable ||
      bag.displayStartTime !== displayStartTime ||
      bag.displayEndTime !== displayEndTime ||
      image !== null || // A new image has been selected
      (image === null && bag.imageUrl !== imageUrl); // Image was removed

    setIsChanged(hasChanged);
  }, [
    name,
    description,
    originalPrice,
    discountedPrice,
    quantityAvailable,
    displayStartTime,
    displayEndTime,

    image,
    bag,
  ]);

  

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);

    try {
      let finalImageUrl = imageUrl;

      // Step 1 (Conditional): If a new image is selected, upload it
      if (image) {
        const imageFormData = new FormData();
        imageFormData.append("file", {
          uri: image.uri,
          type: image.mimeType,
          name: image.fileName,
        });

        const imageResponse = await uploadImage(imageFormData);
        finalImageUrl = imageResponse.data.url;

        if (!finalImageUrl) {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: "Error",
            textBody: "Gagal mengunggah gambar. URL tidak ditemukan.",
            button: "Tutup",
          });
          setLoading(false);
          return;
        }
      } else if (bag.imageUrl && !imageUrl) {
        // If image was removed (imageUrl is empty but bag.imageUrl existed)
        finalImageUrl = "";
      }

      // Step 2: Prepare payload and update the menu item
      const payload = {
        sellerProfileId,
        name,
        description,
        imageUrl: finalImageUrl,
        originalPrice: parseFloat(originalPrice),
        discountedPrice: parseFloat(discountedPrice),
        quantityAvailable: parseInt(quantityAvailable, 10),
        displayStartTime,
        displayEndTime,
      };

      const responseUpdate = await updateBag(bag.id, payload);
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Sukses",
        textBody: "Menu berhasil diperbarui!",
        button: "OK",
        onPressButton: () => {
          Dialog.hide();
          navigation.navigate("MenuList");
        },
      });
    } catch (error) {
      console.error("Failed to update menu item:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody:
          error.response?.data?.message ||
          "Terjadi kesalahan saat memperbarui Menu.",
        button: "Tutup",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Menu</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Nama Menu</Text>
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
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={pickImage}
          >
            <Text style={styles.outlineButtonText}>Pilih Foto Baru</Text>
          </TouchableOpacity>
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: image ? image.uri : imageUrl }}
              style={styles.imagePreview}
            />
          </View>

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
                    displayStartTime ? styles.timeText : styles.placeholderText
                  }
                >
                  {displayStartTime
                    ? displayStartTime.slice(11, 16)
                    : "Pilih Jam"}
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
                  {displayEndTime ? displayEndTime.slice(11, 16) : "Pilih Jam"}
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

          <TouchableOpacity
            style={[
              styles.button,
              (!isChanged || loading) && styles.buttonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isChanged || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Simpan Perubahan</Text>
            )}
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
  container: {
    flex: 1,
    marginBottom: 100,
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
    paddingBottom: 20, // Added padding to lift content
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

export default EditBagScreen;
