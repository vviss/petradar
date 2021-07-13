import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, Image, TextInput, Dimensions, TouchableOpacity, KeyboardAvoidingView ,ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// import { useFonts } from '@expo-google-fonts/raleway';

import * as Color from '../assets/Colors';
import bgImageF1 from '../assets/bgImageF1.png'; 

import axios from 'axios';
import firebase from 'firebase';

import hostLink from '../assets/ngrokHost';

export default function SignUp({navigation}) {
    // These 4 state variables are for
    // making input fields controlled
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cpass, setCpass] = useState('');

    // State variables and functions
    // for user role selection at sign up (user/ngo)  
    const [userType, setUserType] = useState('User');
    // const [userRadio, setUserRadio] = useState("radiobox-marked");
    // const [ngoRadio, setNgoRadio] = useState("radiobox-blank");

    const [switchIcon, setSwitchIcon] = useState('toggle-switch-off');

    const onSwitch = () => {
      switchIcon === 'toggle-switch' 
        ? setSwitchIcon('toggle-switch-off')
        : setSwitchIcon('toggle-switch')
      userType === 'User'
        ? setUserType('NGO')
        : setUserType('User')
    }
  
    useEffect(() => {
      console.log('from userType hook:', userType)
    }, [userType]);

    // 'submitted' toggled to true when all checks pass
    const [submitted, setSubmitted] = useState(false);

    const onRegisterPress = () => {
      if (!name || !email || !password || !cpass) {
          alert('Please fill in all fields');
          return;
      } else {        
      if (password !== cpass) {
          alert('"Password" and "Confirm Password fields must be identical')
          return;
      } else if(password.length < 8) {
          alert('Password must be at least 8 characters')
      } 
      else {
          const data = {
          name,
          email,
          password,
          userType
      }
      
      // console.log(data)

      
      firebase.auth().createUserWithEmailAndPassword(data.email, data.password)
      .then((res) => {
        firebase.firestore().collection('users')
        .doc(firebase.auth().currentUser.uid)
        .set(
          { name: data.name,
            email: data.email,
            // userType: data.userType
          }
        )
        axios.post(`${hostLink}/register`, {...data, uid: firebase.auth().currentUser.uid})
          .then(res => {
          console.log('Register response received: ', res.data);
          if (res.data === 'EMAIL TAKEN') {
              alert('Email already taken! Try another')
          } else {
          // alert('Sign Up successful, redirecting you to Login page')
            setSubmitted(true)
          }
        }).catch(err => {
          console.log('From axios: Failed to send register request', err)
        })
        console.log('from firebase signup:', res);
      }).catch((err) => {
        console.log('from firebase signup error:', err);
      })
    }
    }}


  useEffect(() => {
      setName('')
      setEmail('')
      setPassword('')
      setCpass('')
  }, [submitted])

    return (
    <View style={{flex: 1}}>
    <ImageBackground 
      source={bgImageF1} 
      style={styles.bgContainer} 
      imageStyle={{opacity:0.85}}>  

      <View style={styles.title}>
        <Text style={styles.titleText}>Pet Radar</Text>
      </View>
      
        <View 
          style={styles.formContainer}>
          <TextInput
            placeholder={'Name'}
            placeholderTextColor={'rgba(255,255,255,0.7)'}
            onChangeText={name => setName(name)} 
            value={name}
            maxLength={25}
            style={{...styles.input, marginTop: 15}}
          />
          <TextInput
            placeholder={'Email Address'}
            type={'Email'}
            placeholderTextColor={'rgba(255,255,255,0.7)'}
            onChangeText={email => setEmail(email)} 
            value={email}
            style={styles.input}
            
        />
          <TextInput
            placeholder={'Password'}
            placeholderTextColor={'rgba(255,255,255,0.7)'}
            secureTextEntry={true}
            onChangeText={password => setPassword(password)} 
            value={password}
            style={styles.input}
        />
          <TextInput
            placeholder={'Confirm Password'}
            placeholderTextColor={'rgba(255,255,255,0.7)'}
            secureTextEntry={true}
            onChangeText={cpass => setCpass(cpass)} 
            value={cpass}
            style={styles.input}
        />

        
          <View style={styles.radioGroup}>
            <Text style={{...styles.radioText, marginRight: 8, bottom: .5}}>
              I represent:
            </Text>
            <Text style={styles.radioText}>
              Myself
            </Text>
            <MaterialCommunityIcons 
              size={30}
              name={switchIcon} 
              onPress={onSwitch}
              color={Color.Color_W7} 
              style={{marginHorizontal: 3, marginTop: 2}}
            />
            <Text style={styles.radioText}>
              An NGO
            </Text>
          </View>
        </View>

      {/* <View style={styles.buttonBorder}>
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={onRegisterPress}
          style={styles.button_dumped}>
          <MaterialCommunityIcons 
            size={40}
            name='account-plus' 
            color={Color.Color_W7}/>
            <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View> */}





        <TouchableOpacity
          activeOpacity={0.7} 
          onPress={onRegisterPress}
          style={{...styles.button, backgroundColor: Color.Color_B11}}>
            <Text style={styles.buttonText}>
              Sign Up
            </Text>
        </TouchableOpacity>









        <View style={styles.footerView}>
         <Text style={styles.footerText}>
           Already have an account?
         </Text>
         <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>

    </ImageBackground>
    </View>
    )
}


