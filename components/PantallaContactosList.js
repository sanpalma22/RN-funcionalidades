import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; 
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { alertaError } from '../Helpers/helperAlert';

export default function PantallaContactosList() {
  const [contactos, setContactos] = useState([]);
  const [contactosFiltrados, setContactosFiltrados] = useState([]);
  const [numeroEmergencia, setNumeroEmergencia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const obtenerNumeroEmergencia = async () => {
        const numero = await AsyncStorage.getItem('numeroEmergencia');
        setNumeroEmergencia(numero);
      };

      const obtenerContactos = async () => {
        const { status } = await Contacts.requestPermissionsAsync();

        if (status === 'granted') {
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers],
          });

          if (data.length > 0) {
            setContactos(data);
            setContactosFiltrados(data);  // Inicializamos los contactos filtrados con todos los contactos
          } else {
            alertaError('No se encontraron contactos');
          }
        } else {
          alertaError('Permiso denegado', 'No se puede acceder a los contactos');
        }
      };

      obtenerNumeroEmergencia(); 
      obtenerContactos(); 
    }, []) 
  );

  const handleSearch = (text) => {
    setSearchTerm(text);

    // Filtrar los contactos por nombre o número de teléfono
    const contactosFiltrados = contactos.filter(contacto => {
      const nombreCompleto = `${contacto.firstName} ${contacto.lastName}`.toLowerCase();
      const telefono = contacto.phoneNumbers ? contacto.phoneNumbers[0].number.toLowerCase() : '';

      return nombreCompleto.includes(text.toLowerCase()) || telefono.includes(text.toLowerCase());
    });

    setContactosFiltrados(contactosFiltrados);
  };

  const renderItem = ({ item }) => {
    const phoneNumber = item.phoneNumbers && item.phoneNumbers.length > 0 ? item.phoneNumbers[0].number : 'Sin número';

    const cleanPhoneNumber1 = phoneNumber.replace('+54911', '').replace('+54 9 11', '') ;
    const cleanPhoneNumber2 = cleanPhoneNumber1.replace(/\D/g, '');

    const cleanEmergencyNumber = numeroEmergencia 
    ? numeroEmergencia.replace('54911', '').replace(/\D/g, '').replace('911', '') 
    : null;

    const isEmergencyNumber = cleanEmergencyNumber && cleanPhoneNumber2.includes(cleanEmergencyNumber);

    return (
      <View style={styles.contacto}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.firstName} {item.lastName}</Text>
          <View style={styles.numeroContainer}>
            <Text style={styles.contactNumber}>{phoneNumber}</Text>
            {isEmergencyNumber && (
              <Ionicons name="checkmark-circle" size={24} color="green" />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar contacto..."
        value={searchTerm}
        onChangeText={handleSearch}
      />
      <FlatList
        data={contactosFiltrados}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.welcome}>Tus contactos</Text>
          </View>
        }
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 10,
  },

  welcome: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  contacto: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row', // Cambiado a 'row' para que nombre y número estén en una fila
    justifyContent: 'space-between', // Esto asegura que el espacio esté distribuido entre el nombre y el número
    alignItems: 'center', // Alinea el contenido verticalmente al centro
  },
  contactInfo: {
    flexDirection: 'row', // Cambiado a 'row' para poner el nombre y número en fila
    justifyContent: 'space-between', // Distribuye espacio entre el nombre y número
    width: '100%', // Asegura que los elementos ocupen todo el ancho
  },
  contactName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    flex: 1, // Asegura que el nombre ocupe el espacio restante
  },
  numeroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactNumber: {
    fontSize: 16,
    color: '#666',
  },
  searchInput: {
    height: 60,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingLeft: 10,
    backgroundColor: '#fff',
  },
});
