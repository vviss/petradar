import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';

import * as Color from '../../assets/Colors';
// import bgImage3 from '../../assets/bgImage3.png'; 
import bgImage4 from '../../assets/bgImage4.jpg'; 

export default function TakeImageNGO(props) {

  const [image, setImage] = useState(null);
  const [camera, setCamera] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [hasCamPermission, setHasCamPermission] = useState(null);
  const [hasCamRollPermission, setHasCamRollPermission] = useState(null);

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
    console.log('TakeImage window in focus:', isFocused);
    // console.log('Param passed from map:', props.route.params.location)
    if(isFocused) {
      if(reRender) {
        setReRender(false);
      }
    } else {
      setCameraOn(false);
      setImage(null);
      setReRender(true);
    }
  })

  const startCamera = (start=true) => {
    if(start) {
      setCameraOn(true);
      console.log('from startCamera');
    } else {
      setCameraOn(false);
      setImage(null);
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
      console.log(data.uri);
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
      quality: 1
    });
    
    if (!result.cancelled) {
      // console.log('from TakeImage/pickImage() "not cancelled"');
      setImage(result.uri);
    }
  };

  return (
    <View style={{flex: 1}}>
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
                <Text style={{...styles.homeText, fontStyle: 'italic'}}>Take/upload a clear image of the pet</Text>
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
                size={35}
                color='white'/>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.activeSaveButton}
              onPress={() => props.navigation.navigate('SaveImageNGO', {image})}>
              <MaterialCommunityIcons 
                name='arrow-right' 
                size={35}
                color='white' />
            </TouchableOpacity>
          </View>
        }

      </ImageBackground>
    </View>

  );
}

const styles = StyleSheet.create({
  activeButtonsContainer: {
    justifyContent: 'center',
    bottom: 140,
    left: 188,
    padding: 15,
    paddingBottom: 12,
    width: 150,
    flexDirection: 'row',
    position: 'absolute'    
  },
  activeCancelButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.Color_R4,
    marginVertical: 10,
    marginHorizontal: 3,
    borderRadius: 8
  },
  activeSaveButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.Color_G4,
    marginVertical: 10,
    marginHorizontal: 3,
    borderRadius: 8
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