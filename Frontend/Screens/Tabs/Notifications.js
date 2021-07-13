import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, FlatList } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsFocused } from '@react-navigation/native';

import firebase from 'firebase';
require('firebase/firestore');
// require('firebase/firebase-storage');

import * as Color from '../../assets/Colors';

import hostLink from '../../assets/ngrokHost';
import axios from 'axios';

export default function Notifications(props) {

    const isFocused = useIsFocused();
    const [notifications, setNotifications] = useState([]);
    
    const messageFormat = (message) => {
        if(message.length < 35) {
            return message;
        } else {
            return message.substring(0, 35) + '...';
        }
    }

    const timeFormat = (creation) => {
        if(creation) {
        creation = JSON.stringify(creation.toDate());
        let date = creation.split('T')[0].slice(1);
        let time = creation.split('T')[1].slice(0,5);
        let timestamp = date + ', ' + time;
        return timestamp;
        }
    }


    const flatList = useRef(null);

    const notifIcon = (notifType) => {
        switch(notifType) {
            case 'adoption':
                return 'paw';
                break;
            case 'nearby':
                return 'map-marker-alert';
                break;
            case 'comment':
                return 'chat';
                break;
        }
    }
  
    useEffect(() => {
        if(isFocused) {
            firebase.firestore()
            .collection('Notifications')
            .doc(firebase.auth().currentUser.uid)
            .collection('Comments')
            .get()
            .then((snapshot) => {
                for(let i of snapshot.docs) {
                    // console.log('mapping over docs:', i.data());
                    firebase.firestore()
                    .collection('Notifications')
                    .doc(firebase.auth().currentUser.uid)
                    .collection('Comments')
                    .doc(i.id)
                    .update({
                        seen: true
                    })
                }
            })
        }
    })


    useEffect(() => {

        firebase.firestore()
        .collection('Notifications')
        .doc(firebase.auth().currentUser.uid)
        .collection('Comments')
        .onSnapshot((collection) => {
            // console.log('from onSnapshot:', collection.docs[0]);
            firebase.firestore()
            .collection('Notifications')
            .doc(firebase.auth().currentUser.uid)
            .collection('Comments')
            .orderBy('creation', 'desc')
            .get()
            .then((snapshot) => {
            // console.log('from Chat hook:', snapshot.docs);
                let notifs = snapshot.docs.map(doc => doc.data());
                setNotifications(notifs);
                console.log('retrieved:', notifs);
            })
        })
    }, [])



    return (
        <View style={styles.backgroundContainer}>
            <View style={styles.topBar}>
                <Text style={styles.topBarText}>Notifications</Text>
            </View>

            <View style={styles.list}>
                <FlatList
                    horizontal={false}
                    data={notifications}
                    ref={flatList}
                    // onContentSizeChange={() => flatList.current.scrollToEnd()}
                    keyExtractor={(item) => JSON.stringify(item.creation)}
                    renderItem={({item}) => ((
                      <View>
                      { (item.type === 'comment' || item.type === 'adoption') 
                        ?
                        (
                        <TouchableOpacity
                            style={item.type === 'comment' 
                            ? styles.convBox
                            : styles.adoptionBox}
                            onPress={() => props.navigation.navigate('Post', {item: item.item})}>
                                
                                <View style={styles.convBoxLeft}>
                                    <Image
                                        style={styles.postPhoto} 
                                        source={{uri: item.item.downloadURL}} />
                                </View>

                                <View style={styles.convBoxRight}>

                                    { item.type === 'adoption' 
                                    ?
                                    <View style={{flexDirection: 'row'}}>
                                        <MaterialCommunityIcons
                                            style={{top: 34}}
                                            name={notifIcon(item.type)}
                                            size={20}/>
                                        <Text style={styles.topMessageAdoption}>
                                            Someone wants to adopt {item.item.petName}:
                                        </Text>
                                    </View>
                                    :
                                    <View style={{flexDirection: 'row'}}>
                                        <MaterialCommunityIcons
                                            name={notifIcon(item.type)}
                                            size={20}/>
                                            <Text style={styles.topMessageComment}>
                                                {item.from} commented on your post:
                                            </Text>
                                    </View>
                                    }

                                    { item.type === 'comment' &&
                                    <View style={{flexDirection: 'row'}}>
                                        <Text>
                                            "{messageFormat(item.comment)}"
                                        </Text> 
                                    </View>
                                    }

                                    { item.type === 'adoption' &&
                                    <View>
                                        <View style={{...styles.adoptionTextBox,
                                          marginTop: 5}}>
                                          <MaterialCommunityIcons 
                                            style={{marginRight: 5}}
                                            name='account' 
                                            size={13} />
                                          <Text style={styles.adoptionText}>
                                              {item.name}
                                          </Text>
                                        </View>

                                        <View style={styles.adoptionTextBox}>
                                          <MaterialCommunityIcons 
                                            style={{marginRight: 5}}
                                            name='email' 
                                            size={13} />
                                          
                                          <Text style={styles.adoptionText}>
                                            {item.email}
                                          </Text>
                                        </View>

                                        <View style={styles.adoptionTextBox}>
                                          <MaterialCommunityIcons 
                                            style={{marginRight: 5}}
                                            name='phone' 
                                            size={13} />
                                          <Text style={styles.adoptionText}>
                                            {item.phone ? item.phone : 'Unspecified'}
                                          </Text>
                                        </View> 

                                    </View>
                                    }

                                    <Text style={item.type === 'adoption'
                                        ? styles.adoptionTime
                                        : styles.commentTime}>
                                        {timeFormat(item.creation)}
                                    </Text>
                                </View>


                        </TouchableOpacity>
                        ) : (
                        <TouchableOpacity
                        style={styles.nearbyConvBox}
                        onPress={() => props.navigation.navigate('Post', {item: item.found})}>
                            
                            <View style={styles.convBoxLeft}>
                                <Image
                                    style={styles.postPhoto} 
                                    source={{uri: item.found.downloadURL}} />
                            </View>

                            <View style={styles.convBoxNearbyRight}>
                              <View style={{flexDirection: 'row'}}>
                                <MaterialCommunityIcons
                                    name={notifIcon(item.type)}
                                    size={20}/>                              
                                <Text style={styles.topMessageNearby}>
                                    A {item.found.petType.toLowerCase()} was found nearby!
                                </Text>

                              </View>

                                <View style={{flexDirection: 'row'}}>
                                    <Text>
                                        Report is within 2km of where you lost {item.lost.petName + '.\n'}
                                        Could it be {item.lost.petGender === 'Male' ? 'him' : 'her'}?
                                    </Text> 
                                </View>

                                <Text style={styles.nearbyTime}>
                                    {timeFormat(item.creation)}
                                </Text>
                            </View>

                        </TouchableOpacity>

                          )
                        } 
                      </View>
                    ))} />
                </View>

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
    adoptionBox: {
        height: 110,
        width: '100%',
        paddingHorizontal: 7,
        paddingBottom: 15,
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: 0.2,
        borderBottomColor: Color.Color_B3,
        backgroundColor: Color.Color_B10
    },
    adoptionTextBox: {
        flexDirection: 'row'
    },
    adoptionText: {
        bottom: 3,
        fontStyle: 'italic'
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Color.Color_B4,
        borderTopStartRadius: 10,
        borderTopEndRadius: 10,
        width: '100%',
        height: 60
    },
    convBoxLeft: {
        marginRight: 10,
        bottom: 10
    },
    convBoxRight: {
        bottom: 10
    },
    convBoxNearbyRight: {
        bottom: 6
    },
    convBox: {
        height: 85,
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
    topMessageAdoption: {
        fontSize: 15,
        marginTop: 35,
        marginBottom: 3,
        paddingLeft: 3,
        fontWeight: 'bold'
    },
    topMessageComment: {
        fontSize: 15,
        marginBottom: 3,
        paddingLeft: 3,
        fontWeight: 'bold'
    },
    topMessageNearby: {
        fontSize: 15,
        marginBottom: 3,
        paddingLeft: 3,
        fontWeight: 'bold'
    },
    commentText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    adoptionTime: {
        fontSize: 11,
        width: 100,
        left: 187,
        top: 113,
        position: 'absolute',
    },
    commentTime: {
        fontSize: 11,
        width: 100,
        left: 187,
        top: 53,
        position: 'absolute',
    },
    nearbyTime: {
        fontSize: 11,
        width: 100,
        left: 187,
        top: 63,
        position: 'absolute',
    },
    nearbyConvBox: {
        height: 95,
        width: '100%',
        paddingHorizontal: 7,
        // paddingVertical: 5,
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: 0.2,
        borderBottomColor: Color.Color_B3,
        backgroundColor: Color.Color_B10
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
    topBarText: {
        fontSize: 19
    },
    postPhoto: {
        aspectRatio: 1,
        width: 50,
        borderRadius: 10
    }
  });

