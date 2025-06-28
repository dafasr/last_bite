import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [agree, setAgree] = useState(false);

  const handleRegister = () => {
    if (!fullName || !email || !phone || !password || !retypePassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== retypePassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!agree) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }
    // Handle registration logic here
    Alert.alert('Success', 'You have been registered successfully');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buat Akun Baru</Text>
      <Text style={styles.subtitle}>Isi detail di bawah untuk mendaftar</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Retype Password"
          value={retypePassword}
          onChangeText={setRetypePassword}
          secureTextEntry
        />
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, agree && styles.checkboxChecked]}
            onPress={() => setAgree(!agree)}
          >
            {agree && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Saya setuju dengan syarat & ketentuan</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Sudah punya akun? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Masuk sekarang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderRadius: 3,
  },
  checkboxChecked: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  checkmark: {
    color: '#FFFFFF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  loginLink: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
