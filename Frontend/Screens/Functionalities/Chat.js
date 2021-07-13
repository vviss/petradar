import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, FlatList } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsFocused } from '@react-navigation/native';

import firebase from 'firebase';
require('firebase/firestore');
// require('firebase/firebase-storage');

import * as Color from '../../assets/Colors';

import hostLink from '../../assets/ngrokHost';
import axios from 'axios';

export default function Chat(props) {

    const isFocused = useIsFocused();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const [senderUid, setSenderUid] = useState(firebase.auth().currentUser.uid);
    const [recipientUid, setRecipientUid] = useState(props.route.params.recipient);


    const getMyInfo = (uid) => {
        axios.get(`${hostLink}/getUser/${uid}`).then(res => {
        // console.log('from axios:', res.data)  
        setSenderInfo({name: res.data.name, 
            uid: res.data.uid,
            photo: res.data.photo});
        }).catch(err => {
            console.log(err, 'failed to fetch user')
          })
        }

    const getTheirInfo = (uid) => {
        axios.get(`${hostLink}/getUser/${uid}`).then(res => {
        // console.log('from axios:', res.data)  
        setRecipientInfo({name: res.data.name, 
            uid: res.data.uid,
            photo: res.data.photo});
        }).catch(err => {
            console.log(err, 'failed to fetch user')
            })
        }

    const [senderInfo, setSenderInfo] = useState({});
    const [recipientInfo, setRecipientInfo] = useState({});

    const path = [recipientUid, senderUid].sort();

    const timeFormat = (creation) => {
        if(creation) {
        creation = JSON.stringify(creation.toDate());
        let date = creation.split('T')[0].slice(1);
        let time = creation.split('T')[1].slice(0,5);
        let timestamp = date + ', ' + time;
        return timestamp;
        }
    }

    const sendMessage = (message) => {
        if(message) {
            //Inside conversation window//
            firebase.firestore()
            .collection('Chats')
            .doc(`${path[0]}_${path[1]}`)
            .collection('Messages')
            .add({
                message,
                from: senderUid,
                to: recipientUid,
                creation: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                // console.log('from add');
            }).catch(() => {
                console.log('error sending message');
            })

            //All conversations window for sender//
            firebase.firestore()
            .collection(senderUid)
            .doc(recipientUid)
            .set({
               message,
               seen: true,
               updated: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
               // console.log('from add screen');
            })

            //All conversations window for receiver//
            firebase.firestore()
            .collection(recipientUid)
            .doc(senderUid)
            .set({
               message,
               seen: false,
               updated: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
               // console.log('from add screen');
            })

        setMessage('');
        }
    }

    const flatList = useRef(null);

  
    useEffect(() => {
        // console.log('from chat:', firebase.auth().currentUser.uid);
        getMyInfo(senderUid);
        getTheirInfo(recipientUid);
    
        firebase.firestore()
        .collection('Chats')
        .doc(`${path[0]}_${path[1]}`)
        .collection('Messages')
        .onSnapshot((collection) => {
            firebase.firestore()
            .collection('Chats')
            .doc(`${path[0]}_${path[1]}`)
            .collection('Messages')
            .orderBy('creation', 'asc')
            .get()
            .then((snapshot) => {
            // console.log('from Chat hook:', snapshot.docs);
                let msgs = snapshot.docs.map(doc => doc.data());
                setMessages(msgs);
                // console.log('retrieved:', msgs);
            })


            })
    }, [])



    useEffect(() => {
        // console.log('recipientInfo:', recipientInfo)
        if(isFocused) {
            firebase.firestore()
            .collection(senderUid)
            .doc(recipientUid)
            .update({
                seen: true
            })
        }
    })


    return (
        <View style={styles.backgroundContainer}>
            <View style={styles.topBar}>
                
                
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => props.navigation.navigate('Main')}>
                    <MaterialCommunityIcons 
                        size={30} 
                        name='arrow-left'
                        color={Color.Color_B4}/>
                </TouchableOpacity>
                
                <Image
                    style={styles.topBarPhoto} 
                    source={{uri: recipientInfo.photo}} />
                <Text style={styles.topBarText}>
                  {recipientInfo.name}
                </Text>
            </View>

            
        <View style={styles.list}>
            <FlatList
                horizontal={false}
                data={messages}
                ref={flatList}
                onContentSizeChange={() => flatList.current.scrollToEnd()}
                keyExtractor={(item) => JSON.stringify(item.creation)}
                renderItem={({item}) => ((
                    <View>

                        <View style={item.from === senderUid
                            ? styles.messageSentBox : styles.messageReceivedBox}>

                            <Text style={item.from === senderUid
                            ? styles.messageSentText : styles.messageReceivedText}>
                            {item.message}
                            </Text> 

                            <Text style={item.from === senderUid
                            ? styles.sentTime : styles.receivedTime}>
                            {timeFormat(item.creation)}
                            </Text>

                        </View>

                    </View>
                ))} />
        </View>









            <View style={styles.bottomBar}>
                <TextInput
                    value={message}
                    placeholder='Type a message..'
                    onChangeText={message => setMessage(message)} 
                    style={styles.input}/>
                <TouchableOpacity 
                    style={styles.sendButton}
                    onPress={() => sendMessage(message)}>
                    <MaterialCommunityIcons 
                        size={20} 
                        name='send'
                        color='white'/>
                </TouchableOpacity>
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
    input: {
        height: 40,
        backgroundColor: Color.Color_W3,
        width: '75%',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginRight: 15,
        marginLeft: 5,
    },
    list: {
        flex: 1,
        width: '100%',
        // marginBottom: 20,
    },
    messageReceivedText: {
        color: '#000',
        alignSelf: 'flex-start',
        backgroundColor: Color.Color_B1,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    messageReceivedBox: {
        alignSelf: 'flex-start',
        marginLeft: 7,
        // marginBottom: 5,
        maxWidth: 300,
        marginTop: 5,
    },
    messageSentText: {
        color: '#fff',
        alignSelf: 'flex-end',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 10,
        backgroundColor: Color.Color_B8
    },
    messageSentBox: {
        alignSelf: 'flex-end',
        marginRight: 7,
        marginTop: 5,
        // marginBottom: 5,
        maxWidth: 300

    },
    receivedTime: {
        fontSize: 8,
        marginLeft: 3,
        fontStyle: 'italic',
        alignSelf: 'flex-start',
    },
    sendButton: {
        backgroundColor: Color.Color_G5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        borderRadius: 15,
        width: 50,
        height: 40
    },
    sentTime: {
        fontSize: 8,
        marginRight: 3,
        alignSelf: 'flex-end',
        fontStyle: 'italic'
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
  });

