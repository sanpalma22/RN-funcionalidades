import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage
import { alertaError } from '../Helpers/helperAlert';

const API_KEY = 'b662851334fa787bd73ef826930e20eb'; 

export default function PantallaClima({ navigation }) {
  const [horaActual, setHoraActual] = useState('');
  const [fechaActual, setFechaActual] = useState('');
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerUbicacionYClima = async () => {
      try {
        // Verifica si el permiso ya fue concedido
        const permisoGuardado = await AsyncStorage.getItem('locationPermissionGranted');
        
        if (permisoGuardado === null) { // Si no se ha guardado el permiso
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            alertaError('Permiso de ubicación denegado');
            await AsyncStorage.setItem('locationPermissionGranted', 'false');
            return;
          }
          // Guarda que el permiso fue concedido
          await AsyncStorage.setItem('locationPermissionGranted', 'true');
        }

        // Obtener ubicación actual
        const ubicacion = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = ubicacion.coords;

        // Obtener clima usando la API
        const respuesta = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        
        setClima(respuesta.data);
        setCargando(false);
      } catch (error) {
        console.error(error);
      }
    };

    obtenerUbicacionYClima();

    // Función para actualizar la hora y la fecha
    const actualizarHoraYFecha = () => {
      const ahora = new Date();
      setHoraActual(ahora.toLocaleTimeString());
      setFechaActual(ahora.toLocaleDateString()); 
    };

    const intervalo = setInterval(actualizarHoraYFecha, 1000); 
    return () => clearInterval(intervalo); 
  }, []);

  if (cargando) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
        <Text style={styles.hora}>{horaActual}</Text>
        <Text style={styles.fecha}>{fechaActual}</Text>
        
        <View style={styles.containerClima}>
            <Text style={styles.temperatura}>{clima.main.temp} °C</Text>
            <Text style={styles.clima}>{clima.weather[0].description}</Text>
            <Text style={styles.ubicacion}>{clima.name}</Text>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  containerClima: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5, // Para dispositivos Android
    alignItems: 'center',
    width: '80%',
    justifyContent: 'center',
  },
  fecha: {
    fontSize: 18,
    marginBottom: 10,
  },
  hora: {
    fontSize: 44,
    fontWeight: 'bold',
  },
  clima: {
    fontSize: 18,
    color: '#777',
    marginTop: 5,
  },
  temperatura: {
    fontSize: 44,
    fontWeight: 'bold',
  },
  ubicacion: {
    fontSize: 18,
    marginTop: 10,
  },
});
