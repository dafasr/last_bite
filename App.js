import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { MenuProvider } from "./src/context/MenuContext";
import { OrderProvider } from "./src/context/OrderContext";
import { AlertNotificationRoot } from 'react-native-alert-notification';

export default function App() {
  return (
    <AlertNotificationRoot>
      <AuthProvider>
        <MenuProvider>
          <OrderProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </OrderProvider>
        </MenuProvider>
      </AuthProvider>
    </AlertNotificationRoot>
  );
}
