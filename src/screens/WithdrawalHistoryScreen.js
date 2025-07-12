import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import apiClient from "../api/apiClient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// --- ENHANCED THEME CONSTANTS ---
const COLORS = {
  primary: "#27AE60", // Green
  primaryLight: "#2ECC71",
  primaryDark: "#229954",
  secondary: "#3498DB", // Blue
  secondaryLight: "#5DADE2",
  danger: "#E74C3C", // Red
  dangerLight: "#F1948A",
  warning: "#F39C12", // Yellow
  warningLight: "#F8C471",
  success: "#27AE60",
  successLight: "#58D68D",

  // Neutral Colors
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",

  // Gray Scale
  gray100: "#F8F9FA",
  gray200: "#E9ECEF",
  gray300: "#DEE2E6",
  gray400: "#CED4DA",
  gray500: "#ADB5BD",
  gray600: "#6C757D",
  gray700: "#495057",
  gray800: "#343A40",
  gray900: "#212529",

  // Semantic Colors
  background: "#F8FAFC",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E2E8F0",
  text: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  // Status Colors
  pendingBg: "rgba(36, 136, 251, 0.1)",
  pendingBorder: "rgba(36, 108, 251, 0.3)",
  completedBg: "rgba(34, 197, 94, 0.1)",
  completedBorder: "rgba(34, 197, 94, 0.3)",
  failedBg: "rgba(239, 68, 68, 0.1)",
  failedBorder: "rgba(239, 68, 68, 0.3)",

  // Gradient Colors
  gradientStart: "#667eea",
  gradientEnd: "#764ba2",

  // Special Effects
  shimmer: "#E2E8F0",
  overlay: "rgba(0, 0, 0, 0.5)",
};

const SIZES = {
  // Base sizes
  base: 8,
  padding: 16,
  margin: 16,
  radius: 12,

  // Typography
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body1: 16,
  body2: 14,
  body3: 12,
  caption: 10,

  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,

  // Component sizes
  buttonHeight: 48,
  inputHeight: 48,
  headerHeight: 60,
  tabHeight: 50,

  // Icon sizes
  iconXs: 12,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
};

const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: "800", lineHeight: SIZES.h1 * 1.2 },
  h2: { fontSize: SIZES.h2, fontWeight: "700", lineHeight: SIZES.h2 * 1.2 },
  h3: { fontSize: SIZES.h3, fontWeight: "600", lineHeight: SIZES.h3 * 1.2 },
  h4: { fontSize: SIZES.h4, fontWeight: "600", lineHeight: SIZES.h4 * 1.2 },
  body1: {
    fontSize: SIZES.body1,
    fontWeight: "400",
    lineHeight: SIZES.body1 * 1.5,
  },
  body2: {
    fontSize: SIZES.body2,
    fontWeight: "400",
    lineHeight: SIZES.body2 * 1.5,
  },
  body3: {
    fontSize: SIZES.body3,
    fontWeight: "400",
    lineHeight: SIZES.body3 * 1.5,
  },
  caption: {
    fontSize: SIZES.caption,
    fontWeight: "400",
    lineHeight: SIZES.caption * 1.4,
  },

  // Specialized fonts
  semiBold: { fontWeight: "600" },
  bold: { fontWeight: "700" },
  medium: { fontWeight: "500" },
};

const SHADOWS = {
  xs: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
};

const ANIMATIONS = {
  spring: {
    friction: 7,
    tension: 100,
    useNativeDriver: true,
  },
  timing: {
    duration: 300,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    useNativeDriver: true,
  },
  longTiming: {
    duration: 600,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    useNativeDriver: true,
  },
};

