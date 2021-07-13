import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, TextInput, TouchableOpacity } from 'react-native';

import * as Color from '../assets/Colors';
import bgImage from '../assets/bgImage.jpg'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// import axios from 'axios';
import firebase from 'firebase';


export default function Login(props) {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const [passwordVisibilityIcon, setpasswordVisibilityIcon] = useState('eye-off');
    const [passwordVisibility, setpasswordVisibility] = useState(true);

    const [submitted, setSubmitted] = useState(false);

    const onPasswordVisibilityIconToggle = () => {
      passwordVisibilityIcon === 'eye' ? setpasswordVisibilityIcon('eye-off') : setpasswordVisibilityIcon('eye');
      setpasswordVisibility(!passwordVisibility);
    }

    useEffect(() => {
      setEmail('')
      setPass('')
  }, [submitted])

    const onLoginPress = () => {
      if (!email || !pass) {
          alert('Please fill in all fields');
          return;
      } 
      else {
          const data = {
            email: email,
            password: pass
      }
      
      console.log(data)

      firebase.auth().signInWithEmailAndPassword(data.email, data.password)
      .then((res) => {
        console.log(res);
        setSubmitted(true);
        // props.navigation.navigate('Main');
      }).catch((err) => {
        console.log(err);
      })
      
      console.log('submitted before set', submitted)
  }
  }

  useEffect(() => {
    setEmail('')
    setPass('')
  }, [submitted])


  return (
    <View style={{flex: 1}}>
      <ImageBackground 
        source={bgImage} 
        style={styles.bgContainer} 
        imageStyle={{opacity:0.85}}>  

        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
              Login to Pet Radar
          </Text>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            placeholder={'Email Address'}
            type={'Email'}
            style={styles.input}
            placeholderTextColor={'rgba(255,255,255,0.7)'}
            underlineColorAndroid='transparent'
            onChangeText={email => setEmail(email)} 
            value={email}
          //   style={styles.input}
            
        />
        <View style={styles.inputPass}>
          <TextInput
            placeholder={'Password'}
            placeholderTextColor={'rgba(255,255,255,0.7)'}
            secureTextEntry={passwordVisibility}
            underlineColorAndroid='transparent'
            onChangeText={pass => setPass(pass)} 
            value={pass}
        />
        <MaterialCommunityIcons 
          size={25} 
          name={passwordVisibilityIcon} 
          style={styles.passIcon}
          onPress={onPasswordVisibilityIconToggle}
          />
        </View>

        </View>

        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={onLoginPress}
          style={styles.button}>
            <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>


        <View style={styles.footerView}>
          <Text style={styles.footerText}>
             First timer?
          </Text>
         <TouchableOpacity 
          onPress={() => props.navigation.navigate('SignUp')}
          >
            <Text style={styles.signUpText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

      </ImageBackground>
    </View>

    )
}

const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
    // marginTop: 25,
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    backgroundColor: Color.Color_BL4,
    width: 150,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 15
  },
  buttonText: {
    color: '#fff',
  },
  container: {
    flex: 1,
    // marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: Color.Color_G1,
    borderRadius: 10,
  },
  input: {
    backgroundColor: Color.Color_W1,
    height: 50,
    borderRadius: 10,
    margin: 5,
    padding: 10,
    color: Color.Color_G2,

  },
  inputContainer: {
    width: 250,
    height: 150,
    borderRadius: 10,
    backgroundColor: Color.Color_BL3,
    padding: 15,
    borderColor: '#fff',
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 20,
    bottom: 10
  },
  inputPass: {
    backgroundColor: Color.Color_W1,
    height: 50,
    borderRadius: 10,
    margin: 5,
    padding: 10,
    color: Color.Color_G2,
  },
  footerView: {
    flexDirection: 'row',
    top: 103,
  },
  footerText: {
    marginRight: 8,
    color: Color.Color_W3,
    fontStyle: 'italic'
  },
  passIcon: {
    alignSelf: 'flex-end',
    bottom: 25,
    opacity: 0.3
  },
  signUpText: {
    color: 'rgba(240,240,240,0.95)'

  },
  titleContainer: {
    backgroundColor: Color.Color_BL3,
    borderRadius: 10,
    padding: 15,
    // marginBottom: 5,
    bottom: 55
  },
  titleText: {
      fontFamily: 'digital2',
      fontSize: 19,
      color: '#fff',
  }   
});