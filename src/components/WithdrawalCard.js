import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  background: "#F2F7FF",
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

const getStatusIcon = (status) => {
  switch (status) {
    case "APPROVED":
      return { name: "checkmark-circle", color: COLORS.primary };
    case "PENDING":
      return { name: "time", color: COLORS.secondary }; // Use secondary for blue
    case "REJECTED":
      return { name: "close-circle", color: COLORS.danger };
    default:
      return { name: "help-circle", color: COLORS.darkGray };
  }
};

const WithdrawalCard = ({ item, index }) => {
  const statusIcon = getStatusIcon(item.status);
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [item.id]); // Re-run animation if item ID changes (though unlikely for a static list)

  return (
    <Animated.View
      style={[
        styles.withdrawalCard,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Withdrawal ID: {item.id}</Text>
        <Ionicons
          name={statusIcon.name}
          size={24}
          color={statusIcon.color}
          style={styles.statusIcon}
        />
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="cash-outline" size={20} color={COLORS.primary} />
        <Text style={styles.cardText}>
          Rp {item.amount.toLocaleString("id-ID")}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="card-outline" size={20} color={COLORS.darkGray} />
        <Text style={styles.cardText}>
          ({item.bankName}) {item.accountNumber}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={20} color={COLORS.gray} />
        <Text style={styles.cardText}>
          {new Date(item.requestDate).toLocaleString()}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text
          style={[
            styles.statusText,
            {
              backgroundColor:
                item.status === "APPROVED"
                  ? "rgba(39, 174, 96, 0.15)"
                  : item.status === "PENDING"
                  ? "rgba(52, 152, 219, 0.15)"
                  : "rgba(231, 76, 60, 0.15)",
              color:
                item.status === "APPROVED"
                  ? COLORS.primary
                  : item.status === "PENDING"
                  ? COLORS.secondary
                  : COLORS.danger,
            },
          ]}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  withdrawalCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.padding * 1.2,
    marginBottom: SIZES.padding,
    borderLeftWidth: 4,
    borderLeftColor:
      item.status === "APPROVED"
        ? COLORS.primary
        : item.status === "PENDING"
        ? COLORS.secondary
        : COLORS.danger,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
    paddingBottom: SIZES.base,
  },
  cardTitle: {
    ...FONTS.body3,
    fontWeight: "600",
    color: COLORS.title,
  },
  statusIcon: {
    marginLeft: SIZES.base,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.base / 2,
  },
  cardText: {
    ...FONTS.body2,
    color: COLORS.text,
    marginLeft: SIZES.base,
    flex: 1,
  },
  statusContainer: {
    marginTop: SIZES.base,
    alignSelf: "flex-end",
  },
  statusText: {
    ...FONTS.body3,
    fontWeight: "700",
    paddingHorizontal: SIZES.base * 1.5,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.radius * 2,
    overflow: "hidden",
  },
});

export default WithdrawalCard;
