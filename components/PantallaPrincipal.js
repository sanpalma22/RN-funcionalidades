import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location'; // Importa Location
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function PantallaPrincipal() {
  const [subscription, setSubscription] = useState(null);
  const [numeroEmergencia, setNumeroEmergencia] = useState('');
  const [locationPermission, setLocationPermission] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const obtenerNumeroEmergencia = async () => {
        const numero = await AsyncStorage.getItem('numeroEmergencia');
        setNumeroEmergencia(numero);
        console.log(numero); 
      };

      obtenerNumeroEmergencia();

      const startListening = () => {
        const sub = Accelerometer.addListener(accelerometerData => {
          const { x, y, z } = accelerometerData;
          const shakeThreshold = 1.5; // Ajusta el umbral según tus necesidades

          if (Math.abs(x) > shakeThreshold || Math.abs(y) > shakeThreshold || Math.abs(z) > shakeThreshold) {
            handleEmergency(); 
          }
        });

        setSubscription(sub);
      };

      startListening();

      // Limpiar suscripción al desmontar el componente
      return () => {
        if (subscription) {
          subscription.remove();
        }
      };
    }, []) 
  );

  const requestLocationPermission = async () => {
    const storedPermission = await AsyncStorage.getItem('locationPermission');
    
    if (storedPermission !== null) {
      // Si el permiso está almacenado, usalo directamente
      setLocationPermission(storedPermission === 'granted');
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      await AsyncStorage.setItem('locationPermission', status === 'granted' ? 'granted' : 'denied');
      
      if (status !== 'granted') {
        Alert.alert('Permiso de ubicación denegado', 'No se puede acceder a la ubicación');
      }
    }
  };

  const handleEmergency = async () => {
    // Verificar que se tenga permiso para acceder a la ubicación
    if (!locationPermission) {
      Alert.alert('Permiso de ubicación', 'No se tiene permiso para acceder a la ubicación. Por favor, habilítalo.');
      return;
    }

    const numero = await AsyncStorage.getItem('numeroEmergencia'); 
    if (!numero) {
      Alert.alert('Error', 'No se ha configurado un número de emergencia.');
      return;
    }

    const message = '¡Necesito ayuda! Aquí está mi ubicación:';
    const location = await Location.getCurrentPositionAsync({});
    const lat = location.coords.latitude;
    const lon = location.coords.longitude;

    const fullMessage = `${message} https://www.google.com/maps?q=${lat},${lon}`;

    if (await SMS.isAvailableAsync()) {
      await SMS.sendSMSAsync([numero], fullMessage);
      Alert.alert('Mensaje enviado', 'El mensaje de emergencia ha sido enviado.');
    } else {
      Alert.alert('Error', 'SMS no disponible en este dispositivo.');
    }
  };



  // Solicitar permisos de ubicación cuando el componente se monta
  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla Principal</Text>
      <Text style={styles.subtitle}>SOS: SACUDÍ PARA MENSAJE DE EMERGENCIA</Text>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color:'red',
    textAlign:'center'
  }
});
