import react from "react";
import {View, Text, Image, StyleSheet} from 'react-native';
import BotaoMenu from "../../../components/BotaoMenu"

const Logo = require('../../../assets/logo.png');

const IconeMedic = require('../../../assets/usuario-md.png')
const IconePaciente = require('../../../assets/utilizador.png')
const IconeConsulta = require('../../../assets/calendario.png')

const MenuScreen = ({navigation}=>
{
    return(
       <View style={styles.container}>
        <Image style={styles.logo}source={Logo}/>
        <Text style={styles.header}>Gerenciando sua Clinica</Text>
        <View style={styles.btns}>
            <Text>Escolha qual seçao deseja iniciar</Text>

            <BotaoMenu
            icone = {IconeMedic}
            titulo = "Medicos"
            onPress = {()=> navigation.navigate('Medicos')}/>

            <BotaoMenu
            icone = {IconePaciente}
            titulo = "Pacientes"
            onPress = {()=> navigation.navigate('Pacientes')}/>

            <BotaoMenu
            icone = {IconeConsulta}
            titulo = "Consultas"
            onPress = {()=> navigation.navigate('Consultas')}/>

        </View>
       </View>
    )
});

 const styles=StyleSheet.create({
            container: {
                flex:1,
                flexDirection: 'column',
                padding:20,
                backgroundColor: '#ffffff',
            },
            logo:{
                width:'50%',
                height: '50%',
                alignSelf: 'left',
                marginBottom: 15,

            },
            header:{fontSize:12, textAlign:'left', fontWeight: 'bold'},
            btns:{marginTop:60, flex:1}
        })
        export default MenuScreen;