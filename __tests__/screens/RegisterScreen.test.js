import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../../src/screens/RegisterScreen';
import { useAuth } from '../../src/hooks';
import { useImagePicker } from '../../src/hooks';
import * as Location from 'expo-location';

// Mock hooks and modules
jest.mock('../../src/hooks', () => ({
  useAuth: jest.fn(),
  useImagePicker: jest.fn(),
}));
jest.mock('expo-location');
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props) => <View {...props} />;
  const MockMarker = (props) => <View {...props} />;
  MockMapView.Marker = MockMarker;
  return MockMapView;
});

// Mock the navigation
const mockNavigate = jest.fn();

describe('<RegisterScreen />', () => {
  let registerUserMock;
  let pickImageMock;

  beforeEach(() => {
    jest.useFakeTimers();
    registerUserMock = jest.fn();
    pickImageMock = jest.fn();
    useAuth.mockReturnValue({
      isLoading: false,
      registerUser: registerUserMock,
    });
    useImagePicker.mockReturnValue({
      image: null,
      pickImage: pickImageMock,
      setImage: jest.fn(),
    });
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.getCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: -6.2, longitude: 106.816666 },
    });
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders all input fields and buttons', () => {
    const { getByText, getByPlaceholderText } = render(<RegisterScreen navigation={{ navigate: mockNavigate }} />);
    
    expect(getByText('Nama Lengkap')).toBeTruthy();
    expect(getByText('Username')).toBeTruthy();
    expect(getByText('Email')).toBeTruthy();
    expect(getByText('Kata Sandi')).toBeTruthy();
    expect(getByText('Konfirmasi Kata Sandi')).toBeTruthy();
    expect(getByText('Nomor Telepon')).toBeTruthy();
    expect(getByText('Nama Toko')).toBeTruthy();
    expect(getByText('Deskripsi Toko')).toBeTruthy();
    expect(getByText('Alamat')).toBeTruthy();
    expect(getByText('Pilih Foto Toko')).toBeTruthy();
    expect(getByText('Gunakan Lokasi Saat Ini')).toBeTruthy();
    expect(getByText('Daftar')).toBeTruthy();
    expect(getByText('Masuk sekarang')).toBeTruthy();
  });

  it('shows error messages for empty fields', async () => {
    const { getByText } = render(<RegisterScreen navigation={{ navigate: mockNavigate }} />);
    
    fireEvent.press(getByText('Daftar'));
    
    await waitFor(() => {
      expect(getByText('Username wajib diisi.')).toBeTruthy();
      expect(getByText('Email wajib diisi.')).toBeTruthy();
      expect(getByText('Kata sandi wajib diisi.')).toBeTruthy();
      expect(getByText('Konfirmasi kata sandi wajib diisi.')).toBeTruthy();
      expect(getByText('Nama lengkap wajib diisi.')).toBeTruthy();
      expect(getByText('Nomor telepon wajib diisi.')).toBeTruthy();
      expect(getByText('Nama toko wajib diisi.')).toBeTruthy();
      expect(getByText('Deskripsi toko wajib diisi.')).toBeTruthy();
      expect(getByText('Alamat wajib diisi.')).toBeTruthy();
    });
  });

  it('navigates to Login screen on button press', () => {
    const { getByText } = render(<RegisterScreen navigation={{ navigate: mockNavigate }} />);
    
    fireEvent.press(getByText('Masuk sekarang'));
    
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});