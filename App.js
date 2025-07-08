import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import SuccessScreen from "./src/screens/SuccessScreen";
import MerchantTabNavigator from "./src/screens/MerchantTabNavigator";
import { AuthProvider, useAuthContext } from "./src/context/AuthContext";
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { ActivityIndicator, View } from "react-native";

const Stack = createStackNavigator();

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen
            name="MerchantHome"
            component={MerchantTabNavigator}
          />
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            />
          </>
        )}
        <Stack.Screen
          name="Success"
          component={SuccessScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AlertNotificationRoot>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </AlertNotificationRoot>
  );
}
