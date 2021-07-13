import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { useFonts } from '@expo-google-fonts/raleway';

import * as Color from '../assets/Colors';

import animation1 from '../assets/animation1.gif'; 


export default function Loading() {

    let [fontsLoaded, error] = useFonts({
        "digital2": require('../assets/MUSICNET.ttf'),
        "digital": require('../assets/ka1.ttf')
    })

    const funLoadingText = [
        'Setting up the radar..',
        'Detecting signals..',
        'Filtering UFO signals..',
        'Connecting to radar tower..',
        'Listening to meows and woofs..',
        'Following paw trails..',
        'Sniffing for lost pets..'
     ]
    const randomizer = funLoadingText[Math.floor(Math.random() * funLoadingText.length)]
    


    return (
        <View style={{flex: 1, marginTop: 25}}>
            {fontsLoaded && (
            <View style={styles.container}>
                
                <View style={styles.title}>
                    <Text style={styles.titleText}>Pet Radar</Text>
                </View>
                
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.image} 
                        source={animation1} />
                </View>

                <View style={styles.message}>
                    <Text style={styles.messageText}>{randomizer}</Text>
                </View>
            
            </View>
                )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Color.Color_BL5
    },
    image: {
        aspectRatio: 1,
        width: 250,
        height: 250,
    },
    imageContainer: {
        // borderWidth: 4,
        // borderRadius: 40,
    },
    message: {
        justifyContent: 'center',
        top: 20
    },
    messageText: {
        fontSize: 17,
        width: '80%',
        bottom: 30,
        fontStyle: 'italic'
    },
    title: {
        bottom: 50
    },
    titleText: {
        fontSize: 38,
        color: Color.Color_B2,
        // color: Color.Color_W3,
        fontFamily: 'digital'
    }   
  });
