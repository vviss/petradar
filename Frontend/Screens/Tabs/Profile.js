import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, FlatList } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import { GiftedChat } from 'react-native-gifted-chat';

import firebase from 'firebase';
require('firebase/firestore');
// require('firebase/firebase-storage');

import * as Color from '../../assets/Colors';

import hostLink from '../../assets/ngrokHost';
import axios from 'axios';

export default function Profile(props) {
  

    const onLogout = () => {
        firebase.auth().signOut();
    }

    return (
        <View style={styles.backgroundContainer}>
    
            <View style={styles.topBar}>
                <Text style={styles.topBarText}>Profile</Text>
            </View>

            <View
                style={{width: '80%', marginVertical: 20}}>
                <Text>
                    Placeholder: Profile page, will include user information
                    and functionalities to update name/photo/password
                </Text>
            </View>

            <TouchableOpacity 
                style={styles.bottomBar}
                onPress={() => onLogout()}>
                <Text>LOGOUT</Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({

    backgroundContainer: {
        flex: 1,
        marginTop: 25,
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Color.Color_O4
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Color.Color_B4,
        width: '50%',
        height: 60
    },
    convBoxLeft: {
        marginRight: 10
    },
    convBoxRight: {

    },
    convBox: {
        height: 75,
        width: '100%',
        paddingHorizontal: 7,
        // paddingVertical: 5,
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: 0.2,
        borderBottomColor: Color.Color_B3,
        backgroundColor: Color.Color_B10
    },
    list: {
        flex: 1,
        width: '100%',
        // marginBottom: 20,
    },
    messageSeenName: {
        fontSize: 17,
        marginBottom: 5,
    },
    messageSeenText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    messageTime: {
        fontSize: 11,
        width: 100,
        left: 187,
        bottom: 25,
        position: 'absolute',
    },
    messageUnseenIcon: {
        position: 'absolute',
        top: 2,
        left: 263        
    },
    messageUnseenName: {
        fontSize: 17,
        marginBottom: 5,
        fontWeight: 'bold'
    },
    messageUnseenText: {
        fontSize: 14,
        fontStyle: 'italic',
        fontWeight: 'bold',
    },
    topBar: {
        height: 50,
        width: '100%',
        paddingLeft: 15,
        // justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        backgroundColor: Color.Color_W1,
        borderBottomColor: Color.Color_B1,
        flexDirection: 'row'
    },
    topBarPhoto: {
        aspectRatio: 1,
        width: 40,
        borderRadius: 30,
        marginRight: 5,
        marginLeft: 10
    },
    topBarText: {
        fontSize: 19
    },
    userPhoto: {
        aspectRatio: 1,
        width: 50,
        borderRadius: 30
    }
  });

