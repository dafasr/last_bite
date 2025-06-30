import React, { useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MerchantHomeScreen from "./MerchantHomeScreen";
import ListScreen from "./ListScreen";
import MenuScreen from "./MenuScreen";
import ProfileScreen from "./ProfileScreen";
import { useOrders, useToast } from "../hooks";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "../components/Toast";

const Tab = createBottomTabNavigator();

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
        // Menambahkan catatan pada pesanan dengan id '1' (tanpa melihat status)
        if (order.id === "1") {
          return {
            ...order,
            note: "Tolong rotinya yang baru matang ya, terima kasih!",
          };
        }
        // Menambahkan catatan pada pesanan dengan id '3' (tanpa melihat status)
        if (order.id === "3") {
          return { ...order, note: "Jangan pakai bawang, alergi." };
        }
        return order;
      }),
    [orders]
  );

  const handleRejectWithToast = (orderId) => {
    handleRejectOrder(orderId);
    showToast("Pesanan berhasil ditolak", "success");
  };

  return (
    <>
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
        <Tab.Screen name="Menu" component={MenuScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      {toast.visible && (
        <Toast message={toast.message} type={toast.type} onHide={hideToast} />
      )}
    </>
  );
};

export default MerchantTabNavigator;
