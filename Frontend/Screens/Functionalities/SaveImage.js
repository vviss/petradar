import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsFocused } from '@react-navigation/native';

import * as Color from '../../assets/Colors';

import firebase from 'firebase';
require('firebase/firestore');
require('firebase/firebase-storage');

import axios from 'axios';
import hostLink from '../../assets/ngrokHost';

// import Model from './Model';

import cat_lost from '../../assets/icons/cat_lost.png'; 
import cat_found from '../../assets/icons/cat_found.png';
import dog_lost from '../../assets/icons/dog_lost.png'; 
import dog_found from '../../assets/icons/dog_found.png'; 

import Uploading from './Uploading'; 


export default function SaveImage(props){

    // console.log('FROM SAVEIMAGE')
    const isFocused = useIsFocused();

    // State variables for controlled input fields
    const [petName, setPetName] = useState('');
    const [petAge, setPetAge] = useState('');
    const [petDescription, setPetDescription] = useState('');
    const [petReward, setPetReward] = useState('');
    const [uploadMsg, setUploadMsg] = useState('Creating post..');


    // State variables for dynamic color theme
    const caseType = props.route.params.caseType;
    const petType = props.route.params.petType;
    const petGender = props.route.params.petGender;
    const allPosts = props.route.params.allPosts;
    const image = props.route.params.image;

    const [isLoading, setIsLoading] = useState(false);

    // console.log({...props.route.params, allPosts: 'allPost label'});

    const petIcon = () => {
      // console.log(`${petType} ${caseType}`);
      switch(`${petType} ${caseType}`) {
        case 'Cat Found':
          return cat_found;
          break;
        case 'Cat Lost':
          return cat_lost;
          break;
        case 'Dog Found':
          return dog_found;
          break;
        case 'Dog Lost':
          return dog_lost;
          break;
      }
    }
 
    // Case type affects color theme
    const theme = {
      Lost: {
        Color_1: Color.Color_O1,
        Color_2: Color.Color_O2,
        Color_3: Color.Color_O2
      },
      Found: {
        Color_1: Color.Color_G5,
        Color_2: Color.Color_G4,
        Color_3: Color.Color_G5

      }
    }

    const [colorTheme, setColorTheme] = useState(theme[`${caseType}`]);


    // useEffect(() => {
    //   // console.log('SaveImage window in focus:', isFocused);
    // })

    useEffect(() => {
     console.log('from saveimage componentDidMount:', uploadMsg);
     }, [uploadMsg])

    const getDistanceFromLatLonInKm = (ptA, ptB) => {
      let lat1 = ptA['latitude'];
      let lon1 = ptA['longitude'];
      let lat2 = ptB['latitude'];
      let lon2 = ptB['longitude'];

      let R = 6371;
      let dLat = deg2rad(lat2-lat1);
      let dLon = deg2rad(lon2-lon1); 
      let a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      let d = R * c;
      return d;
    }
    
    const deg2rad = deg => {
      return deg * (Math.PI/180)
    }

    const nearbyPets = allPosts.filter(post => {
      if(props.route.params.petType === post.petType) {
        if(props.route.params.caseType === 'Found') {
          if(post.caseType === 'Lost') {
            if(getDistanceFromLatLonInKm(props.route.params.location, post.location) < 2) {    
              return post;
            }
          }
        }
      }
    })


    const createPost = (downloadURL) => {
      // console.log('Download URL:', downloadURL);
      let data = {
          uid: firebase.auth().currentUser.uid,
          downloadURL,
          petType,
          petGender,
          caseType,
          location: JSON.stringify(props.route.params.location),
          petName,
          petAge,
          description: petDescription,
          reward: petReward 
         }
      

      axios.post(`${hostLink}/addUserpost`, data).then(res => {
        console.log('From axios, Userpost added successfully');
        notifyNearby(data);
        if(caseType === 'Found') {
          setUploadMsg(`The radar alerted ${nearbyPets.length} user${(nearbyPets.length != 1) ? 's' : ''}\nwho lost their ${petType.toLowerCase()}${nearbyPets.length > 1 ? 's' : ''} nearby`)
        }
        setTimeout(() => {

          setIsLoading(false);
          props.navigation.navigate('Main');
        
        }, 2500)

      }).catch(err => {
        console.log(err, 'From axios, Failed to add Userpost');
      })
      }

    async function notifyNearby(current){
      // console.log('from notififyNearby', current);

      for(let i of nearbyPets) {
        await
        firebase.firestore()
        .collection('Notifications')
        .doc(i.uid)
        .collection('Comments')
        .add({
            type: 'nearby',
            lost: i,
            found: current,
            seen: false,
            creation: firebase.firestore.FieldValue.serverTimestamp()
        })
        }
      console.log(`posted ${nearbyPets.length} nearby notification(s) to firebase`);
    }

    const uploadWrap = async () => {
      setIsLoading(true);
      upload();

    }

    const upload = async () => {
      const res = await fetch(props.route.params.image);
      const blob = await res.blob();
      const path = `post/${firebase.auth().currentUser.uid}/${Date.now().toString()}`
      
      const process = firebase
        .storage()
        .ref()
        .child(path)
        .put(blob);

      const progress = () => {
        console.log('From progress, KBs transferred:', 
          process.snapshot.bytesTransferred / 1024);
      }

      const done = () => {
        process.snapshot.ref.getDownloadURL()
        .then((snapshot) => {
          console.log('From done, snapshot:', snapshot);
          createPost(snapshot);
        })
      }

      const error = snapshot => {
        console.log('From error, snapshot:', snapshot);
      }

      process.on('state_changed', progress, error, done);
    }

    return (
      
    <View style={{flex: 1}}>
    { isLoading && 
      <Uploading message={uploadMsg}/>
    }
    
    { !isLoading && (
      <ScrollView>
        
        <View style={styles.backgroundContainer}>
          <View style={styles.topContainer}>
            
            <Text style={{...styles.titleTopText, 
              width: 187,
              borderBottomColor: colorTheme.Color_1}}>
              You're almost done!
            </Text>

            <Text style={{...styles.titleBottomText, marginTop: 3}}>
              But the radar needs to know more..
            </Text>

            <View style={{...styles.imageContainer, backgroundColor: colorTheme.Color_1}}>
              <Image 
                style={styles.image}
                source={{uri: image}}/>
            </View>
              
            <View style={{...styles.petIconContainer, borderColor: colorTheme.Color_1}}>
              <Image 
                source={petIcon()}
                style={styles.petIcon}/>
            </View>

          </View>



          <View style={{...styles.bottomContainer,
            height: (caseType === 'Lost' ? 610 : 500)
            }}>
            <Text style={{...styles.titleTopText,
              width: 150, 
              borderBottomColor: colorTheme.Color_1}}>
              Details, please?
            </Text>
            <View>

            { caseType === 'Lost' 
              ? 
              <Text style={{...styles.titleBottomText, marginTop: 5}}>
                This will help other people recognize 
                your lost {petType.toLowerCase()} 
                {''} if they see {petGender === 'Male' ? 'him' : 'her'}
              </Text>
              :
              <Text style={{...styles.titleBottomText, marginTop: 5}}>
                Let's help this {petType.toLowerCase()}'s guardian recognize 
                {petGender === 'Male' ? ' him' : ' her'}. 
              </Text>
              }

              { caseType === 'Found' && 
                <Text style={{...styles.titleBottomText, marginTop: 3}}>
                  If {petGender === 'male' ? 'he' : 'she'} is a stray, 
                  {petGender === 'male' ? ' he' : ' she'} might even find 
                  {'\n'} a new home!
                </Text>
                }

            </View>


            <View style={{...styles.form, 
              backgroundColor: colorTheme.Color_3,
              height: (caseType === 'Lost' ? 385 : 250)
              }}>

              <View style={styles.inputContainer}>
                {caseType === 'Lost' &&
                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>
                      What's your {petType.toLowerCase()} called?
                    </Text>  
                    <TextInput 
                      placeholder='Pet name..'
                      autoCapitalize='words'
                      onChangeText={petName => setPetName(petName)}
                      style={styles.input}/>
                  </View>
                }
            
                {caseType === 'Lost' &&
                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>
                    How old is {petGender === 'male' ? 'he' : 'she'}?  
                    </Text>
                    <TextInput 
                      placeholder='Pet age..'
                      keyboardType='numeric'
                      onChangeText={petAge => setPetAge(petAge)} 
                      style={styles.input}/>
                  </View>        
                  }

                {caseType === 'Lost' &&
                  <View style={styles.inputBox}>  
                    <Text style={styles.inputLabel}>
                    Reward (optional)
                    </Text>
                    <TextInput
                      placeholder='Amount (LBP)'
                      keyboardType='numeric'
                      onChangeText={petReward => setPetReward(petReward)}
                      style={styles.input}/>
                  </View>
                }

                <View style={styles.inputBox}>  
                  <Text style={styles.inputLabel}>
                    Anything else we should know?
                  </Text>
                  <TextInput
                    multiline={true}
                    placeholder='ex: "Wearing a red collar, has a brown spot on their back"'
                    onChangeText={petDescription => setPetDescription(petDescription)}
                    style={{...styles.input, 
                      height: (caseType === 'Lost' ? 100 : 180),
                      marginTop: (caseType === 'Lost' ? 0 : 3), 
                      paddingBottom: 0,
                      textAlignVertical: 'top'}}/>
                </View>

              </View>
            </View>

            <View style={styles.activeButtonsContainer}>  
              <TouchableOpacity 
                style={styles.activeCancelButton}
                onPress={() => props.navigation.navigate('Main')}>
                <MaterialCommunityIcons 
                  name='close-thick' 
                  size={50}
                  color='white'/>  
                <Text style={{color: '#fff'}}>Cancel</Text>
              </TouchableOpacity>
              { ((petName && petAge && petDescription)
                || (petDescription && caseType === 'Found')) 
                ?
                <TouchableOpacity 
                  style={styles.activeSaveButton}
                  onPress={() => uploadWrap()}>
                  <MaterialCommunityIcons 
                    name='content-save' 
                    size={50}
                    color='white'/>
                  <Text style={{color: '#fff'}}>Post</Text>
                </TouchableOpacity>
                :
                <View style={{...styles.activeSaveButton, 
                  backgroundColor: Color.Color_W2}}>
                  <MaterialCommunityIcons 
                    name='content-save' 
                    size={50}
                    color='white'/>
                  <Text style={{color: '#fff'}}>Post</Text>
                </View>
              }
        
            </View>
          </View>
        </View>

      </ScrollView>
    )}
    </View>
  )
}

