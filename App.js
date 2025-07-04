import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";

import SuccessScreen from "./src/screens/SuccessScreen";
import MerchantTabNavigator from "./src/screens/MerchantTabNavigator";
import { AuthProvider } from "./src/context/AuthContext";

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RegisterMerchant"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          
          <Stack.Screen
            name="Success"
            component={SuccessScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MerchantHome"
            component={MerchantTabNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
