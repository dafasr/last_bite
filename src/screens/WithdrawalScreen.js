import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Animated,
  Easing,
} from "react-native";
import { Picker } from '@react-native-picker/picker';

import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import apiClient from "../api/apiClient";

// --- THEME CONSTANTS ---
const COLORS = {
  primary: "#27AE60", // Green
  secondary: "#3498DB", // Blue
  danger: "#E74C3C", // Red
  warning: "#F39C12", // Yellow
  white: "#FFFFFF",
  black: "#000000",
  lightGray: "#F8F9FA",
  lightGray2: "#ECF0F1",
  gray: "#BDC3C7",
  darkGray: "#7F8C8D",
  title: "#2C3E50",
  text: "#2C3E50",
  background: "#F8F9FA",
  card: "#FFFFFF",
  priceBg: "#E8F5E8",
  paymentBg: "#EBF3FD",
  noteBg: "#FFF9E6",
};

const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 20,
  h1: 28,
  h2: 22,
  h3: 18,
  h4: 16,
  body2: 14,
  body3: 12,
  body4: 11,
};

const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: "800" },
  h2: { fontSize: SIZES.h2, fontWeight: "700" },
  h3: { fontSize: SIZES.h3, fontWeight: "700" },
  h4: { fontSize: SIZES.h4, fontWeight: "700" },
  body2: { fontSize: SIZES.body2, fontWeight: "500" },
  body3: { fontSize: SIZES.body3, fontWeight: "700" },
  body4: { fontSize: SIZES.body4, fontWeight: "500" },
  cardLabel: {
    fontSize: SIZES.body2,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
};

const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  dark: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Animation Hook
const useAnimation = (initialValue = 0) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animate = useCallback(
    (toValue, duration = 300, easing = Easing.out(Easing.quad)) => {
      Animated.timing(animatedValue, {
        toValue,
        duration,
        easing,
        useNativeDriver: true,
      }).start();
    },
    [animatedValue]
  );

  return [animatedValue, animate];
};

// Animated Components
const AnimatedCard = ({ children, delay = 0, style }) => {
  const [scaleAnim] = useAnimation(0.95);
  const [opacityAnim] = useAnimation(0);
  const [translateYAnim] = useAnimation(20);

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const AnimatedButton = ({ onPress, style, children, ...props }) => {
  const [scaleAnim] = useAnimation(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={1}
      {...props}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

const PulseAnimation = ({ children, style }) => {
  const [pulseAnim] = useAnimation(1);

  useEffect(() => {
    const startPulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => startPulse());
    };

    startPulse();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const WithdrawalScreen = ({ navigation }) => {
  const [amount, setAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [amountError, setAmountError] = useState("");
  const [bankNameError, setBankNameError] = useState("");
  const [accountNumberError, setAccountNumberError] = useState("");

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleAmountChange = (text) => {
    const cleanedText = text.replace(/[^0-9]/g, "");
    const numericValue = parseInt(cleanedText, 10);

    if (!isNaN(numericValue) && cleanedText !== "") {
      setDisplayAmount("Rp " + numericValue.toLocaleString("id-ID"));
      setAmount(cleanedText);
      setAmountError(""); // Clear error when input changes
    } else {
      setDisplayAmount("");
      setAmount("");
      setAmountError("Jumlah penarikan harus diisi."); // Set error if empty
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
    // Clear previous errors
    setAmountError("");
    setBankNameError("");
    setAccountNumberError("");

    let hasError = false;

    if (!amount) {
      setAmountError("Jumlah penarikan harus diisi.");
      hasError = true;
    }
    if (!bankName) {
      setBankNameError("Nama bank harus diisi.");
      hasError = true;
    }
    if (!accountNumber) {
      setAccountNumberError("Nomor rekening harus diisi.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // Basic validation for amount to be a number and positive
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setAmountError("Jumlah penarikan harus angka positif.");
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
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <AnimatedCard style={styles.formContainer}>
              {loadingBalance ? (
                <Text style={styles.balanceText}>Loading balance...</Text>
              ) : (
                <Text style={styles.balanceText}>
                  Saldo Anda: Rp {availableBalance.toLocaleString("id-ID")}
                </Text>
              )}
              <Text style={styles.label}>Jumlah Penarikan</Text>
              <TextInput
                style={[styles.input, amountError ? styles.inputError : null]}
                placeholder="Masukkan jumlah penarikan"
                keyboardType="numeric"
                value={displayAmount}
                onChangeText={handleAmountChange}
              />
              {amountError ? (
                <Text style={styles.errorText}>{amountError}</Text>
              ) : null}

              <Text style={styles.label}>Nama Bank</Text>
              <View style={[styles.pickerContainer, bankNameError ? styles.inputError : null]}>
                <Picker
                  selectedValue={bankName}
                  onValueChange={(itemValue) => {
                    setBankName(itemValue);
                    setBankNameError("");
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Pilih Bank" value="" />
                  <Picker.Item label="Mandiri" value="Mandiri" />
                  <Picker.Item label="BCA" value="BCA" />
                  <Picker.Item label="BRI" value="BRI" />
                  <Picker.Item label="OCBC" value="OCBC" />
                  <Picker.Item label="Maybank" value="Maybank" />
                </Picker>
              </View>
              {bankNameError ? (
                <Text style={styles.errorText}>{bankNameError}</Text>
              ) : null}

              <Text style={styles.label}>Nomor Rekening</Text>
              <TextInput
                style={[
                  styles.input,
                  accountNumberError ? styles.inputError : null,
                ]}
                placeholder="Masukkan nomor rekening"
                keyboardType="numeric"
                value={accountNumber}
                onChangeText={(text) => {
                  setAccountNumber(text);
                  setAccountNumberError("");
                }}
              />
              {accountNumberError ? (
                <Text style={styles.errorText}>{accountNumberError}</Text>
              ) : null}

              <AnimatedButton
                style={styles.submitButton}
                onPress={handleSubmitWithdrawal}
              >
                <Text style={styles.submitButtonText}>Ajukan Penarikan</Text>
              </AnimatedButton>

              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => navigation.navigate('WithdrawalHistory')}
              >
                <Text style={styles.historyButtonText}>Riwayat Penarikan</Text>
              </TouchableOpacity>
            </AnimatedCard>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // --- Base ---
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingBottom: SIZES.padding,
  },

  // --- Form Container ---
  formContainer: {
    backgroundColor: COLORS.card,
    margin: SIZES.padding,
    padding: SIZES.padding,
    borderRadius: SIZES.radius * 2,
    ...SHADOWS.dark,
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  label: {
    ...FONTS.body2,
    color: COLORS.darkGray,
    marginBottom: SIZES.base,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray2,
    borderRadius: SIZES.radius,
    padding: SIZES.base * 2,
    marginBottom: SIZES.padding,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: "center",
    marginTop: SIZES.padding,
    ...SHADOWS.medium,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    elevation: 6,
  },
  submitButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
    fontWeight: "700",
  },
  balanceText: {
    ...FONTS.h3,
    color: COLORS.primary,
    marginBottom: SIZES.padding * 1.5,
    textAlign: "center",
    fontWeight: "800",
  },
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.body4,
    marginBottom: SIZES.base,
    marginTop: -SIZES.base,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  historyButton: {
    marginTop: SIZES.padding,
    paddingVertical: SIZES.padding,
    alignItems: "center",
  },
  historyButtonText: {
    ...FONTS.body2,
    color: COLORS.secondary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  });

export default WithdrawalScreen;
