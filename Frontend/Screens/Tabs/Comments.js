import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, FlatList, LogBox, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Color from '../../assets/Colors';

import firebase from 'firebase';
import hostLink from '../../assets/ngrokHost';
import axios from 'axios';

export default function Comments(props) {
  
    const numOfCols = 1;
    const [items, setItems] = useState([]);
    const [names, setNames] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [editingID, setEditingID] = useState(null);
    const [editComment, setEditComment] = useState("");
    const [newComment, setNewComment] = useState("");

    const [refresh, setRefresh] = useState(false);

    const onDeleteCommentPress = (id) => {
      axios.delete(`${hostLink}/deleteComment/${id}`).then(res => {
        // console.log('From deleteComment axios: ', res.data);
        setRefresh(!refresh);
      }).catch(err => {
        console.log(err, 'Failed to delete comment ID:', id);
      })
    }

    const onEditCommentPress = (id, text) => {
      setEditingID(id);
      setEditComment(text);
      console.log('Currently editing comment:\n', id, text);
    }

    const onEditTextChange = text => {
      setEditComment(text);
    }

    const onEditCancelPress = () => {
      setEditingID(null);
      setEditComment("");
    }

    const onEditSavePress = () => {
      console.log('from save edit, req data:', editingID, editComment);
      axios.put(`${hostLink}/editComment/${editingID}`, {text: editComment}).then(res => {
        // console.log('Comment edited successfully', res);
        setEditingID(null);
        setEditComment("");
        setRefresh(!refresh);
      }).catch(err => {
        console.log(err, 'Failed to edit comment');
      })
    };

    const getAllComments = () => {
      axios.get(`${hostLink}/listComments`).then(res => {
        // console.log('Data fetched from getAllComments: ', res.data);
        let pidComments = res.data.filter(comment => comment.pid == props.item.id);
        setItems(pidComments);
      }).catch(err => {
        console.log(err, 'failed to fetch comments')
      })
    }

    const getAllUsers = () => {
      axios.get(`${hostLink}/listUsers`).then(res => {
        // console.log('Data fetched from getAllUsers: ', res.data);
        
        let usersNames = {}
        let usersPhotos = {}

        for (let i=0; i<res.data.length; i++) {
          usersNames[res.data[i].uid] = res.data[i].name;
          usersPhotos[res.data[i].uid] = res.data[i].photo;
        }
        
        // console.log('usersInfo dictionary');
        setNames(usersNames);
        setPhotos(usersPhotos);
      }).catch(err => {
        console.log(err, 'failed to fetch users')
      })
    }

    const timeFormat = (created_at_str) => {
      let date = created_at_str.split('T')[0];
      let time = created_at_str.split('T')[1].slice(0,5);
      let res = `${date}, at ${time}`;
      return res
    }

    const onSubmitPress = () => {
      if (!newComment) {
        alert("Text field cannot be empty");
        return;
      } else {
        const data = { 
          pid: props.item.id, 
          uid: firebase.auth().currentUser.uid,
          type: 'comment',
          text: newComment }
        // console.log('comment to be posted:',data)
        axios.post(`${hostLink}/addComment`, data).then(res => {
          // console.log('Comment added successfully', res);
          setNewComment('');
          setRefresh(!refresh);
        }).catch(err => {
          alert('Failed to add comment');
        })

        if(firebase.auth().currentUser.uid !== props.item.uid) {
          firebase.firestore()
          .collection('Notifications')
          .doc(props.item.uid)
          .collection('Comments')
          .add({
              comment: newComment,
              type: 'comment',
              from: names[firebase.auth().currentUser.uid],
              item: props.item,
              seen: false,
              creation: firebase.firestore.FieldValue.serverTimestamp()
          }).then(() => {
              // console.log('from add');
              }) 
        }
      }
    };



    useEffect(() => {
      getAllUsers();
      getAllComments();
      console.log('from post ', props.item)
    }, [refresh])
    
    useEffect(() => {
      LogBox.ignoreLogs(['VirtualizedLists']);      
    })


    return (
      <View style={styles.backgroundContainer}>
        
        <View style={styles.list}>

          <FlatList
            numColumns={numOfCols}
            key={numOfCols}
            horizontal={false}
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => ((
              <View style={styles.commentContainer}>
                <View style={styles.commentInfo}>
                  <Image 
                    style={styles.profilePic}
                    source={{uri: photos[item.uid]}}/>
                  <View style={styles.commentInfoText}>
                  <View style={{flexDirection: 'row'}}>
                    <Text
                      style={{fontWeight: 'bold'}}>By: </Text>
                    <Text>{names[item.uid]}</Text>
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <Text
                      style={{fontWeight: 'bold'}}>On: </Text> 
                    <Text>{timeFormat(item.created_at)}</Text>
                  </View>
                  </View>

                </View>

                { firebase.auth().currentUser.uid !== item.uid &&
                
                <TouchableOpacity 
                  onPress={() => props.navigation.navigate('Chat', {recipient: item.uid})}
                  style={styles.chatButton}>
                  <MaterialCommunityIcons 
                    color={Color.Color_B12}
                    name='chat' 
                    size={26} />
                </TouchableOpacity>

              }

              <View style={styles.commentTextContainer}>
              { editingID != item.id &&
                <>
                <MaterialCommunityIcons 
                  size={20} 
                  color={Color.Color_B4} 
                  name='format-quote-open' 
                  style={{alignSelf: 'flex-start'}}
                  />
                <Text style={styles.commentText}>{item.text}</Text>
                <MaterialCommunityIcons 
                  size={20} 
                  color={Color.Color_B4} 
                  name='format-quote-close' 
                  style={{alignSelf: 'flex-end', 
                    marginBottom: 15}}
                  />
                </> }

                { firebase.auth().currentUser.uid === item.uid &&
              <View style={styles.buttonsContainer}>
                { editingID != item.id &&
                <View style={{flexDirection: 'row'}}>
                <TouchableOpacity 
                  onPress={() => onEditCommentPress(item.id, item.text)}
                  style={styles.button}>
                  <MaterialCommunityIcons name='pencil' size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDeleteCommentPress(item.id)}
                  style={styles.button}>
                  <MaterialCommunityIcons name='delete' size={20} />
                </TouchableOpacity>
                </View> }
                { editingID == item.id &&
                <View style={{flexDirection: 'row'}}>
                <TouchableOpacity 
                  onPress={() => onEditSavePress()}
                  style={styles.button}>
                  <MaterialCommunityIcons name='content-save' size={20} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => onEditCancelPress()}
                  style={styles.button}>
                  <MaterialCommunityIcons name='close-circle' size={20} />
                </TouchableOpacity>
                </View> }
              </View>
              }

              { editingID == item.id &&
                <TextInput
                  value={editComment}
                  onChangeText={onEditTextChange}/>}
              </View>


            </View>
              ))} />

        </View>
      
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={'Write new comment..'}
            placeholderTextColor={'rgba(55,55,55,0.7)'}
            onChangeText={newComment => setNewComment(newComment)} 
            value={newComment}
            style={styles.input}/>
          <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={onSubmitPress}
              style={styles.submitButton}>
                <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>



        </View>
              
      </View>
    )
}

