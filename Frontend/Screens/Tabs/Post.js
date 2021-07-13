import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Modal, View, Image, TextInput, TouchableOpacity, LogBox, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// import { connect } from 'react-redux';

// import { fetchUser, fetchUserPosts } from '../../redux/actions';
// import { bindActionCreators } from 'redux';

import * as Color from '../../assets/Colors';

import firebase from 'firebase';
import hostLink from '../../assets/ngrokHost';
import axios from 'axios';

import Comments from './Comments';

export default function Post(props) {

    const [item, setItem] = useState(props.route.params.item);
    const [owner, setOwner] = useState({});
    const [myInfo, setMyInfo] = useState({});

    const [refresh, setRefresh] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [safeDelete, setSafeDelete] = useState(false);
    const [mainOpacity, setMainOpacity] = useState(1);

    const [formName, setFormName] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formEmail, setFormEmail] = useState('');


    const deletePost = () => {
      if(safeDelete && !item.gwCats) {
        axios.delete(`${hostLink}/deleteUserpost/${props.route.params.item.id}`).then(res => {
          // console.log('From deletePost axios: ', res.data);
          props.navigation.navigate('Main');
        }).catch(err => {
          console.log(err, 'Failed to delete post ID:', props.route.params.item.id);
        })
      }

      if(safeDelete && item.gwCats) {
        axios.delete(`${hostLink}/deleteNgoPost/${props.route.params.item.id}`).then(res => {
          // console.log('From deleteNgoPost axios: ', res.data);
          props.navigation.navigate('Main');
        }).catch(err => {
          console.log(err, 'Failed to delete ngo post ID:', props.route.params.item.id);
        })
      }

      setSafeDelete(true);
    }

    const getOwner = (uid) => {
      axios.get(`${hostLink}/getUser/${uid}`).then(res => {
        // console.log('User fetched from getUser: ', res.data.name);
        setOwner({name: res.data.name, 
          photo: res.data.photo});
      }).catch(err => {
          console.log(err, 'failed to fetch post owner')
        })
      }

    const getMyInfo = (uid) => {
      axios.get(`${hostLink}/getUser/${uid}`).then(res => {
        // console.log('User fetched from getUser: ', res.data);
        setMyInfo({name: res.data.name, 
          photo: res.data.photo,
          email: res.data.email});
      }).catch(err => {
          console.log(err, 'failed to fetch current user')
        })
      }

    useEffect(() => {
      getOwner(props.route.params.item.uid);
      getMyInfo(firebase.auth().currentUser.uid);
      // console.log('from post ', firebase.auth().currentUser.uid);

    }, [refresh])
    
    useEffect(() => {
      LogBox.ignoreLogs(['VirtualizedLists']);      
    })

    const timeFormat = (created_at_str) => {
      let date = created_at_str.split('T')[0];
      let time = created_at_str.split('T')[1].slice(0,5);
      let res = `${date}, at ${time}`;
      return res
    }

    const onPressAdopt = () => {
      setModalVisible(true);
      setMainOpacity(0.15);
      setFormName(myInfo.name);
      setFormEmail(myInfo.email);
    }

    const onCancelAdopt = () => {
      setModalVisible(false);
      setMainOpacity(1);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
    }

    const onSubmitForm = () => {
      onCancelAdopt();

      const data = { 
        type: 'adoption',
        name: formName,
        email: formEmail,
        phone: formPhone,
        seen: false,
        item: props.route.params.item
      }
      // console.log('form data for notification:',data)

      firebase.firestore()
        .collection('Notifications')
        .doc(props.route.params.item.uid)
        .collection('Comments')
        .add({
            ...data,
            creation: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log('from fill form');
            }) 

    }


    return (
    <ScrollView style={{opacity: mainOpacity}}>
      <View style={styles.backgroundContainer}>
      
        <View style={styles.postContainer}>
         <View style={styles.postBody}>

          <View style={styles.postHeader}>
            {/* <Text style={styles.categoryTitle}>Post by</Text> */}
            <View style={styles.postInfo}>
              <Image 
                style={styles.profilePic}
                source={{uri: owner.photo}}/>
              <View style={styles.postInfoText}>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{fontWeight: 'bold'}}>By: </Text>
                <Text>{owner.name}</Text>
              </View>
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{fontWeight: 'bold'}}>On: </Text> 
                <Text>{timeFormat(item.created_at)}</Text>
              </View>


            </View>
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => props.navigation.navigate('Chat', {recipient: item.uid})}>
              <MaterialCommunityIcons 
                name='chat' 
                size={30}
                color={Color.Color_B4}/>  
            </TouchableOpacity>
          </View>
        </View>

        <Image
          style={item.caseType === 'Found' ? {...styles.image} : {...styles.image, borderColor: Color.Color_R2}} 
          source={{uri: item.downloadURL}} />

        { item.caseType &&
        <View style={styles.postText}>
          <Text style={styles.categoryTitle}>Case:</Text>
          <Text>{item.caseType} {item.petType.toLowerCase()}</Text>
        </View>
        }

        {item.caseType === "Lost" &&
          <View style={styles.postText}>
            <Text style={styles.categoryTitle}>Name:</Text>
            <Text>{item.petName}</Text>
          </View>}

        {item.caseType === "Lost" &&
          <View style={styles.postText}>
            <Text style={styles.categoryTitle}>Age:</Text>
            <Text>{item.petAge}</Text>
          </View>}


        {item.caseType === "Lost" &&
          <View style={styles.postText}>
            <Text style={styles.categoryTitle}>Gender:</Text>
            <Text>{item.petGender}</Text>
          </View>}

        {item.reward &&
          <View style={styles.postText}>
            <Text style={styles.categoryTitle}>Reward:</Text>
            <Text>LBP {item.reward}</Text>
         </View>}

        {item.gwCats &&
        <View style={styles.postText}>
          <Text style={{...styles.categoryTitle,
            fontSize: 28}}>
            {item.petName}
          </Text>
          <Text style={{fontStyle: 'italic', bottom: 2}}>
            is looking for a home!
          </Text>
        </View>}


        {item.gwCats &&
          <View style={styles.postText}>
            <Text style={styles.categoryTitle}>Spec/gender</Text>
            <Text>{item.petGender} {item.petType}</Text>
          </View>}

        {item.gwCats &&
          <View style={styles.postText}>
            <Text style={styles.categoryTitle}>Age</Text>
            <Text>{item.petAge}</Text>
          </View>}

        {item.gwCats &&
          <View style={styles.postText}>
            <Text style={styles.categoryTitle}>Friendly with</Text>
            <Text>Kids: {item.gwKids}</Text>
            <Text>Cats: {item.gwCats}</Text>
            <Text>Dogs: {item.gwDogs}</Text>
          </View>}

        { item.caseType &&
        <View style={styles.postText}>

          <Text style={styles.categoryTitle}>Description:</Text>
          <View style={{...styles.descriptionBox, 
            borderColor: item.caseType === 'Lost'
            ? Color.Color_O1
            : Color.Color_G4}}>  
            <MaterialCommunityIcons 
              size={25} 
              color={item.caseType === "Lost" ? Color.Color_O1 : Color.Color_G4} 
              name='format-quote-open' 
              style={{alignSelf: 'flex-start'}}
              />
            <Text style={styles.descriptionText}>{item.description}</Text>
            <MaterialCommunityIcons 
              size={25} 
              color={item.caseType === "Lost" ? Color.Color_O1 : Color.Color_G4}
              name='format-quote-close' 
              style={{alignSelf: 'flex-end'}}
              />
          </View>
        </View>
        }

      { item.gwCats &&
        <View style={styles.postText}>

          <Text style={{...styles.categoryTitle,
            marginTop: 10}}>
            {item.petName}'s story:
            </Text>
          <View style={{...styles.descriptionBox, 
            borderColor: Color.Color_B4}}>  
            <MaterialCommunityIcons 
              size={25} 
              color={Color.Color_B4} 
              name='format-quote-open' 
              style={{alignSelf: 'flex-start'}}
              />
            <Text style={styles.descriptionText}>{item.description}</Text>
            <MaterialCommunityIcons 
              size={25} 
              color={Color.Color_B4}
              name='format-quote-close' 
              style={{alignSelf: 'flex-end'}}
              />
          </View>
        </View>
        }

      { item.gwCats &&
        <TouchableOpacity
          activeOpacity={0.7} 
          onPress={() => onPressAdopt()}
          style={styles.adoptButton}>
          
          <MaterialCommunityIcons 
            name={'paw'}
            color='#eee' 
            size={30} />
          <Text style={styles.closeText}>
            Adopt me!
          </Text>
          
        </TouchableOpacity>
      }


        
        </View>
      </View>

      {safeDelete && 
        <View style={styles.warningView}>
          <MaterialCommunityIcons 
            name='alert'
            color={Color.Color_R4} 
            size={20} 
            style={styles.alertIcon}/>
          <Text style={{...styles.warningText, 
            marginLeft: 20,
            fontSize: 16,
            fontWeight: 'bold'}}>
            Are you sure?
          </Text>    
          <Text style={styles.warningText}>
          This cannot be undone! Other people will no longer be able to see this post.
          </Text>    
        </View>
      }


      { item.uid === firebase.auth().currentUser.uid &&
        <View style={styles.closeButtons}>
        { safeDelete &&
        <TouchableOpacity
        activeOpacity={0.7} 
        onPress={() => setSafeDelete(false)}
        style={{...styles.button, 
          backgroundColor: Color.Color_R4,
          marginRight: 5}}>

        <MaterialCommunityIcons 
          name='close-thick'
          color='#eee' 
          size={30} />
          <Text style={styles.closeText}>
            Cancel
          </Text>
        </TouchableOpacity>
        }

        <TouchableOpacity
          activeOpacity={0.7} 
          onPress={deletePost}
          style={safeDelete 
            ? {...styles.button, backgroundColor: Color.Color_G8}
            : styles.button}>
          
          <MaterialCommunityIcons 
            name={safeDelete ? 'lock-check' : 'lock'}
            color='#eee' 
            size={30} />
          { safeDelete 
            ?
            <Text style={styles.closeText}>
              Confirm
            </Text>
            :
            <Text style={styles.closeText}>
              {item.gwCats ? 'Delete' : 'Close case'}
            </Text>
          }
        </TouchableOpacity>
        </View>
        }

      </View>

      { !item.gwCats &&
      <View style={styles.commentsTitle}>
        <Text style={styles.commentsTitleText}>Comments</Text>
      </View>
      }
      

      { !item.gwCats &&
      <Comments item={props.route.params.item} navigation={props.navigation}/>
      }


      <View style={styles.centeredOuterView}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => onCancelAdopt()}>
          <View style={styles.centeredInnerView}>
            <View style={styles.modalView}>
              
              <TouchableOpacity
                style={styles.closeFormButton}
                onPress={() => onCancelAdopt()}>
                <MaterialCommunityIcons 
                  name='close-thick'
                  color='red' 
                  size={25} />
                </TouchableOpacity>

              <Text style={styles.modalText}>Please fill the form</Text>
              <Text style={styles.subModalText}>The NGO will get in touch with you</Text>

              <View style={styles.form}>

              <View style={styles.inputContainer}>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>
                    Full name: *
                  </Text>  
                  <TextInput 
                    autoCapitalize='words'
                    value={formName}
                    onChangeText={formName => setFormName(formName)}
                    style={styles.input}/>
                </View>

                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>
                    E-mail address: *
                  </Text>  
                  <TextInput 
                    placeholder={'ex: jane@gmail.com'}
                    type={'Email'}
                    onChangeText={formEmail => setFormEmail(formEmail)} 
                    value={formEmail}
                    style={styles.input}/>
                </View>

                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>
                  Phone number:  
                  </Text>
                  <TextInput 
                    placeholder='ex: +961 3 123456'
                    keyboardType='numeric'
                    value={formPhone}
                    onChangeText={formPhone => setFormPhone(formPhone)} 
                    style={styles.input}/>
                </View>        

              </View>

              <TouchableOpacity
                activeOpacity={0.7} 
                onPress={() => onSubmitForm()}
                style={(formName && formEmail) 
                  ? styles.submitButtonActive
                  : styles.submitButtonInactive}>
                
                <MaterialCommunityIcons 
                  name='email-send'
                  color='#eee' 
                  size={30} />

                  <Text style={{...styles.closeText,
                    marginLeft: 5,
                    fontSize: 16}}>
                    Send form
                  </Text>
              </TouchableOpacity>
            </View>



            </View>
          </View>
        </Modal>
      </View>



    </ScrollView>
  )
}

