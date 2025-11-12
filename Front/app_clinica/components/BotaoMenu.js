import { TouchableOpacity,
    Text,
    Image,
    View,
    StyleSheet,
    Dimensions
 } from "react-native";
import { Button } from "react-native/types_generated/index";

 const screenWidth = Dimensions.get('window').width;

 const BUTTON_WIDTH_PERCENTAGE=0.9;
 const buttonWidth = screenWidth * BUTTON_WIDTH_PERCENTAGE;

 const buttonHeight = buttonWidth *0.5;


 const BotaoMenu = ({icone, titulo, onPress})=>{
    return(
        <TouchableOpacity style={styles.botao} onPress={onPress}
        activeOpacity={0.7}>
            {icone&&(
            <Image source={icone} style={styles.icone} resizeMode="contain"/>
      
            )}
            <Text style = {styles.titulo}>{titulo}</Text>
              </TouchableOpacity>
    )

 }
 const styles = StyleSheet.create({
    botao:{
        width: buttonWidth,
        height: buttonHeigth,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007aff',     
        padding: 10,
        marginVertical:5,
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffSet: {width:0, height:2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84, 
        elevation: 5,
    }

 })
 export default BotaoMenu