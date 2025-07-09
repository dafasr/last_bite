import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import apiClient from "../api/apiClient";

const WithdrawalScreen = ({ navigation }) => {
  const [amount, setAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleAmountChange = (text) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    const numericValue = parseInt(cleanedText, 10);

    if (!isNaN(numericValue) && cleanedText !== '') {
      setDisplayAmount('Rp ' + numericValue.toLocaleString('id-ID'));
      setAmount(cleanedText);
    } else {
      setDisplayAmount('');
      setAmount('');
    }
  };

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const sellerResponse = await apiClient.get("/sellers/me");
      if (sellerResponse.data?.data) {
        setAvailableBalance(sellerResponse.data.data.balance || 0);
      } else {
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: "Warning",
          textBody: "Could not retrieve balance data.",
        });
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Failed to fetch balance. Please try again later.",
      });
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const handleSubmitWithdrawal = async () => {
    if (!amount || !bankName || !accountNumber) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Semua kolom harus diisi.",
      });
      return;
    }

    // Basic validation for amount to be a number
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Jumlah penarikan harus angka positif.",
      });
      return;
    }

    try {
      await apiClient.post("/withdrawals", {
        amount: parseFloat(amount),
        bankName,
        accountNumber,
      });
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Sukses",
        textBody: "Permintaan penarikan berhasil diajukan.",
      });
      navigation.goBack(); // Go back after successful withdrawal
    } catch (err) {
      console.error("Gagal mengajukan penarikan:", err);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody:
          err.response?.data?.message ||
          "Gagal mengajukan penarikan. Silakan coba lagi.",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Penarikan Dana</Text>
          </View>

          <View style={styles.formContainer}>
            {loadingBalance ? (
              <Text style={styles.balanceText}>Loading balance...</Text>
            ) : (
              <Text style={styles.balanceText}>
                Saldo Anda: Rp {availableBalance.toLocaleString('id-ID')}
              </Text>
            )}
            <Text style={styles.label}>Jumlah Penarikan</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan jumlah penarikan"
              keyboardType="numeric"
              value={displayAmount}
              onChangeText={handleAmountChange}
            />

            <Text style={styles.label}>Nama Bank</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama bank"
              value={bankName}
              onChangeText={setBankName}
            />

            <Text style={styles.label}>Nomor Rekening</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nomor rekening"
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitWithdrawal}
            >
              <Text style={styles.submitButtonText}>Ajukan Penarikan</Text>
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
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default WithdrawalScreen;
