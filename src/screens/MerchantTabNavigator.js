import React, { useMemo, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import MerchantHomeScreen from "./MerchantHomeScreen";
import ListScreen from "./ListScreen";
import MenuScreen from "./MenuScreen";
import AddBagScreen from "./AddBagScreen";
import EditBagScreen from "./EditBagScreen";
import EditStoreScreen from "./EditStoreScreen";
import ProfileScreen from "./ProfileScreen";
import ChangePasswordScreen from "./ChangePasswordScreen";
import EditUserInformationScreen from "./EditUserInformationScreen";
import { MenuProvider } from "../context/MenuContext";
import { useOrders } from "../hooks";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, BackHandler } from "react-native";

const Tab = createBottomTabNavigator();
const MenuStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const MerchantTabNavigator = () => {
  const {
    orders,
    handleAcceptOrder: originalHandleAcceptOrder,
    handleRejectOrder: originalHandleRejectOrder,
    handleUpdateOrderStatus: originalHandleUpdateOrderStatus,
  } = useOrders();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const backAction = () => {
      return true; // Menunjukkan bahwa event sudah ditangani
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    await originalHandleAcceptOrder(orderId);
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: "Sukses",
      textBody: "Pesanan berhasil diterima!",
      button: "Tutup",
    });
  };

  const handleRejectOrder = async (orderId) => {
    await originalHandleRejectOrder(orderId);
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: "Sukses",
      textBody: "Pesanan berhasil ditolak!",
      button: "Tutup",
    });
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    await originalHandleUpdateOrderStatus(orderId, newStatus);
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: "Sukses",
      textBody: `Status pesanan berhasil diperbarui menjadi ${newStatus}!`,
      button: "Tutup",
    });
  };

  // MOCKUP: Menambahkan data 'note' ke dalam pesanan untuk keperluan demonstrasi.
  // Di aplikasi nyata, data ini seharusnya datang langsung dari API/useOrders.
  const ordersWithNotes = useMemo(
    () =>
      orders.map((order) => {
        const newOrder = { ...order };

        // Simulasi data item yang lebih kompleks untuk demonstrasi
        // Di aplikasi nyata, struktur ini seharusnya datang dari API
        if (order.id === "1") {
          newOrder.items = [
            { name: "Paket Roti Spesial", quantity: 1 },
            { name: "Kue Coklat", quantity: 2 },
          ];
          newOrder.note = "Tolong rotinya yang baru matang ya, terima kasih!";
        } else if (order.id === "2") {
          newOrder.items = [{ name: "Kue Keju", quantity: 2 }];
        } else if (order.id === "3") {
          newOrder.items = [
            { name: "Donat Gula", quantity: 3 },
            { name: "Roti Sisir Mentega", quantity: 1 },
          ];
          newOrder.note = "Jangan pakai bawang, alergi.";
        } else {
          // Fallback untuk pesanan lain, mengubah string menjadi struktur array.
          // Menggunakan regex untuk menangani format "1x Item" atau "1xItem" secara robust.
          const itemString = order.items;
          const match = itemString.match(/^(\d+)\s*x\s*(.*)$/);

          if (match) {
            // Format "Kuantitas x Nama" ditemukan
            newOrder.items = [
              {
                quantity: parseInt(match[1], 10),
                name: match[2],
              },
            ];
          } else {
            // Jika format tidak cocok (misal: hanya "Kue Coklat"), anggap kuantitas adalah 1
            newOrder.items = [{ name: itemString, quantity: 1 }];
          }
        }
        return newOrder;
      }),
    [orders]
  );

  const soldBagsCount = useMemo(
    () => orders.filter((o) => o.status === "Completed").length,
    [orders]
  );

  return (
    <MenuProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Dasbor") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Pesanan") {
              iconName = focused ? "list" : "list-outline";
            } else if (route.name === "Menu") {
              iconName = focused ? "restaurant" : "restaurant-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#2ECC71", // Vibrant green for active tabs
          tabBarInactiveTintColor: "#7F8C8D", // Muted grey for inactive tabs
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 0,
            elevation: 15, // Increased elevation for a more pronounced shadow
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -5 }, // Shadow pointing upwards
            shadowOpacity: 0.1,
            shadowRadius: 10,
            height: 70 + insets.bottom, // Slightly taller tab bar
            paddingBottom: 10 + insets.bottom, // More padding at the bottom
            paddingTop: 10, // More padding at the top
            borderTopLeftRadius: 20, // Rounded top corners
            borderTopRightRadius: 20,
            position: "absolute", // Position absolutely to allow rounded corners
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarLabelStyle: { fontSize: 13, fontWeight: "700", marginTop: 2 }, // Slightly larger and bolder labels
          tabBarItemStyle: { marginVertical: 5 },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Dasbor">
          {(props) => (
            <MerchantHomeScreen
              {...props}
              incomingOrders={ordersWithNotes.filter((o) => o.status === "New")}
              onAccept={handleAcceptOrder}
              onReject={handleRejectOrder}
              soldBagsCount={soldBagsCount}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Pesanan">
          {(props) => (
            <ListScreen
              {...props}
              orders={ordersWithNotes.filter((o) =>
                [
                  "Preparing",
                  "Ready for Pickup",
                  "Completed",
                  "Rejected",
                ].includes(o.status)
              )}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Menu">
          {() => (
            <MenuStack.Navigator screenOptions={{ headerShown: false }}>
              <MenuStack.Screen name="MenuList" component={MenuScreen} />
              <MenuStack.Screen name="AddBag" component={AddBagScreen} />
              <MenuStack.Screen name="EditBag" component={EditBagScreen} />
            </MenuStack.Navigator>
          )}
        </Tab.Screen>
        <Tab.Screen name="Profile">
          {() => (
            <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
              <ProfileStack.Screen
                name="ProfileScreen"
                component={ProfileScreen}
              />
              <ProfileStack.Screen
                name="EditStore"
                component={EditStoreScreen}
              />
              <ProfileStack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
              />
              <ProfileStack.Screen
                name="EditUserInformation"
                component={EditUserInformationScreen}
              />
            </ProfileStack.Navigator>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </MenuProvider>
  );
};

export default MerchantTabNavigator;
