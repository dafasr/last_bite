import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const useImagePicker = () => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: 'Peringatan',
            textBody: 'Kami memerlukan izin galeri untuk memilih gambar.',
            button: 'Tutup',
          });
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  return { image, pickImage, setImage };
};

export default useImagePicker;
