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

export default function ChatTab(props) {

    const [conversations, setConversations] = useState([]);
    const [senderUid, setSenderUid] = useState(firebase.auth().currentUser.uid);
    
    const [userPhotos, setUserPhotos] = useState({});
    const [userNames, setUserNames] = useState({});

    const getUsersInfo = () => {
        axios.get(`${hostLink}/listUsers`).then(res => {
          // console.log('Data fetched from getAllUsers: ', res.data);
          
          let usersNames = {}
          let usersPhotos = {}
          // let usersUids = {}
  
          for (let i=0; i<res.data.length; i++) {
            // usersUids[res.data[i].uid] = res.data[i].uid;
            usersNames[res.data[i].uid] = res.data[i].name;
            usersPhotos[res.data[i].uid] = res.data[i].photo;
          }
          
          // console.log('usersInfo dictionary');
          setUserNames(usersNames);
          setUserPhotos(usersPhotos);
        }).catch(err => {
          console.log(err, 'failed to fetch users')
        })
      }

    // const path = [recipientUid, senderUid].sort()

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

  
    useEffect(() => {
        // console.log('from chat:', firebase.auth().currentUser.uid);
        // getTheirInfo(recipientUid);
    

        firebase.firestore()
        .collection(firebase.auth().currentUser.uid)
        .onSnapshot((collection) => {
            firebase.firestore()
            .collection(firebase.auth().currentUser.uid)
            .orderBy('updated', 'desc')
            .get()
            .then((snapshot) => {
                // console.log('from fetchConversations:', snapshot.docs);

                let convs = snapshot.docs.map(doc => {
                    const id = doc.id;
                    const data = doc.data();
                    return { id, ...data };
                })

                setConversations(convs);
                getUsersInfo();
                // console.log('conversations after mapping:', convs);
            })
        })
    }, [])



    return (
        <View style={styles.backgroundContainer}>
            <View style={styles.topBar}>
                <Text style={styles.topBarText}>Chats</Text>
            </View>

            <View style={styles.list}>
                <FlatList
                    horizontal={false}
                    data={conversations}
                    ref={flatList}
                    onContentSizeChange={() => flatList.current.scrollToEnd()}
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => ((
                        <TouchableOpacity
                            style={styles.convBox}
                            onPress={() => props.navigation.navigate('Chat', {recipient: item.id})}>
                                
                                <View style={styles.convBoxLeft}>
                                    <Image
                                        style={styles.userPhoto} 
                                        source={{uri: userPhotos[item.id]}} />
                                </View>

                                <View style={styles.convBoxRight}>

                                    <Text style={item.seen 
                                        ? styles.messageSeenName
                                        : styles.messageUnseenName}>
                                        {userNames[item.id]}
                                    </Text>

                                    <View style={{flexDirection: 'row'}}>
                                        <Text style={item.seen 
                                            ? styles.messageSeenText
                                            : styles.messageUnseenText}>
                                            "{messageFormat(item.message)}"
                                        </Text> 

                                        { !item.seen &&
                                        <MaterialCommunityIcons 
                                            size={15} 
                                            name='checkbox-blank-circle'
                                            color={Color.Color_R8}
                                            style={styles.messageUnseenIcon}/>
                                        }
                                    </View>
                                    <Text style={styles.messageTime}>
                                    {timeFormat(item.updated)}
                                    </Text>
                                </View>


                        </TouchableOpacity>
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