const styles = StyleSheet.create({

    backgroundContainer: {
      flex: 1,
      // height: '100%',
      // justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Color.Color_W1
    },
    button: {
      // paddingRight: 3
    },
    chatButton: {
      position: 'absolute',
      right: 5,
      top: 10
    },
    buttonsContainer: {
      flexDirection: 'row',
      alignSelf: 'flex-end',
      marginBottom: 2,
    },
    buttonText: {
      color: '#fff',
    },
    commentContainer: {
      width: 280,
      borderBottomWidth: .4,
      borderBottomColor: 'red',
      marginTop: 15
    },
    commentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10
    },
    commentText: {
      fontStyle: 'italic',
      alignSelf: 'center',
      paddingVertical: 5,
      // marginBottom: 15,
      width: '80%'
    },
    commentTextContainer: {
      backgroundColor: Color.Color_W1,
      borderRadius: 5
    },
    input: {
      backgroundColor: '#fff',
      height: 188,
      width: 268,
      right: 10,
      borderRadius: 10,
      padding: 10,
      paddingBottom: 150,
      color: Color.Color_G2,
    },
    inputContainer: {
      width: 280,
      height: 200,
      top: -13,
      borderRadius: 10,
      backgroundColor: Color.Color_B5,
      padding: 15,
      justifyContent: 'center',
      marginTop: 30,
      bottom: 33,
      borderColor: '#fff',
      borderWidth: 1,
    },
    list: {
      flex: 1,
      // justifyContent: 'center',
      alignItems: 'center',
    },
    profilePic: {
      aspectRatio: 1/1,
      height: 40,
      borderRadius: 10,
      marginRight: 7
    },
    submitButton: {
      alignSelf: 'flex-end',
      right: 20,
      top: 135,
      position: 'absolute',
      marginBottom: 32,
      backgroundColor: Color.Color_B4,
      borderRadius: 8,
      // borderWidth: 0.1,
      width: 100,
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: "#000",
      shadowOffset: {
        width: 11,
        height: 6,
      },
      shadowOpacity: 0.67,
      shadowRadius: 4.49,
      elevation: 5,
    },
    submitButton_dumped: {
      backgroundColor: Color.Color_G2,
      width: 150,
      height: 40,
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      marginTop: 15
    }
  });
