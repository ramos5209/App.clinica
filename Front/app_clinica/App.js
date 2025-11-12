import React, {useState} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigation} from "@react-navigation/stack";

import Splash from './src/screens/Splash/Splash';

import MenuScreen from "./src/screens/MenuScreen/MenuScreen"

// import Medico from "./src/screens/Medico/Medico"
// import Paciente from "./src/screens/Paciente/Paciente"
// import Consulta from "./src/screens/Consulta/Consulta"
// import FormMedico from "./src/screens/FormMedico/FormMedico"


const Stack = createStackNavigation();

function App(){

    const [medicos, setMedicos] = useState([
        {"id":1, "nome" : "Joao", "especialdade" : "cardiologista",
            "crm" : "12345/SP", "email" : "joaomedico@email.com", "telefone" : "(19) 99999-9999"
        },
        {
  "id": 2,
  "nome": "Ana Souza",
  "especialidade": "Dermatologista",
  "crm": "54321/SP",
  "email": "ana.derma@email.com",
  "telefone": "(11) 98888-8888"
}

    ])

    const [pacientes, setPacientes] = useState([]);
    const [consultas, setConsultas] = useState([]);

    return(
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash">

                <Stack.Screen name="Splash" component={Splash} option={{headerShow:false}}/>
                <Stack.Screen name="Menu" component={MenuScreen} option={{title:"Menu Principal"}}/>
                <Stack.Screen name="Medico" component={medicos} option={{title:"Médicos"}}/>
                <Stack.Screen name="Paciente" component={pacientes} option={{title:"Pacientes"}}/>
                <Stack.Screen name="Consulta" component={consultas} option={{title:"Consultas"}}/>
                <Stack.Screen name="MedicoForm" component={MedicoForm} option={{title:"Gerenciamento Médicos"}}/>
                {/*Tela temporaria para ações nao implementadas */}
                <Stack.Screen name= "EmConstrucao" component = {
                    ()=>(
                        <View style={{flex:1, justifyContent: 'center', alignItems: 'center,'}}>
                            <Text style={{fontSize:24}}>Em Construção!</Text>
                        </View>
                    )} options={{title:'Em Construção'}}/>


            </Stack.Navigator>
        </NavigationContainer>
    )

}