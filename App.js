import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { MenuProvider } from "./src/context/MenuContext";
import { AlertNotificationRoot } from 'react-native-alert-notification';

export default function App() {
  return (
    <AlertNotificationRoot>
      <AuthProvider>
        <MenuProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </MenuProvider>
      </AuthProvider>
    </AlertNotificationRoot>
  );
}