const styles = StyleSheet.create({
  activeButtonsContainer: {
    justifyContent: 'center',
    padding: 15,
    paddingBottom: 12,
    width: 150,
    flexDirection: 'row',
    alignSelf: 'center'
  },
  activeCancelButton: {
    width: 75,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.Color_R4,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10
  },
  activeSaveButton: {
    width: 75,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.Color_G4,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10
  },
  backgroundContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.Color_B4
  },
  bottomContainer: {
    width: '90%',
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: Color.Color_W5
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 100,
    borderRadius: 10,
    margin: 5
  },
  form: {
    width: 290,
    // alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 15,
    // borderWidth: 3,
  },
  image: {
    borderRadius: 10,
    aspectRatio: 1/1,
    height: 190,
  },
  imageContainer: {
    height: 203,
    width: 203,
    marginTop: 25,
    borderRadius: 10,
    backgroundColor: Color.Color_B4,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
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
    marginLeft: 22,
    marginBottom: 3
  },
  petIcon: {
    aspectRatio: 1,
    height: 35,
    width: 35
  },
  petIconContainer: {
    padding: 5,
    borderRadius: 100,
    bottom: 35,
    right: 95,
    width: 55,
    height: 55,
    borderWidth: 3,
    backgroundColor: 'rgba(235,235,235,1)',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  topContainer: {
    height: 328,
    width: '90%',
    marginVertical: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: Color.Color_W5
  },
  titleBottomText: {

    fontSize: 14,
    marginLeft: 5,
  },
  titleTopText: {
    fontStyle: 'italic',
    fontSize: 21,
    fontWeight: 'bold',
    marginLeft: 5,
    borderBottomWidth: 2,
  },
});
