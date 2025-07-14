import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import { useAuth } from '../../src/hooks';

// Mock the useAuth hook
jest.mock('../../src/hooks', () => ({
  useAuth: jest.fn(),
}));

// Mock the navigation
const mockNavigate = jest.fn();

describe('<LoginScreen />', () => {
  let loginUserMock;

  beforeEach(() => {
    loginUserMock = jest.fn();
    useAuth.mockReturnValue({
      isLoading: false,
      loginUser: loginUserMock,
    });
    mockNavigate.mockClear();
  });

  it('renders all input fields and buttons', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={{ navigate: mockNavigate }} />);
    
    expect(getByPlaceholderText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Kata sandi')).toBeTruthy();
    expect(getByText('Masuk')).toBeTruthy();
    expect(getByText('Daftar sekarang')).toBeTruthy();
  });

  it('shows error messages for empty fields', async () => {
    const { getByText } = render(<LoginScreen navigation={{ navigate: mockNavigate }} />);
    
    fireEvent.press(getByText('Masuk'));
    
    await waitFor(() => {
      expect(getByText('Username wajib diisi.')).toBeTruthy();
      expect(getByText('Password wajib diisi.')).toBeTruthy();
    });
  });

  it('calls loginUser on valid submission', async () => {
    loginUserMock.mockResolvedValue({ success: true });

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={{ navigate: mockNavigate }} />);
    
    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Kata sandi'), 'password');
    fireEvent.press(getByText('Masuk'));
    
    await waitFor(() => {
      expect(loginUserMock).toHaveBeenCalledWith({ username: 'testuser', password: 'password' });
    });
  });

  it('shows an error message on failed login', async () => {
    loginUserMock.mockResolvedValue({
      success: false,
      message: 'Username atau Kata Sandi Salah',
    });

    const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={{ navigate: mockNavigate }} />);

    fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('Kata sandi'), 'wrongpassword');
    fireEvent.press(getByText('Masuk'));

    await waitFor(() => {
      expect(getByText('Username atau Kata Sandi Salah')).toBeTruthy();
    });
  });

  it('navigates to Register screen on button press', () => {
    const { getByText } = render(<LoginScreen navigation={{ navigate: mockNavigate }} />);
    
    fireEvent.press(getByText('Daftar sekarang'));
    
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });
});