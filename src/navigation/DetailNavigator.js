import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import WithdrawalScreen from '../screens/WithdrawalScreen';
import AddBagScreen from '../screens/AddBagScreen';
import EditBagScreen from '../screens/EditBagScreen';
import EditStoreScreen from '../screens/EditStoreScreen';
import EditUserInformationScreen from '../screens/EditUserInformationScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ReviewListScreen from '../screens/ReviewListScreen';
import WithdrawalHistoryScreen from '../screens/WithdrawalHistoryScreen';

const DetailStack = createStackNavigator();

const DetailNavigator = () => {
  return (
    <DetailStack.Navigator screenOptions={{ headerShown: true }}>
      <DetailStack.Screen name="Withdrawal" component={WithdrawalScreen} options={{ title: 'Penarikan Dana' }} />
      <DetailStack.Screen name="WithdrawalHistory" component={WithdrawalHistoryScreen} options={{ title: 'Riwayat Penarikan' }} />
      <DetailStack.Screen name="AddBag" component={AddBagScreen} options={{ title: 'Tambah Menu' }} />
      <DetailStack.Screen name="EditBag" component={EditBagScreen} options={{ title: 'Edit Menu' }} />
      <DetailStack.Screen name="EditStore" component={EditStoreScreen} options={{ title: 'Edit Toko' }} />
      <DetailStack.Screen name="EditUserInformation" component={EditUserInformationScreen} options={{ title: 'Edit Informasi Pengguna' }} />
      <DetailStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Ubah Kata Sandi' }} />
      <DetailStack.Screen name="ReviewList" component={ReviewListScreen} options={{ title: 'Ulasan Menu' }} />
    </DetailStack.Navigator>
  );
};

export default DetailNavigator;
