import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  RefreshControl,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { useMenu } from "../context/MenuContext"; // Pastikan path ini benar
import { getMenuItems } from "../api/apiClient"; // Pastikan path ini benar
import Ionicons from "react-native-vector-icons/Ionicons";

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

const MenuScreen = ({ navigation }) => {
  const { surpriseBags, setSurpriseBags, toggleAvailability, deleteBag } =
    useMenu();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const [fabVisible, setFabVisible] = useState(true);

  const fabAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fabAnimation, {
      toValue: fabVisible ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fabVisible]);

  const fabTranslateY = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Move button out of view
  });

  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMenuItems();
      setSurpriseBags(response.data.data);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Gagal mengambil item menu.",
        button: "Tutup",
      });
    } finally {
      setLoading(false);
    }
  }, [setSurpriseBags]);

  useFocusEffect(
    React.useCallback(() => {
      fetchMenuItems();
    }, [fetchMenuItems])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMenuItems();
    setRefreshing(false);
  }, [fetchMenuItems]);

  const handleEdit = (bag) => navigation.navigate("EditBag", { bag });

  const handleAddBag = () => navigation.navigate("AddBag");

  const handleDelete = (bagId, bagName) => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: "Hapus Menu",
      textBody: `Apakah Anda yakin ingin menghapus "${bagName}"? Tindakan ini tidak dapat dibatalkan.`,
      button: "Hapus",
      onPressButton: () => {
        deleteBag(bagId);
        Dialog.hide();
      },
      showCancelButton: true,
      cancelButton: "Batal",
    });
  };

  const renderItem = ({ item }) => (
    <AnimatedCard style={styles.bagItem}>
      <View>
        <Image
          style={styles.bagImage}
          source={{
            uri:
              item.imageUrl ||
              "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=500&q=80",
          }}
        />
        <View
          style={[
            styles.statusContainer,
            {
              backgroundColor:
                item.status === "AVAILABLE" ? "#2ECC71" : "rgba(0, 0, 0, 0.6)",
            },
          ]}
        >
          <Text style={styles.statusText}>{item.status.replace("_", " ")}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.originalPrice}>
            Rp {item.originalPrice.toLocaleString("id-ID")}
          </Text>
          <Text style={styles.discountedPrice}>
            Rp {item.discountedPrice.toLocaleString("id-ID")}
          </Text>
        </View>
      </View>
      <View style={styles.bagContent}>
        <Text style={styles.bagName}>{item.name}</Text>

        <View style={styles.orderItemsContainer}>
          <Text style={styles.orderItemsTitle}>📦 Kemungkinan isi:</Text>
          <Text style={styles.orderItemText}>{item.description}</Text>
        </View>

        <View style={styles.availabilityContainer}>
          <Text style={styles.availabilityLabel}>Waktu Tersedia:</Text>
          <Text style={styles.availabilityTime}>
            {item.displayStartTime
              ? item.displayStartTime.slice(11, 16)
              : "N/A"}{" "}
            s/d{" "}
            {item.displayEndTime ? item.displayEndTime.slice(11, 16) : "N/A"}
          </Text>
        </View>

        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Kuantitas:</Text>
          <Text style={styles.quantityText}>{item.quantityAvailable}</Text>
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
    </AnimatedCard>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AnimatedCard style={styles.header}>
          <Text style={styles.headerTitle}>Daftar Menu</Text>
          <View style={styles.headerUnderline} />
        </AnimatedCard>
        <FlatList
          data={surpriseBags}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            item.id != null ? String(item.id) : String(index)
          }
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <AnimatedCard delay={800} style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>Tidak ada menu</Text>
              <Text style={styles.emptySubtext}>
                Menu Anda akan muncul di sini
              </Text>
            </AnimatedCard>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            {
              useNativeDriver: false,
              listener: (event) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                if (
                  currentScrollY > lastScrollY.current &&
                  currentScrollY > 100
                ) {
                  if (fabVisible) setFabVisible(false);
                } else {
                  if (!fabVisible) setFabVisible(true);
                }
                lastScrollY.current = currentScrollY;
              },
            }
          )}
          scrollEventThrottle={16}
        />
      </View>
      <Animated.View
        style={[
          styles.addButton,
          {
            transform: [{ translateY: fabTranslateY }],
          },
        ]}
      >
        <TouchableOpacity onPress={handleAddBag}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  header: {
    paddingTop: 30,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.title,
    marginBottom: 8,
  },
  headerUnderline: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  listContainer: {
    padding: 10,
    flexGrow: 1,
    paddingBottom: 110,
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
  },
  bagItem: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    marginBottom: 10,
    ...SHADOWS.medium,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
    width: "48%",
  },
  bagImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
  },
  statusContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  bagContent: {
    padding: 12,
  },
  bagName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  orderItemsContainer: {
    marginBottom: 8,
    backgroundColor: "#F0F2F5",
    padding: 8,
    borderRadius: 6,
  },
  orderItemsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 6,
  },
  orderItemText: {
    fontSize: 12,
    color: "#2C3E50",
    fontWeight: "400",
    flex: 1,
  },
  priceContainer: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    flexDirection: "column",
    alignItems: "flex-end",
  },
  originalPrice: {
    fontSize: 12,
    color: "#FFFFFF",
    textDecorationLine: "line-through",
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  availabilityContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 6,
    backgroundColor: "#F0F2F5",
    padding: 6,
    borderRadius: 5,
  },
  availabilityLabel: {
    fontSize: 10,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  availabilityTime: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    backgroundColor: "#F0F2F5",
    padding: 6,
    borderRadius: 5,
  },
  quantityLabel: {
    fontSize: 10,
    color: "#7F8C8D",
    fontWeight: "500",
    marginRight: 4,
  },
  quantityText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 3,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#3498DB",
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#E74C3C",
  },
  addButton: {
    backgroundColor: "#2ECC71",
    position: "absolute",
    bottom: 120,
    right: 25,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.dark,
  },
});

export default MenuScreen;
