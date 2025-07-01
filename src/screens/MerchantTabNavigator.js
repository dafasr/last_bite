import React, { useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import MerchantHomeScreen from "./MerchantHomeScreen";
import ListScreen from "./ListScreen";
import MenuScreen from "./MenuScreen";
import AddBagScreen from "./AddBagScreen";
import EditBagScreen from "./EditBagScreen";
import EditStoreScreen from "./EditStoreScreen";
import ProfileScreen from "./ProfileScreen";
import { MenuProvider } from "../context/MenuContext";
import { useOrders, useToast } from "../hooks";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "../components/Toast";

const Tab = createBottomTabNavigator();
const MenuStack = createStackNavigator();
const ProfileStack = createStackNavigator();

const MerchantTabNavigator = () => {
  const {
    orders,
    handleAcceptOrder,
    handleRejectOrder,
    handleUpdateOrderStatus,
  } = useOrders();
  const { toast, showToast, hideToast } = useToast();

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
          // Fallback untuk pesanan lain, mengubah string menjadi struktur array
          const parts = order.items.split("x ");
          newOrder.items = [
            {
              name: parts[1] || order.items,
              quantity: parseInt(parts[0]) || 1,
            },
          ];
        }
        return newOrder;
      }),
    [orders]
  );

  const soldBagsCount = useMemo(
    () => orders.filter((o) => o.status === "Completed").length,
    [orders]
  );

  const handleRejectWithToast = (orderId) => {
    handleRejectOrder(orderId);
    showToast("Pesanan berhasil ditolak", "success");
  };

  return (
    <MenuProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "List") {
              iconName = focused ? "list" : "list-outline";
            } else if (route.name === "Menu") {
              iconName = focused ? "restaurant" : "restaurant-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#2ECC71",
          tabBarInactiveTintColor: "#7F8C8D",
          tabBarStyle: { backgroundColor: "#FFFFFF" },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home">
          {(props) => (
            <MerchantHomeScreen
              {...props}
              incomingOrders={ordersWithNotes.filter((o) => o.status === "New")}
              onAccept={handleAcceptOrder}
              onReject={handleRejectWithToast}
              soldBagsCount={soldBagsCount}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="List">
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
            </ProfileStack.Navigator>
          )}
        </Tab.Screen>
      </Tab.Navigator>
      {toast.visible && (
        <Toast message={toast.message} type={toast.type} onHide={hideToast} />
      )}
    </MenuProvider>
  );
};

export default MerchantTabNavigator;
