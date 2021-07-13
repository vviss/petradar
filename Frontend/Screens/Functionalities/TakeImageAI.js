import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Camera } from 'expo-camera';
import { asset } from 'expo-asset';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';

import * as Color from '../../assets/Colors';
// import bgImage3 from '../../assets/bgImage3.png'; 
import bgImage4 from '../../assets/bgImage4.jpg'; 

import Model from './Model';
import SaveImageAI from './SaveImageAI';

import Uploading from './Uploading';

import firebase from 'firebase';
// import { sparseToDense } from '@tensorflow/tfjs';
// import { set } from 'react-native-reanimated';
require('firebase/firestore');
require('firebase/firebase-storage');

export default function TakeImageAI(props) {

  const [image, setImage] = useState(null);
  const [camera, setCamera] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [hasCamPermission, setHasCamPermission] = useState(null);
  const [hasCamRollPermission, setHasCamRollPermission] = useState(null);

  const [displayText, setDisplayText] = useState('');
  const [match, setMatch] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadLink, setUploadLink] = useState('');
  const [AIprediction, setAIprediction] = useState([]);
  const [done, setDone] = useState(false);


  const isFocused = useIsFocused();
  const [reRender, setReRender] = useState(true);

  useEffect(() => {
    (async () => {
      
      const cameraPermission = await Camera.requestPermissionsAsync();
      setHasCamPermission(cameraPermission.status === 'granted');

      const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (galleryPermission.status !== 'granted') {
        setHasCamRollPermission(false);
        alert('Sorry, we need camera roll permissions to make this work!');
      } else {
        setHasCamRollPermission(true);
      }
    })();
    
    // console.log('from TakeImage hook, IMG: ', image)
  }, [cameraOn, reRender]);

  useEffect(() => {
    if(processing){
      setDisplayText('Our IT Team is uploading your photo..')
      upload();
    }
    // console.log('from processing hook:', processing);
  }, [processing])

  useEffect(() => {
    if(uploadLink){
      setDisplayText('Our AI is scanning the image..');
      classify();
    }
    // console.log('from uploadLink hook:', AIprediction);
  }, [uploadLink])

  useEffect(() => {
    if(done){

      console.log('from done hook');
      props.navigation.pop();
      props.navigation.navigate('Main');

    }
    // console.log('from uploadLink hook:', AIprediction);
  }, [done])

  const saveDone = event => {
    console.log('From saveDone:', event);
    if(event === 'DONE') {
      console.log('TakeImage:', event);
      setDone(true);
      // props.navigation.pop();
      // props.navigation.navigate('Main');
    }
  }

  useEffect(() => {
    if(AIprediction.length !== 0) {
      if(detectedPet(AIprediction) === '+++') {
        setDisplayText('Image accepted!');
        // setProcessing(false);

        console.log('Passed classification test');

        setTimeout(() => {
          console.log('From timer');
          setMatch('+++');
          // startCamera(false);
        }, 2500)

        console.log('After timer');

        // props.navigation.navigate('SaveImageAI', {
        //   downloadURL: uploadLink,
        //   allPosts: props.route.params.allPosts, 
        //   caseType: props.route.params.caseType,
        //   petType: props.route.params.petType,
        //   petGender: props.route.params.petGender,
        //   location: props.route.params.location
        //   })

      }
      if(detectedPet(AIprediction) === '---') {
        setMatch('---');
        // setProcessing(false);
        setDisplayText(`Failed to detect ${props.route.params.petType.toLowerCase()}.\nPlease upload a clearer photo`);
        setTimeout(() => {
          startCamera(false);
        }, 2500)
        
        alert(`Failed to detect ${props.route.params.petType.toLowerCase()}`);
      }
   }
  }, [AIprediction])

  useEffect(() => {
    // console.log('TakeImage window in focus:', isFocused,
      // 'TakeImage Nav prop:', props.navigation);
    // console.log('downloadURL/uploadLink', uploadLink);
    // console.log('Param passed from map:', props.route.params.location)
    // console.log('Post cycle done:', done);

    if(isFocused) {
      if(reRender) {
        setReRender(false);
      }
    } else {
      setCameraOn(false);
      setImage(null);
      setAIprediction([]);
      setUploadLink('');
      setReRender(true);
      setProcessing(false);
      setMatch(false);
      setDisplayText('');
      setDone(false);
    }
  })


  const labels = [
    'afghan hound', 'african hunting dog', 'airedale', 'siamese',
    'american straffordshire', 'appenzeller', 'terrier', 'mountain dog',
    'spaniel', 'collie', 'boston bull', 'bouvier des flanders', 'doberman', 
    'brabancon', 'retriever', 'chihuahua', 'dandie dinmont', 'foxhound', 
    'english setter', 'english springer', 'entlebucher', 'eskimo dog',
    'bulldog', 'german shepherd', 'short-haired pointer', 'gordon setter',
    'great dane', 'pyreneese', 'hound', 'irish setter', 'leonberg', 'lhasa',
    'maltese', 'mexican hairless', 'newfoundland', 'sheepdog', 'pekinese', 
    'pembroke', 'ridgeback', 'rottweiler', 'saint bernard', 'saluki', 'samoyed',
    'shih-tzu', 'husky', 'mastiff', 'weimaraner', 'affenpinscher', 'basenji',
    'basset', 'beagle', 'bluetick', 'borzoi', 'boxer', 'briard', 'cairn',
    'chow', 'clumber', 'dalmatian', 'schnauzer', 'groenendael', 'keeshond',
    'kelpie', 'komondor', 'kuvasz', 'malamute', 'malinois', 'pinscher', 'tabby',
    'poodle', 'papillion', 'pug', 'redbone', 'schipperke', 'vizsla', 'whippet',
    'egyptian cat', 'persian cat', 'cat bear', 'bear cat'
    ]


  const detectedPet = (pred) => {
    for(let i of pred) {
      for(let j of labels) {
        let detected = i['className'].toLowerCase().includes(j)
      
        if(detected) {
          console.log('Match found', i, j);
          return '+++';
        }
      }
    }
    return '---';
  }


  const startCamera = (start=true) => {
    if(start) {
      setCameraOn(true);
      console.log('from startCamera');
    } else {
      setCameraOn(false);
      setImage(null);
      setAIprediction([]);
      setUploadLink('');
      setProcessing(false);
      setDisplayText('');
      setMatch(false);
      setDone(false);
    }
  }

  
  if (hasCamPermission === null || hasCamRollPermission === null) {
    return <View />;
  }
  
  if (hasCamPermission === false || hasCamRollPermission === false) {
    return (
    <View>
    <Text>No access to camera/gallery</Text>
    </View>
    )
  }

  const takePicture = async () => {
    if(camera) {
      const data = await camera.takePictureAsync(null);
      // console.log(data.uri);
      setCameraOn(false);
      setImage(data.uri);
    }
  }

  const pickImage = async () => {
    // console.log('FROM PICK IMAGE');
    
    let result = await ImagePicker.launchImageLibraryAsync({
      // mediaTypes: ImagePicker.MediaTypeOptions.All,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: .5
    });
    
    if (!result.cancelled) {
      // console.log('from TakeImage/pickImage() "not cancelled"');
      setImage(result.uri);
    }
  };

  async function classify() {
    console.log('from classify', uploadLink);
    const classification = await Model(uploadLink);
    setAIprediction(classification);
  }

  const onProceedPress = () => {
    setProcessing(true);
    // console.log('uploadLink from onProceedPress', uploadLink);
  }

  const upload = async () => {
    const res = await fetch(image);
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
        // createPost(snapshot);
        setUploadLink(snapshot);
      })
    }

    const error = snapshot => {
      console.log('From error, snapshot:', snapshot);
    }

    process.on('state_changed', progress, error, done);
  }




  return (
    <View style={{flex: 1}}>

      { (processing || match)
      ? (
        <View style={{flex: 1}}>
        { (!done && match === '+++') ?
        <SaveImageAI
          saveDone={(e) => {saveDone(e)}}
          // navigation={props.navigation}
          // downloadURL={'https://upload.wikimedia.org/wikipedia/commons/a/a3/June_odd-eyed-cat.jpg'} 
          downloadURL={uploadLink} 
          allPosts={props.route.params.allPosts}
          caseType={props.route.params.caseType}
          petType={props.route.params.petType}
          petGender={props.route.params.petGender}
          location={props.route.params.location}
          />
          :
          <Uploading message={displayText}/>
        }
        </View>

        )
      : (

      <ImageBackground 
        source={bgImage4} 
        style={styles.bgContainer} 
        imageStyle={{opacity:0.85}}>
      
        { cameraOn &&
        <View style={styles.cameraContainer}>
        {/* <View style={styles.image}> */}
          <Camera 
          type={type} 
          style={styles.camera} 
          ratio={'1:1'}
          ref={ref => setCamera(ref)}/>

        </View>
        }

        {image && 
        <View style={{...styles.cameraContainer, backgroundColor: Color.Color_B4}}>
          <Image source={{uri: image}} style={styles.image} />
        </View> }

        { cameraOn &&
        <View style={styles.camButtonsContainer}>
          <TouchableOpacity
            title='Flip Cam'
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}>
            <MaterialCommunityIcons 
              name='camera-front-variant' 
              style={{color: Color.Color_W5}}
              size={40} />
          </TouchableOpacity>
          <TouchableOpacity
            // style={{backgroundColor: 'red'}}
            onPress={() => startCamera(false)}>
            <MaterialCommunityIcons 
              name='close-thick' 
              style={{color: Color.Color_W5}}
              size={40} />
          </TouchableOpacity>

        </View>}

        { cameraOn &&
          <View style={styles.snapButtonContainer}>
            <TouchableOpacity
              onPress={() => takePicture()}>
              <MaterialCommunityIcons 
                name='camera' 
                style={{color: '#fff'}}
                size={70} />
            </TouchableOpacity>
          </View>
        }

        { (!cameraOn && !image) &&
          <View style={styles.homeContainer}>
            <View style={styles.homeTextContainer}>
              <View style={styles.titleBox}>
                <Text style={styles.homeTitle}>Add photo</Text>
              </View>
              <View style={styles.textBox}>
                <Text style={{...styles.homeText, fontStyle: 'italic'}}>Others might be able to recognize this pet!</Text>
              </View>
              <View style={styles.textBox}>  
                <Text style={{...styles.homeText, fontSize: 15}}>Pick a method</Text>
              </View>
            </View>
            
            <View style={styles.homeButtonsContainer}>
              <TouchableOpacity
                style={{...styles.homeButtons, 
                  borderRightWidth: 2,
                  borderRightColor: Color.Color_B4}}
                onPress={() => startCamera()}>
                <MaterialCommunityIcons 
                  name='camera-plus' 
                  style={{color: '#000'}}
                  size={40} />
                <Text>Camera</Text>
              </TouchableOpacity>
            
              <TouchableOpacity
                style={{...styles.homeButtons, 
                  borderLeftWidth: 2,
                  borderLeftColor: Color.Color_B4}}
                onPress={() => pickImage()}>
                <MaterialCommunityIcons 
                name='image-multiple' 
                style={{color: '#000'}}
                size={40} />
                <Text>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        }


        { image && 
          <View style={styles.activeButtonsContainer}>
            <TouchableOpacity
              style={styles.activeCancelButton}
              onPress={() => startCamera(false)}>
              <MaterialCommunityIcons 
                name='close-thick' 
                size={50}
                color='white'/>
            </TouchableOpacity>




            {/* <TouchableOpacity
              style={styles.activeSaveButton}
              onPress={() => props.navigation.navigate('SaveImageAI', {
                downloadURL: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/June_odd-eyed-cat.jpg', 
                allPosts: props.route.params.allPosts, 
                caseType: props.route.params.caseType,
                petType: props.route.params.petType,
                petGender: props.route.params.petGender,
                location: props.route.params.location})}>
              <MaterialCommunityIcons 
                name='arrow-right' 
                size={50}
                color='white' />
            </TouchableOpacity> */}


            <TouchableOpacity
              style={styles.activeSaveButton}
              // onPress={() => setMatch('***')}>

              onPress={() => onProceedPress()}>
              <MaterialCommunityIcons 
                name='arrow-right' 
                size={50}
                color='white' />
            </TouchableOpacity>
          
            </View>
        }

        {/* { (processing || match) && 
          <Text>{displayText}</Text>
        } */}


      </ImageBackground>
      )}
    </View>

  );
}

