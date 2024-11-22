import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { alertaError } from '../Helpers/helperAlert';
import { BarCodeScanner } from 'expo';

export default function PantallaIdApp() {
  const qrData = "App funcionalidades: Santiago Palma y Santino Lo Giudice";

  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scannedData, setScannedData] = useState('');

  // Solicitar permisos de cámara
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleScanButtonPress = () => {
    if (hasPermission === null) {
      alertaError('Solicitando permisos de cámara...');
    } else if (hasPermission === false) {
      alertaError('Permiso denegado. No se puede acceder a la cámara.');
    } else {
      setScanModalVisible(true); 
    }
  };

  const handleBarCodeScanned = ({ data }) => {
    setScannedData(data);
    setScanModalVisible(false); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ID App</Text>
      <View style={styles.qrContainer}>
        <QRCode value={qrData} size={200} />
      </View>
      <Button title="Escanear otro QR" onPress={handleScanButtonPress} />

      <Modal
        visible={scanModalVisible}
        animationType="slide"
        onRequestClose={() => setScanModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Escanea el código QR</Text>
          <BarCodeScanner
            onBarCodeScanned={({ type, data }) => {
              handleBarCodeScanned({ data });
            }}
            style={styles.scanner} 
          />
          <Button title="Cerrar" onPress={() => setScanModalVisible(false)} />
        </View>
      </Modal>

      <Modal
        visible={!!scannedData} 
        transparent={true}
        animationType="slide"
        onRequestClose={() => setScannedData('')}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Datos escaneados</Text>
            <Text>{scannedData}</Text>
            <Button title="Cerrar" onPress={() => setScannedData('')} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f7f7',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  qrContainer: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', 
    backgroundColor: '#f7f7f7',
    paddingTop: 50,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scanner: {
    width: '100%',
    height: '80%', 
    marginBottom:20
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
});