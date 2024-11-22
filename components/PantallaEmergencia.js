import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, Alert, TouchableOpacity } from 'react-native';
import { alertaError } from '../Helpers/helperAlert';

export default function ConfigurarEmergencia() {
  const [numero, setNumero] = useState('');
  const [numeroGuardado, setNumeroGuardado] = useState(null);

  useEffect(() => {
    const obtenerNumero = async () => {
      const numeroGuardado = await AsyncStorage.getItem('numeroEmergencia');
      if (numeroGuardado) {
        setNumeroGuardado(numeroGuardado); // Mostrar número guardado
      }
    };
    obtenerNumero();
  }, []);

  const validarNumero = () => {
    const regex = /^[0-9]{3,}$/; 
    if (!regex.test(numero)) {
      alertaError('Error', 'Por favor ingresa un número de emergencia válido de al menos 3 dígitos.');
      return false;
    }
    return true;
  };

  const guardarNumero = async () => {
    if (validarNumero()) {
      await AsyncStorage.setItem('numeroEmergencia', numero);
      setNumeroGuardado(numero); 
      alertaError('Éxito', 'Número de emergencia guardado correctamente.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Configurar Número de Emergencia</Text>
        <TextInput
          style={styles.input}
          placeholder="Número de emergencia"
          keyboardType="phone-pad"
          value={numero}
          onChangeText={setNumero}
        />
        <TouchableOpacity style={styles.button} onPress={guardarNumero}>
          <Text style={styles.buttonText}>Guardar número</Text>
        </TouchableOpacity>
        {numeroGuardado && ( 
          <Text style={styles.numeroGuardadoText}>
            Número de emergencia actual: {numeroGuardado}
          </Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7', // Fondo suave y claro
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF', // Azul para el botón
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  numeroGuardadoText: {
    marginTop: 20,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    textAlign:'center'
  },
});