const styles = StyleSheet.create({
  activeButtonsContainer: {
    justifyContent: 'center',
    bottom: 115,
    left: 169,
    padding: 15,
    paddingBottom: 12,
    width: 150,
    flexDirection: 'row',
    position: 'absolute'    
  },
  activeCancelButton: {
    width: 65,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.Color_R4,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10
  },
  activeSaveButton: {
    width: 65,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.Color_G4,
    marginVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10
  },
  bgContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camButtonsContainer: {
    backgroundColor: Color.Color_B4,
    justifyContent: 'center',
    position: 'absolute',
    borderRadius: 3,
    bottom: 231,
    left: 253,
    padding: 3,
    paddingTop: 6
  },
  cameraContainer: {
    height: 270,
    width: 270,
    borderRadius: 10,
    backgroundColor: Color.Color_B4,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 90
  },
  camera: {
    height: 250,
    width: 250,
    aspectRatio: 1,
  },
  homeButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1/2
  },
  homeContainer: {
    height: 300,
    width: 270,
    bottom: 75,
    borderRadius: 10,
    backgroundColor: Color.Color_B4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  homeButtonsContainer: {
    backgroundColor: Color.Color_O1,
    flexDirection: 'row',
    width: 250,
    height: 70,
    bottom: 2,
    justifyContent: 'center',
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    borderTopWidth: 5,
    borderTopColor: Color.Color_B4
  },
  homeTextContainer: {
    backgroundColor: Color.Color_W5,
    borderTopStartRadius: 10,
    borderTopEndRadius: 10,
    alignItems: 'center',
    top: 1,
    height: 210,
    width: 250,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  homeText: {
    padding: 10,
    paddingTop: 30,
    fontSize: 20,
    textAlign: 'center'
  },
  homeTitle: {
    color: '#000',
    fontSize: 32,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  image: {
    aspectRatio: 1/1,
    borderRadius: 15,
    height: 250,
  },
  snapButtonContainer: {
    backgroundColor: Color.Color_G4,
    borderRadius: 65,
    justifyContent: 'center',
    bottom: 100,
    left: 215,
    padding: 15,
    paddingBottom: 12,
    position: 'absolute'
  },
  textBox: {
    justifyContent: 'center',
    alignItems: 'center',
    top: 10
  },
  titleBox: {
    top: 5,
    justifyContent: 'center',
    alignItems: 'center'
  }
});