import React, { Component } from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react-native';
import { Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuthContext } from '../../src/context/AuthContext';
import { setLogoutHandler } from '../../src/api/apiClient';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

// Mock setLogoutHandler
jest.mock('../../src/api/apiClient', () => ({
  setLogoutHandler: jest.fn(),
}));

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return null; // Or a fallback UI
    }
    return this.props.children;
  }
}

const TestComponent = () => {
  const context = useAuthContext();
  return (
    <>
      <Text testID="isAuthenticated">{context.isAuthenticated ? 'true' : 'false'}</Text>
      <Text testID="isLoading">{context.isLoading ? 'true' : 'false'}</Text>
      <Text testID="sellerProfileId">{context.sellerProfileId}</Text>
      <Button testID="logout-button" onPress={context.logout} title="Logout" />
      <Button testID="update-profile-button" onPress={() => context.updateSellerProfileId('123')} title="Update Profile" />
      <Button testID="clear-profile-button" onPress={() => context.updateSellerProfileId(null)} title="Clear Profile" />
    </>
  );
};

describe('AuthContext', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with isAuthenticated false and isLoading true', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('isAuthenticated').props.children).toBe('false');
    expect(getByTestId('isLoading').props.children).toBe('true');

    await waitFor(() => {
      expect(getByTestId('isLoading').props.children).toBe('false');
    });
  });

  it('should set isAuthenticated and sellerProfileId from AsyncStorage on bootstrap', async () => {
    await AsyncStorage.setItem('userToken', 'some-token');
    await AsyncStorage.setItem('sellerProfileId', 'test-id');

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('isAuthenticated').props.children).toBe('true');
      expect(getByTestId('sellerProfileId').props.children).toBe('test-id');
      expect(getByTestId('isLoading').props.children).toBe('false');
    });
  });

  it('logout should clear AsyncStorage and update state', async () => {
    await AsyncStorage.setItem('userToken', 'some-token');
    await AsyncStorage.setItem('sellerProfileId', 'test-id');

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('isAuthenticated').props.children).toBe('true');
    });

    await act(async () => {
      fireEvent.press(getByTestId('logout-button'));
    });

    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('sellerProfileId');
      expect(getByTestId('isAuthenticated').props.children).toBe('false');
      expect(getByTestId('sellerProfileId').props.children).toBeNull();
    });
  });

  it('updateSellerProfileId should save to AsyncStorage and update state', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('isLoading').props.children).toBe('false');
    });

    await act(async () => {
      fireEvent.press(getByTestId('update-profile-button'));
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('sellerProfileId', '123');
      expect(getByTestId('isAuthenticated').props.children).toBe('true');
      expect(getByTestId('sellerProfileId').props.children).toBe('123');
    });
  });

  it('updateSellerProfileId with null should clear AsyncStorage and update state', async () => {
    await AsyncStorage.setItem('sellerProfileId', 'existing-id');

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('isLoading').props.children).toBe('false');
    });

    await act(async () => {
      fireEvent.press(getByTestId('clear-profile-button'));
    });

    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('sellerProfileId');
      expect(getByTestId('isAuthenticated').props.children).toBe('false');
      expect(getByTestId('sellerProfileId').props.children).toBeNull();
    });
  });

  it('useAuthContext should throw error if used outside AuthProvider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console error
    expect(() => useAuthContext()).toThrow('Invalid hook call');
    console.error.mockRestore();
  });
});