import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

const RegisterMerchantScreen = ({ navigation }) => {
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');

  const handleRegister = () => {
    if (!storeName || !description || !address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    // Handle registration logic here
    Alert.alert('Success', 'Store has been registered successfully');
    navigation.navigate('MerchantHome');
  };

  const handleUploadPhoto = () => {
    // Placeholder for photo upload logic
    Alert.alert('Upload Photo', 'This feature is under development.');
  };

  const handlePinpointLocation = () => {
    // Placeholder for map integration
    Alert.alert('Pinpoint Location', 'This feature is under development.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register Your Store</Text>
      <Text style={styles.subtitle}>Fill in the details below to get started</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Store Name"
          value={storeName}
          onChangeText={setStoreName}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Store Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity style={styles.outlineButton} onPress={handleUploadPhoto}>
          <Text style={styles.outlineButtonText}>Upload Store Picture</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineButton} onPress={handlePinpointLocation}>
          <Text style={styles.outlineButtonText}>Pinpoint Location on Google Maps</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register Store</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 30,
    textAlign: 'center',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  outlineButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2ECC71',
    marginBottom: 15,
  },
  outlineButtonText: {
    color: '#2ECC71',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2ECC71',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RegisterMerchantScreen;
