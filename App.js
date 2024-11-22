import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PantallaIdApp from './components/PantallaIdApp.js';
import PantallaClima from './components/PantallaClima.js';
import PantallaContactosList from './components/PantallaContactosList.js';
import PantallaEmergencia from './components/PantallaEmergencia.js';
import PantallaPrincipal from './components/PantallaPrincipal.js'; // Importa la nueva pantalla principal

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Inicio') {
              iconName = 'home';
            } else if (route.name === 'Clima') {
              iconName = 'cloudy';
            } else if (route.name === 'Emergencia') {
              iconName = 'call';
            } else if (route.name === 'Contactos') {
              iconName = 'people';
            } else if (route.name === 'Id App') {
              iconName = 'qr-code';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Inicio" component={PantallaPrincipal} />
        <Tab.Screen name="Clima" component={PantallaClima} />
        <Tab.Screen name="Emergencia" component={PantallaEmergencia} />
        <Tab.Screen name="Contactos" component={PantallaContactosList} />
        <Tab.Screen name="Id App" component={PantallaIdApp} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