const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
    marginTop: 25,
    paddingTop: 40,
    // justifyContent: 'center',
    alignItems: 'center'
  },
  button_dumped: {
    backgroundColor: Color.Color_B4,
    width: 70,
    height: 70,
    bottom: 2,
    right: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  button: {
    alignSelf: 'flex-end',
    right: 47,
    top: 20,
    marginBottom: 32,
    backgroundColor: Color.Color_BL4,
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
  buttonBorder: {
    width: 71,
    height: 71,
    borderRadius: 12,
    backgroundColor: '#rgba(0,0,0,.2)',
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    right: 43,
    top: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 17.49,
    elevation: 100,
  },
  buttonText: {
    color: Color.Color_W7,
    fontWeight: 'bold'
  },
  container: {
    flex: 1,
    marginTop: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  formBody: {
    // height: 495,
    width: 315,
    borderRadius: 5,
    paddingVertical: 5,
    backgroundColor: Color.Color_W6,
    // paddingTop: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  formContainer: {
    // flexDirection: 'row',
    padding: 3,
    width: 270,
    // height: 500,
    // alignItems: 'center',
    justifyContent: 'center',
    // alignSelf: 'center',
    // paddingTop: 10,
    // bottom: 225,
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: Color.Color_B4,
    // position: 'absolute'
  },
  input: {
    backgroundColor: Color.Color_W1,
    height: 50,
    borderRadius: 10,
    margin: 5,
    padding: 10,
    color: Color.Color_G2
  },
  inputContainer: {
    width: 250,
    height: 300,
    borderRadius: 10,
    backgroundColor: Color.Color_BL3,
    padding: 15,
    justifyContent: 'center',
    marginTop: 30,
    bottom: 10,
    borderColor: '#fff',
    borderWidth: 1,
  },
  footerView: {
    flexDirection: 'row',
    top: 90,
  },
  footerText: {
    marginRight: 5,
    color: Color.Color_B11,
    fontStyle: 'italic'
  },
  loginText: {
    color: Color.Color_B4,
    fontWeight: 'bold'
  },
  radioGroup: {
    flexDirection: 'row',
    // marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioText: {
    color: Color.Color_W3,
    fontSize: 12,
    marginRight: 2,
  },
  title: {
    // bottom: 50
  },
  titleText: {
    fontSize: 36.5,
    color: Color.Color_B11,
    fontFamily: 'digital'
  }
});