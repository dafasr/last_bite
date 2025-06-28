import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MerchantHomeScreen from "./MerchantHomeScreen";
import ListScreen from "./ListScreen";
// import MenuScreen from './MenuScreen'; // Placeholder
// import ProfileScreen from './ProfileScreen'; // Placeholder
import { Text } from "react-native";

const Tab = createBottomTabNavigator();

// Mock data dipindahkan ke sini untuk menjadi sumber data terpusat
const mockOrdersData = [
  {
    id: "1",
    customerName: "John Doe",
    items: "Surprise Bag x1",
    price: "50,000",
    status: "New",
  },
  {
    id: "2",
    customerName: "Jane Smith",
    items: "Pastry Box x2",
    price: "80,000",
    status: "New",
  },
  {
    id: "3",
    customerName: "Alex Johnson",
    items: "Surprise Bag x1",
    price: "50,000",
    status: "Preparing",
  },
  {
    id: "4",
    customerName: "Emily White",
    items: "Meal Box x1",
    price: "65,000",
    status: "Ready for Pickup",
  },
  {
    id: "5",
    customerName: "Chris Brown",
    items: "Surprise Bag x3",
    price: "150,000",
    status: "New",
  },
];

// Placeholder screens for the other tabs
const PlaceholderScreen = ({ route }) => <Text>{route.name}</Text>;

const MerchantTabNavigator = () => {
  const [orders, setOrders] = useState(mockOrdersData);

  const handleAcceptOrder = (orderId) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: "Preparing" } : order
      )
    );
  };

  const handleRejectOrder = (orderId) => {
    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId)
    );
  };

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
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Menu" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
};

export default MerchantTabNavigator;
