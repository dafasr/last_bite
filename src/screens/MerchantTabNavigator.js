import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MerchantHomeScreen from './MerchantHomeScreen';
// import ListScreen from './ListScreen'; // Placeholder
// import MenuScreen from './MenuScreen'; // Placeholder
// import ProfileScreen from './ProfileScreen'; // Placeholder
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

// Placeholder screens for the other tabs
const PlaceholderScreen = ({ route }) => <Text>{route.name}</Text>;

const MerchantTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2ECC71',
        tabBarInactiveTintColor: '#7F8C8D',
        tabBarStyle: { backgroundColor: '#FFFFFF' },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={MerchantHomeScreen} />
      <Tab.Screen name="List" component={PlaceholderScreen} />
      <Tab.Screen name="Menu" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
};

export default MerchantTabNavigator;
