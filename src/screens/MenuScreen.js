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
import { useMenu } from "../context/MenuContext";
import { getMenuItems } from "../api/apiClient";
import Ionicons from "react-native-vector-icons/Ionicons";

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

  // Placeholder untuk fungsi edit
  // Mengarahkan ke layar EditBag dan mengirimkan data 'bag' yang dipilih
  const handleEdit = (bag) => navigation.navigate("EditBag", { bag });

  // Placeholder untuk fungsi tambah
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
    <View style={styles.bagItem}>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Daftar Menu</Text>
        </View>
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
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>Tidak ada menu</Text>
              <Text style={styles.emptySubtext}>
                Menu Anda akan muncul di sini
              </Text>
            </View>
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
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1, overflow: "visible" },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5", // Match safe area background
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  listContainer: {
    padding: 10,
    flexGrow: 1,
    paddingBottom: 110, // Increased padding to clear the FAB and tab navigator
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
  },

  bagItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 4,
    overflow: "hidden",
    width: "48%",
  },
  bagImage: {
    width: "100%",
    height: 120, // Reduced height
    resizeMode: "cover",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
    padding: 12, // Reduced padding
  },
  bagName: {
    fontSize: 15, // Reduced font size
    fontWeight: "600",
    color: "#333",
    marginBottom: 8, // Added margin bottom for spacing
  },
  orderItemsContainer: {
    marginBottom: 8, // Reduced margin
    backgroundColor: "#F0F2F5",
    padding: 8, // Reduced padding
    borderRadius: 6,
  },
  orderItemsTitle: {
    fontSize: 13, // Reduced font size
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 6,
  },
  orderItemText: {
    fontSize: 12, // Reduced font size
    color: "#2C3E50",
    fontWeight: "400",
    flex: 1, // Allow text to wrap
  },
  orderItemPrice: {
    fontSize: 13, // Reduced font size
    color: "#7F8C8D",
    fontWeight: "600",
  },
  orderItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6, // Reduced padding
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
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
    fontSize: 12, // Reduced font size
    color: "#FFFFFF",
    textDecorationLine: "line-through",
  },
  discountedPrice: {
    fontSize: 16, // Reduced font size
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  availabilityContainer: {
    flexDirection: "column", // Change to column
    alignItems: "flex-start", // Align items to the start
    marginBottom: 6,
    backgroundColor: "#F0F2F5",
    padding: 6,
    borderRadius: 5,
  },
  availabilityLabel: {
    fontSize: 10,
    color: "#7F8C8D",
    fontWeight: "500",
    // marginRight: 4, // No longer needed
  },
  availabilityTime: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginTop: 2, // Add a small top margin for spacing
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6, // Reduced margin
    backgroundColor: "#F0F2F5",
    padding: 6, // Reduced padding
    borderRadius: 5,
  },
  quantityLabel: {
    fontSize: 10, // Reduced font size
    color: "#7F8C8D",
    fontWeight: "500",
    marginRight: 4,
  },
  quantityText: {
    fontSize: 11, // Reduced font size
    fontWeight: "600",
    color: "#333",
    flex: 1, // Allow text to wrap
  },
  statusInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // Reduced margin
    backgroundColor: "#F0F2F5",
    padding: 6, // Reduced padding
    borderRadius: 5,
  },
  statusInfoLabel: {
    fontSize: 10, // Reduced font size
    color: "#7F8C8D",
    fontWeight: "500",
    marginRight: 4,
  },
  statusInfoText: {
    fontSize: 11, // Reduced font size
    fontWeight: "600",
    color: "#333",
    flex: 1, // Allow text to wrap
  },

  buttonContainer: {
    flexDirection: "row",
    marginTop: 6, // Reduced margin
  },
  actionButton: {
    flex: 1,
    paddingVertical: 6, // Reduced padding
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
    fontSize: 12, // Reduced font size
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#3498DB",
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: "#E74C3C", // Red
  },
  addButton: {
    backgroundColor: "#2ECC71",
    position: "absolute",
    bottom: 120, // Adjust position to be clearly in the corner
    right: 25,
    width: 56, // Smaller width
    height: 56, // Smaller height
    borderRadius: 28, // half of width/height to make it a circle
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5, // Add some letter spacing
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
});

export default MenuScreen;
