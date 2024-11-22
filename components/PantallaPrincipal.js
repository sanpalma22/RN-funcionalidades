import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import * as SMS from 'expo-sms';
import * as Location from 'expo-location'; // Importa Location
import AsyncStorage from '@react-native-async-storage/async-storage';
import { alertaError } from '../Helpers/helperAlert';

export default function PantallaPrincipal() {
  const [subscription, setSubscription] = useState(null);
  const [numeroEmergencia, setNumeroEmergencia] = useState('');
  const storedPermission = AsyncStorage.getItem('locationPermission');
  const [locationPermission, setLocationPermission] = useState(storedPermission);

  useEffect(() => {
    // Solicitar permiso de ubicación al montar el componente
    const obtenerNumeroEmergencia = async () => {
      const numero = await AsyncStorage.getItem('numeroEmergencia');
      setNumeroEmergencia(numero);
      console.log(numero);
    };

    obtenerNumeroEmergencia();

    // Inicializar el listener para el acelerómetro solo una vez
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

    // Limpiar la suscripción al desmontar el componente
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []); // Solo se ejecuta una vez al montar el componente

  const requestLocationPermission = async () => {
    if (locationPermission === 'granted') {
      return; // Salimos si ya tenemos el permiso concedido
    }
  
    // Si no está almacenado o es 'denied', solicitamos el permiso
    const { status } = await Location.requestForegroundPermissionsAsync();
  
    if (status === 'granted') {
      setLocationPermission(true);
      await AsyncStorage.setItem('locationPermission', 'granted');
    } else {
      setLocationPermission(false);
      await AsyncStorage.setItem('locationPermission', 'denied');
      alertaError('Permiso de ubicación denegado', 'No se puede acceder a la ubicación');
    }
  };
  

  const handleEmergency = async () => {
    // Verificar que se tenga permiso para acceder a la ubicación
    if (locationPermission===null) {
      alertaError('Permiso de ubicación', 'No se tiene permiso para acceder a la ubicación. Por favor, habilítalo.');
      return;
    }

    const numero = await AsyncStorage.getItem('numeroEmergencia'); 
    if (!numero) {
      alertaError('Error', 'No se ha configurado un número de emergencia.');
      return;
    }

    const message = '¡Necesito ayuda! Aquí está mi ubicación:';
    const location = await Location.getCurrentPositionAsync({});
    const lat = location.coords.latitude;
    const lon = location.coords.longitude;

    const fullMessage = `${message} https://www.google.com/maps?q=${lat},${lon}`;
    alertaError('Redirigiendo', 'Envíe el mensaje de emergencia');
    if (await SMS.isAvailableAsync()) {
      await SMS.sendSMSAsync([numero], fullMessage);
      alertaError('Mensaje enviado', 'El mensaje de emergencia ha sido enviado.');
    } else {
      alertaError('Error', 'SMS no disponible en este dispositivo.');
    }
  };

  // Solicitar permisos de ubicación cuando el componente se monta
  useEffect(() => {
    requestLocationPermission();
  }, []); // Solo se ejecuta una vez al montar el componente

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
