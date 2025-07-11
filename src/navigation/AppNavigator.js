import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MerchantTabNavigator from '../screens/MerchantTabNavigator';
import DetailNavigator from './DetailNavigator';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SuccessScreen from '../screens/SuccessScreen';
import { useAuthContext } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import WithdrawalHistoryScreen from '../screens/WithdrawalHistoryScreen';

const RootStack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="MainTabs" component={MerchantTabNavigator} />
      ) : (
        <>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
      <RootStack.Screen name="Success" component={SuccessScreen} />
      <RootStack.Screen name="DetailNavigator" component={DetailNavigator} />
      
    </RootStack.Navigator>
  );
};

export default AppNavigator;
