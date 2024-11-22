import { Alert, Vibration } from 'react-native';

export const alertaError = (title, message) => {
  Vibration.vibrate(500);
  Alert.alert(title, message, [{ text: 'OK' }]);
};
