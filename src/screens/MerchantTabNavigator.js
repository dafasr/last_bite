import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MerchantHomeScreen from "./MerchantHomeScreen";
import ListScreen from "./ListScreen";
import MenuScreen from "./MenuScreen";
import { Text } from "react-native";
import { useOrders } from "../hooks";

const Tab = createBottomTabNavigator();

// Placeholder screens for the other tabs
const PlaceholderScreen = ({ route }) => <Text>{route.name}</Text>;

const MerchantTabNavigator = () => {
  const {
    orders,
    handleAcceptOrder,
    handleRejectOrder,
    handleUpdateOrderStatus,
  } = useOrders();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#2ECC71",
        tabBarInactiveTintColor: "#7F8C8D",
        tabBarStyle: { backgroundColor: "#FFFFFF" },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home">
        {(props) => (
          <MerchantHomeScreen
            {...props}
            incomingOrders={orders.filter((o) => o.status === "New")}
            onAccept={handleAcceptOrder}
            onReject={handleRejectOrder}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="List">
        {(props) => (
          <ListScreen
            {...props}
            acceptedOrders={orders.filter(
              (o) => o.status === "Preparing" || o.status === "Ready for Pickup"
            )}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
};

export default MerchantTabNavigator;
