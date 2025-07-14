import React from 'react';

jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = require('react-native');
  return ({ name }) => <Text>{name}</Text>;
});

jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  ReactNative.UIManager = ReactNative.UIManager || {};
  ReactNative.UIManager.measureLayout = jest.fn((node, relativeToNativeNode, onFail, onSuccess) => {
    onSuccess(0, 0, 100, 100); // Mock a successful measurement
  });
  ReactNative.findNodeHandle = jest.fn(() => 1); // Mock a valid node handle
  ReactNative.NativeModules = {
    ...ReactNative.NativeModules,
  };
  ReactNative.Alert = {
    alert: jest.fn(),
  };
  return ReactNative;
});