const styles = StyleSheet.create({

    backgroundContainer: {
      flex: 1,
      // justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 20,
      backgroundColor: Color.Color_W1
    },
    adoptButton: {
      alignSelf: 'flex-end',
      right: 32,
      marginTop: 10,
      marginBottom: 15,
      borderRadius: 3,
      backgroundColor: Color.Color_G8,
      // borderWidth: 0.1,
      width: 130,
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
    alertIcon: {
      position: 'absolute',
      top: 7,
      left: 7
    },
    button: {
      alignSelf: 'flex-end',
      right: 20,
      marginBottom: 10,
      backgroundColor: Color.Color_BL4,
      borderRadius: 3,
      // borderWidth: 0.1,
      width: 130,
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
    categoryTitle: {
      // fontStyle: 'italic',
      fontSize: 18,
      fontWeight: 'bold'
    },
    chatButton: {
      left: 20,
      top: 2
    },
    closeButtons: {
      alignSelf: 'flex-end',
      flexDirection: 'row'
    },
    closeText: {
      color: '#eee',
      fontWeight: 'bold',
      marginLeft: 2
    },
    commentsTitle: {
      justifyContent: 'center',
      alignItems: 'flex-start',
      height: 35,
      width: '50%',
      paddingLeft: 38,
      // borderWidth: 1,
    },
    commentsTitleText: {
      fontSize: 18,
      borderBottomColor: Color.Color_B3,
      borderBottomWidth: 0.5,
    },
    descriptionBox: {
      padding: 5,
      borderRadius: 5,
      borderWidth: 0.5,
      marginTop: 5,
      backgroundColor: Color.Color_W3
    },
    descriptionText: {
      fontStyle: 'italic',
      paddingHorizontal: 12
    },
    image: {
      height: 250,
      width: 250,
      marginHorizontal: 20,
      marginBottom: 20,
      marginTop: 0,
      borderRadius: 10,
      aspectRatio: 1/1,
      borderColor: Color.Color_G2,
      borderWidth: 1,
    },
    list: {
      flex: 1,
      // justifyContent: 'center',
      alignItems: 'center',
    },
    postBody: {
      // height: 495,
      width: 315,
      borderRadius: 5,
      paddingVertical: 5,
      backgroundColor: Color.Color_W6,
      // paddingTop: 10,
      justifyContent: 'center',
      alignItems: 'center'
    },
    postContainer: {
      // flexDirection: 'row',
      padding: 3,
      width: 320,
      // height: 500,
      marginTop: 5,
      // alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      // paddingTop: 10,
      marginBottom: 15,
      borderRadius: 5,
      backgroundColor: Color.Color_B4,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 12,
    },
    postHeader: {
      // alignItems: 'flex-start',
      flexDirection: 'column',
      marginVertical: 10,
      paddingLeft: 0,
      width: 250
    },
    postInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
      paddingBottom: 5,
      borderBottomWidth: 0.5,
      borderColor: Color.Color_B4

    },
    posts: {
      alignItems: 'center',
      backgroundColor: Color.Color_G1,
      marginBottom: 10,
      marginTop: 30,
      borderRadius: 10,
    },
    postText: {
      // alignItems: 'flex-start',
      flexDirection: 'column',
      marginBottom: 10,
      paddingLeft: 3,
      width: 250
    },
    profilePic: {
      aspectRatio: 1/1,
      height: 40,
      borderRadius: 10,
      marginRight: 5
    },
    title: {
      height: 40,
      width: 200,
      justifyContent: 'center',
      alignItems: 'center',
      // borderRadius: 5,
      // margin: 5,
      width: '100%',
      backgroundColor: Color.Color_G2
    },
    titleText: {
      fontSize: 20,
      color: '#fff'
    },
    warningView: {
      width: 320,
      height: 75,
      // top: 488,
      // right: 160,
      marginBottom: 10,
      // position: 'absolute',
      // alignItems: 'flex-start',
      borderRadius: 3,
      borderWidth: 0.55,
      borderColor: Color.Color_R4,
      padding: 10,
      // flexDirection: 'row',
      backgroundColor: Color.Color_W5,
      shadowColor: "#000",
      shadowOffset: {
        width: 11,
        height: 6,
      },
      shadowOpacity: 0.67,
      shadowRadius: 4.49,

      elevation: 5,
    },
    warningText: {
      bottom: 2,
      marginBottom: 2
    },
    centeredInnerView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 55,
      // paddingTop: 10
    },
    centeredOuterView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',

      // marginTop: 85,
      // paddingTop: 10
    },
    modalView: {
      margin: 20,
      marginTop: 0,
      // backgroundColor: Color.Color_G7,
      backgroundColor: '#fff',
      borderRadius: 20,
      paddingHorizontal: 35,
      paddingVertical: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalText: {
      marginTop: 20,
      fontSize: 25,
      color: Color.Color_B11,
      textAlign: 'center',
    },
    subModalText: {
      fontSize: 14,
      color: Color.Color_B11,
      textAlign: 'center',
      marginBottom: 5
    },
    input: {
      height: 40,
      width: 250,
      // margin: 3,
      padding: 3,
      borderRadius: 5,
      paddingLeft: 10,
      alignSelf: 'center',
      backgroundColor: 'rgba(242,242,242,1)'
    },
    inputBox: {
      marginVertical: 6
  
    },
    inputContainer: {
      // justifyContent: 'center',
      // alignItems: 'center',
      height: 220,
      marginBottom: 20
    },
    inputLabel: {
      right: 22,
      marginBottom: 3,
      fontWeight: 'bold',
      color: Color.Color_B11
    },
    form: {
      width: 200,
      // alignItems: 'center',
      alignSelf: 'center',
      borderRadius: 20,
      paddingVertical: 5,
      // borderWidth: 3,
    },
    closeFormButton: {
      position: 'absolute',
      top: 10,
      left: 245
    },
    submitButtonActive: {
      alignSelf: 'flex-end',
      // right: 20,
      // marginBottom: 5,
      backgroundColor: Color.Color_B4,
      borderRadius: 3,
      // borderWidth: 0.1,
      width: 130,
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
      elevation: 2,
    },
    submitButtonInactive: {
      alignSelf: 'flex-end',
      // right: 20,
      // marginBottom: 5,
      backgroundColor: Color.Color_BL5,
      borderRadius: 3,
      // borderWidth: 0.1,
      width: 130,
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