const WithdrawalHistoryScreen = ({ navigation }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // Shimmer animation
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start shimmer animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        ...ANIMATIONS.longTiming,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        ...ANIMATIONS.spring,
      }),
      Animated.timing(headerAnim, {
        toValue: 0,
        ...ANIMATIONS.timing,
      }),
    ]).start();
  }, []);

  const fetchWithdrawalHistory = useCallback(async (pageNumber = 1) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
      }
      const response = await apiClient.get("/withdrawals/mine", {
        params: { page: pageNumber, limit: 10 }, // Assuming a limit of 10 items per page
      });

      if (response.data && response.data.data) {
        if (pageNumber === 1) {
          setWithdrawals(response.data.data);
        } else {
          setWithdrawals((prevWithdrawals) => [
            ...prevWithdrawals,
            ...response.data.data,
          ]);
        }
        setHasMore(response.data.data.length > 0); // Assuming if data is empty, no more pages
      } else {
        if (pageNumber === 1) {
          setWithdrawals([]);
          Toast.show({
            type: ALERT_TYPE.WARNING,
            title: "Warning",
            textBody: "No withdrawal history found.",
          });
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody:
          error.response?.data?.message ||
          "Failed to fetch withdrawal history. Please try again later.",
      });
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawalHistory(1);
  }, [fetchWithdrawalHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchWithdrawalHistory(1);
  }, [fetchWithdrawalHistory]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
      fetchWithdrawalHistory(page + 1);
    }
  };

  

  const getStatusConfig = (status) => {
    switch (status) {
      case "APPROVED":
        return {
          icon: "checkmark-circle",
          color: COLORS.success,
          backgroundColor: COLORS.completedBg,
          borderColor: COLORS.completedBorder,
        };
      case "PENDING":
        return {
          icon: "time",
          color: COLORS.secondary,
          backgroundColor: COLORS.pendingBg,
          borderColor: COLORS.pendingBorder,
        };
      case "REJECTED":
        return {
          icon: "close-circle",
          color: COLORS.danger,
          backgroundColor: COLORS.failedBg,
          borderColor: COLORS.failedBorder,
        };
      default:
        return {
          icon: "help-circle",
          color: COLORS.textMuted,
          backgroundColor: COLORS.gray100,
          borderColor: COLORS.border,
        };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderShimmerCard = () => (
    <Animated.View
      style={[
        styles.withdrawalCard,
        {
          opacity: shimmerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.7],
          }),
        },
      ]}
    >
      <View style={styles.shimmerLine} />
      <View
        style={[styles.shimmerLine, { width: "60%", marginTop: SIZES.sm }]}
      />
      <View
        style={[styles.shimmerLine, { width: "80%", marginTop: SIZES.sm }]}
      />
      <View
        style={[styles.shimmerLine, { width: "40%", marginTop: SIZES.sm }]}
      />
    </Animated.View>
  );

  const WithdrawalItem = ({
    item,
    index,
    getStatusConfig,
    formatCurrency,
    formatDate,
  }) => {
    const statusConfig = getStatusConfig(item.status);
    const translateY = useRef(new Animated.Value(50)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.9)).current;

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
          Animated.spring(scale, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, []);

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (evt, gestureState) => {
        const newScale = 1 - Math.abs(gestureState.dx) / 1000;
        scale.setValue(Math.max(0.95, newScale));
      },
      onPanResponderRelease: () => {
        Animated.spring(scale, {
          toValue: 1,
          ...ANIMATIONS.spring,
        }).start();
      },
    });

    return (
      <Animated.View
        style={[
          styles.withdrawalCard,
          {
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.cardTitle}>#{item.id}</Text>
            <Text style={styles.cardSubtitle}>Withdrawal Request</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.backgroundColor },
            ]}
          >
            <Ionicons
              name={statusConfig.icon}
              size={SIZES.iconSm}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amountValue}>{formatCurrency(item.amount)}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="card-outline"
                size={SIZES.iconMd}
                color={COLORS.textSecondary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Bank Account</Text>
              <Text style={styles.detailValue}>
                {item.bankName} • {item.accountNumber}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="time-outline"
                size={SIZES.iconMd}
                color={COLORS.textSecondary}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Request Date</Text>
              <Text style={styles.detailValue}>
                {formatDate(item.requestDate)}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: statusConfig.borderColor },
          ]}
        />
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          transform: [{ translateY: headerAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={SIZES.iconLg} color={COLORS.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Withdrawal History</Text>
      <TouchableOpacity
        onPress={onRefresh}
        style={styles.refreshButton}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh" size={SIZES.iconLg} color={COLORS.text} />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmpty = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="receipt-outline" size={64} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Withdrawals Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your withdrawal history will appear here once you make your first
        withdrawal request.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate("Withdraw")}
        activeOpacity={0.8}
      >
        <Text style={styles.emptyButtonText}>Make a Withdrawal</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* {renderHeader()} */}

        {loading && withdrawals.length === 0 ? (
          <View style={styles.loadingContainer}>
            <FlatList
              data={[1, 2, 3, 4, 5]}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderShimmerCard}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          </View>
        ) : (
          <Animated.FlatList
            data={withdrawals}
            keyExtractor={(item, index) => item.id.toString() + index}
            renderItem={({ item, index }) => (
              <WithdrawalItem
                item={item}
                index={index}
                getStatusConfig={getStatusConfig}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
              />
            )}
            style={styles.flatList}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              loading && withdrawals.length > 0 ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
                progressBackgroundColor={COLORS.white}
              />
            }
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  backButton: {
    padding: SIZES.sm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.gray100,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    flex: 1,
    textAlign: "center",
  },
  refreshButton: {
    padding: SIZES.sm,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.gray100,
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    padding: SIZES.padding,
    paddingTop: SIZES.md,
  },
  loadingContainer: {
    flex: 1,
    padding: SIZES.padding,
  },
  withdrawalCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.5,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.md,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  cardSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radius,
    marginLeft: SIZES.sm,
  },
  statusText: {
    ...FONTS.body3,
    ...FONTS.semiBold,
    marginLeft: SIZES.xs,
  },
  amountContainer: {
    marginBottom: SIZES.md,
    padding: SIZES.md,
    backgroundColor: COLORS.gray100,
    borderRadius: SIZES.radius,
  },
  amountLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  amountValue: {
    ...FONTS.h3,
    ...FONTS.bold,
    color: COLORS.primary,
  },
  detailsContainer: {
    marginBottom: SIZES.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SIZES.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  detailValue: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  statusIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: SIZES.radius * 1.5,
    borderBottomLeftRadius: SIZES.radius * 1.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.lg,
  },
  emptyTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SIZES.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radius,
    ...SHADOWS.sm,
  },
  emptyButtonText: {
    ...FONTS.body2,
    ...FONTS.semiBold,
    color: COLORS.white,
  },
  shimmerLine: {
    height: 16,
    backgroundColor: COLORS.shimmer,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.sm,
  },
  loadingMoreContainer: {
    paddingVertical: SIZES.md,
    alignItems: "center",
  },
});

export default WithdrawalHistoryScreen;
