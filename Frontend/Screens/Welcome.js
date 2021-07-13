import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollViewComponent} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Color from '../assets/Colors';

export default function Welcome({ navigation }) {

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>
                    Welcome to Pet Radar
                </Text>
            </View>

            <MaterialCommunityIcons name='radio-tower' size={140} />

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button} 
                    onPress={() => navigation.navigate('Login')}>
                    <Text
                    style={styles.buttonText}>
                        Login
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={() => navigation.navigate('SignUp')}>
                    <Text
                    style={styles.buttonText}>
                        Sign Up
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: Color.Color_G2,
        width: 80,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        margin: 5
    },
    buttonContainer: {
        flexDirection: 'row'
    },
    buttonText: {
        color: 'white'
    },
    container: {
      flex: 1,
      marginTop: 25,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Color.Color_G1,
      borderRadius: 10
    },
    titleContainer: {
        backgroundColor: 'rgba(245,245,245,0.85)',
        borderRadius: 15,
        bottom: 80,
        padding: 15

    },
    titleText: {
        fontFamily: 'digital2',
        fontSize: 22,
        color: Color.Color_G2,
    }   
  });
