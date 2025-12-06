// App.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Importa as telas
import Splash from "./src/screens/Splash/Splash";
import MenuScreen from "./src/screens/Menu/MenuScreen";
import Medico from "./src/screens/Medico/Medico";
import Paciente from "./src/screens/Paciente/Paciente";
import Consulta from "./src/screens/Consulta/Consulta";
import CadastroEdicaoMedicoScreen from "./src/screens/Medico/CadastroEdicaoMedicoScreen";
import CadastroEdicaoPacienteScreen from "./src/screens/Paciente/CadastroEdicaoPacienteScreen";
import AgendarConsultaScreen from './src/screens/Consulta/AgendarConsultaScreen';

const Stack = createStackNavigator();

// Componente extraído para evitar o warning de "inline function"
const EmConstrucaoScreen = () => (
  <View style={styles.centerContainer}>
    <Text style={styles.textLarge}>Em Construção!</Text>
  </View>
);

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        {/* Tela de Splash (sem cabeçalho) */}
        <Stack.Screen
          name="Splash"
          component={Splash}
          options={{ headerShown: false }}
        />

        {/* Menu Principal */}
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{ title: "Menu Principal" }}
        />

        {/* Telas Funcionais */}
        <Stack.Screen
          name="Medicos"
          component={Medico}
          options={{ title: "Médico(a)s" }}
        />

        <Stack.Screen
          name="Pacientes"
          component={Paciente}
          options={{ title: "Pacientes" }}
        />

        <Stack.Screen
          name="Consultas"
          component={Consulta}
          options={{ title: "Consultas" }}
        />

        <Stack.Screen
          name="MedicoForm"
          component={CadastroEdicaoMedicoScreen}
          options={{ title: "Gerenciar Médico" }}
        />
        <Stack.Screen
          name="PacienteForm"
          component={CadastroEdicaoPacienteScreen}
          options={{ title: "Gerenciar Paciente" }}
        />
        <Stack.Screen
          name="AgendarConsulta"
          component={AgendarConsultaScreen}
          options={{ title: "Nova Consulta" }}
        />

        {/* Tela Genérica */}
        <Stack.Screen
          name="EmConstrucao"
          component={EmConstrucaoScreen}
          options={{ title: "Em Construção" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textLarge: {
    fontSize: 24,
  },
});

export default App;
