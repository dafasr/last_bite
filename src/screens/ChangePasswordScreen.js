import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import apiClient from "../api/apiClient"; // Assuming apiClient is accessible

const ChangePasswordScreen = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmitChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Semua kolom harus diisi.",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Kata sandi baru dan konfirmasi kata sandi tidak cocok.",
      });
      return;
    }

    // Custom password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPasswordError(
        "Kata sandi harus minimal 8 karakter, mengandung setidaknya satu huruf besar, satu huruf kecil, dan satu angka."
      );
      return;
    }

    setPasswordError(""); // Clear any previous password errors

    try {
      await apiClient.put("/users/me/password", {
        oldPassword,
        newPassword,
        confirmNewPassword,
      });
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Sukses",
        textBody: "Kata sandi berhasil diubah.",
      });
      navigation.goBack(); // Go back to the previous screen (ProfileScreen)
    } catch (err) {
      console.error("Gagal mengubah kata sandi:", err);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody:
          err.response?.data?.message ||
          "Gagal mengubah kata sandi. Silakan coba lagi.",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ubah Kata Sandi</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Kata Sandi Lama</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan kata sandi lama"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />

          <Text style={styles.label}>Kata Sandi Baru</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan kata sandi baru"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          <Text style={styles.label}>Konfirmasi Kata Sandi Baru</Text>
          <TextInput
            style={styles.input}
            placeholder="Konfirmasi Kata Sandi Baru"
            secureTextEntry
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitChangePassword}
          >
            <Text style={styles.submitButtonText}>Ubah Kata Sandi</Text>
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
    flexGrow: 1,
    paddingBottom: 20,
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
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#2ECC71",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
  },
});

export default ChangePasswordScreen;
