import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
// import { useFonts } from '@expo-google-fonts/raleway';

import * as Color from '../../assets/Colors';

import animation2 from '../../assets/animation2.gif'; 


export default function Uploading(props) {

    // let [fontsLoaded, error] = useFonts({
    //     "digital2": require('../assets/MUSICNET.ttf'),
    //     "digital": require('../assets/ka1.ttf')

    // })


    return (
      <View style={{flex: 1}}>
        <View style={styles.container}>
          
          <View style={styles.title}>
            <Text style={styles.titleText}>Please wait..</Text>
          </View>        

          <View style={styles.imageContainer}>
              <Image
              style={styles.image} 
              source={animation2} />
          </View>

          <View style={styles.message}>
            <Text style={styles.messageText}>{props.message}</Text>
          </View>
    
        </View>
      </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Color.Color_B9,
    },
    image: {
        aspectRatio: 1,
        width: 200,
        height: 200,
        // bottom: 30
    },
    imageContainer: {
        // borderWidth: 4,
        // borderRadius: 40,
    },
    message: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%',
        top: 50
    },
    messageText: {
        fontSize: 17,
        // width: '80%',
        textAlign: 'center',
        bottom: 30,
        fontStyle: 'italic'
    },
    title: {
        bottom: 50,
        alignItems: 'center',
        justifyContent: 'center',
        // alignSelf: 'center'
    },
    titleText: {
        fontSize: 31,
        marginBottom: 20,
        color: Color.Color_BL4,
        fontFamily: 'digital'
    }   
  });
