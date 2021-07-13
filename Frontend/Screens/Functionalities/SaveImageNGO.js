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

import Uploading from './Uploading'; 

import cat from '../../assets/icons/cat.png'; 
import dog from '../../assets/icons/dog.png'; 


export default function SaveImageNGO(props){

    // console.log('FROM SAVEIMAGE')
    const isFocused = useIsFocused();
    const [uploadMsg, setUploadMsg] = useState('Creating post..');

    // State variables for controlled input fields
    const [petName, setPetName] = useState('');
    const [petAge, setPetAge] = useState('');
    const [petDescription, setPetDescription] = useState('');

    const [petGender, setPetGender] = useState('Female');
    const [petType, setPetType] = useState('Cat');
    const [gwCats, setGwCats] = useState('Yes');
    const [gwDogs, setGwDogs] = useState('Yes');
    const [gwKids, setGwKids] = useState('Yes');

    const [switchGenderIcon, setSwitchGenderIcon] = useState('toggle-switch-off');
    const [switchTypeIcon, setSwitchTypeIcon] = useState('toggle-switch-off');
    const [switchGwCatsIcon, setSwitchGwCatsIcon] = useState('toggle-switch-off');
    const [switchGwDogsIcon, setSwitchGwDogsIcon] = useState('toggle-switch-off');
    const [switchGwKidsIcon, setSwitchGwKidsIcon] = useState('toggle-switch-off');


    // State variables for dynamic color theme
    const image = props.route.params.image;

    const [isLoading, setIsLoading] = useState(false);


    // useEffect(() => {
    //  console.log('from saveimage componentDidMount:', uploadMsg);
    //  }, [uploadMsg])


    const onSwitchGender = () => {
      switchGenderIcon === 'toggle-switch' 
        ? setSwitchGenderIcon('toggle-switch-off')
        : setSwitchGenderIcon('toggle-switch')
      petGender === 'Male'
        ? setPetGender('Female')
        : setPetGender('Male')
    }
  
    const onSwitchType = () => {
      switchTypeIcon === 'toggle-switch' 
        ? setSwitchTypeIcon('toggle-switch-off')
        : setSwitchTypeIcon('toggle-switch')
      petType === 'Cat'
        ? setPetType('Dog')
        : setPetType('Cat')
    }

    const onSwitchGwCats = () => {
      switchGwCatsIcon === 'toggle-switch' 
        ? setSwitchGwCatsIcon('toggle-switch-off')
        : setSwitchGwCatsIcon('toggle-switch')
      gwCats === 'Yes'
        ? setGwCats('No')
        : setGwCats('Yes')
    }

    const onSwitchGwDogs = () => {
      switchGwDogsIcon === 'toggle-switch' 
        ? setSwitchGwDogsIcon('toggle-switch-off')
        : setSwitchGwDogsIcon('toggle-switch')
      gwDogs === 'Yes'
        ? setGwDogs('No')
        : setGwDogs('Yes')
    }

    const onSwitchGwKids = () => {
      switchGwKidsIcon === 'toggle-switch' 
        ? setSwitchGwKidsIcon('toggle-switch-off')
        : setSwitchGwKidsIcon('toggle-switch')
      gwCats === 'Yes'
        ? setGwKids('No')
        : setGwKids('Yes')
    }

    useEffect(() => {
      let progress = {
        petType, 
        petGender, 
        petName, 
        petAge, 
        gwCats, 
        gwDogs, 
        gwKids, 
        petDescription } 
      console.log('createNgoPost post in progress:', progress)
    }, [petGender, petType, gwKids, gwCats, gwDogs]);


    const createPost = (downloadURL) => {
      // console.log('Download URL:', downloadURL);
      let data = {
          uid: firebase.auth().currentUser.uid,
          downloadURL,
          petType,
          petGender,
          petName,
          petAge,
          gwCats,
          gwDogs,
          gwKids,
          description: petDescription,
         }
      

      axios.post(`${hostLink}/addNgoPost`, data).then(res => {
        console.log('From axios, Ngopost added successfully');
        setTimeout(() => {

          setIsLoading(false);
          props.navigation.navigate('Main');
        
        }, 2500)

      }).catch(err => {
        console.log(err, 'From axios, Failed to add Ngopost');
      })
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
              borderBottomColor: Color.Color_B4}}>
              You're almost done!
            </Text>

            <Text style={{...styles.titleBottomText, marginTop: 3}}>
              But the radar needs to know more..
            </Text>

            <View style={{...styles.imageContainer, backgroundColor: Color.Color_B4}}>
              <Image 
                style={styles.image}
                source={{uri: image}}/>
            </View>
              
            <View style={{...styles.petIconContainer, borderColor: Color.Color_B4}}>
              <Image 
                source={petType === 'Cat' ? cat : dog}
                style={styles.petIcon}/>
            </View>

          </View>



          <View style={{...styles.bottomContainer,
            height: 800}}>
            <Text style={{...styles.titleTopText,
              width: 150, 
              borderBottomColor: Color.Color_B4}}>
              Details, please?
            </Text>
            <View>

            
            <Text style={{...styles.titleBottomText, marginTop: 5}}>
                This will increase this pet's chances of finding a new home!
            </Text>

            </View>


            <View style={{...styles.form, 
              backgroundColor: Color.Color_B3,
              height: 585
              }}>


            
              <View style={styles.inputContainer}>

                <View
                  style={styles.topFormContainer}>
                  <TouchableOpacity
                      style={styles.switchLabel}
                      onPress={onSwitchType}>
                    <Text>
                      Pet type: Cat
                    </Text>
                    <MaterialCommunityIcons 
                    size={30}
                    name={switchTypeIcon} 
                    color={Color.Color_B7} 
                    style={{marginHorizontal: 5, bottom: 5}}
                  />
                    <Text>
                      Dog
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                      style={styles.switchLabel}
                      onPress={onSwitchGender}>
                    <Text>
                      {petType} gender: Female
                    </Text>
                    <MaterialCommunityIcons 
                    size={30}
                    name={switchGenderIcon} 
                    color={Color.Color_B7} 
                    style={{marginHorizontal: 5, bottom: 5}}
                  />
                    <Text>
                      Male
                    </Text>
                  </TouchableOpacity>

                  <Text style={{...styles.switchLabel,
                    textDecorationLine: 'underline', 
                    // fontStyle: 'italic',
                    fontSize: 16}}>
                    Is this {petType.toLowerCase()} friendly with:
                  </Text>

                  <TouchableOpacity
                      style={{...styles.switchLabel,
                        marginTop: 5}}
                      onPress={onSwitchGwCats}>
                    <Text>
                      Cats?    Yes
                    </Text>
                    <MaterialCommunityIcons 
                    size={30}
                    name={switchGwCatsIcon} 
                    color={Color.Color_B7} 
                    style={{marginHorizontal: 5, bottom: 5}}
                  />
                    <Text>
                      No
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                      style={{...styles.switchLabel,
                        marginVertical: -3}}
                      onPress={onSwitchGwDogs}>
                    <Text>
                      Dogs?   Yes
                    </Text>
                    <MaterialCommunityIcons 
                    size={30}
                    name={switchGwDogsIcon} 
                    color={Color.Color_B7} 
                    style={{marginHorizontal: 5, bottom: 5}}
                  />
                    <Text>
                      No
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                      style={{...styles.switchLabel,
                        marginLeft: 24}}
                      onPress={onSwitchGwKids}>
                    <Text>
                      Kids?    Yes
                    </Text>
                    <MaterialCommunityIcons 
                    size={30}
                    name={switchGwKidsIcon} 
                    color={Color.Color_B7} 
                    style={{marginHorizontal: 5, 
                      // marginBottom: 0,
                      bottom: 5}}
                  />
                    <Text>
                      No
                    </Text>
                  </TouchableOpacity>
                </View>


                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>
                      What's this {petType.toLowerCase()} called?
                    </Text>  
                    <TextInput 
                      placeholder='Pet name..'
                      autoCapitalize='words'
                      onChangeText={petName => setPetName(petName)}
                      style={styles.input}/>
                  </View>
                
            
                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>
                    How old is {petGender === 'Male' ? 'he' : 'she'}?  
                    </Text>
                    <TextInput 
                      placeholder='Pet age..'
                      keyboardType='numeric'
                      onChangeText={petAge => setPetAge(petAge)} 
                      style={styles.input}/>
                  </View>        

                <View style={styles.inputBox}>  
                  <Text style={styles.inputLabel}>
                    Anything else we should know?
                  </Text>
                  <TextInput
                    multiline={true}
                    placeholder="Tell us more about this rescue story.."
                    onChangeText={petDescription => setPetDescription(petDescription)}
                    style={{...styles.input, 
                      height: 180,
                      marginTop: 3, 
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
              { (petName && petAge && petDescription)
                 
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
  switchLabel: {
    marginLeft: 22,
    // marginBottom: 3,
    flexDirection: 'row'
  },
  topContainer: {
    height: 328,
    width: '90%',
    marginVertical: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: Color.Color_W5
  },
  topFormContainer: {
    height: 180,
    width: 250,
    // margin: 3,
    paddingTop: 10,
    borderRadius: 5,
    // paddingLeft: 10,
    alignSelf: 'center',
    // alignItems: 'center',
    justifyContent: 'center',
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
