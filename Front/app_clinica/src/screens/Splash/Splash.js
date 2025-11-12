import React, {useEffect} from 'react';

import { View,Text, Image, StyleSheet } from 'react-native';

const Logo = require('../../../assets/logo.png');

const Splash = ({navigator}) => {

useEffect(() =>{
  setTimeout(()=>{
    navigation.replace('Menu');
  },3000);
},[])
return(
    <View style={styles.container}>
        <image style= {styles.logo} source={Logo}/>
        <Text>Carregando...</Text>
    </View>
);
};

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },
    title:{
        textAlign: 'center',
        fontSize:16,
        fontWeight: 'bold',
    },
})