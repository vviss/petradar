// @refresh reset

import firebase from 'firebase';
import 'firebase/firestore';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './redux/reducers';
import thunk from 'redux-thunk';

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, LogBox, View } from 'react-native';


import Loading from './Screens/Loading';
import SignUp from './Screens/SignUp';
import Login from './Screens/Login';
import Main from './Screens/Main';
import Map from './Screens/Tabs/Map';
import Post from './Screens/Tabs/Post';
import Feed from './Screens/Tabs/Feed';

import ChatTab from './Screens/Tabs/ChatTab';
import Chat from './Screens/Functionalities/Chat';
import Notifications from './Screens/Tabs/Notifications';


import TakeImage from './Screens/Functionalities/TakeImage';
import SaveImage from './Screens/Functionalities/SaveImage';
import TakeImageNGO from './Screens/Functionalities/TakeImageNGO';
import SaveImageNGO from './Screens/Functionalities/SaveImageNGO';
// import TakeImageAI from './Screens/Functionalities/TakeImageAI';
// import SaveImageAI from './Screens/Functionalities/SaveImageAI';

import Uploading from './Screens/Functionalities/Uploading';

const Store = createStore(rootReducer, applyMiddleware(thunk));
const Stack = createStackNavigator();

const firebaseConfig = {
  apiKey: "AIzaSyAoU4fcvYfJdfWiATHKhOrkh6SylLT_i7w",
  authDomain: "pet-radar-13cae.firebaseapp.com",
  projectId: "pet-radar-13cae",
  storageBucket: "pet-radar-13cae.appspot.com",
  messagingSenderId: "1024741666770",
  appId: "1:1024741666770:web:78654c15a2ea00395aa20b",
  measurementId: "G-D971N1F36F"
};
// Initialize Firebase
if(firebase.apps.length == 0) {
firebase.initializeApp(firebaseConfig);
}


export default function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if(!user) {
        setLoaded(true);
        setLoggedIn(false);
      } else {
          setLoaded(true);
          setLoggedIn(true);
          // console.log(user);
        }
      })
    }, 2500)
  }, [])

  useEffect(() => {
    LogBox.ignoreLogs(['Setting a timer']);
    LogBox.ignoreLogs(['subscriptions']);      

    // console.log('from hook, loggedin: ', loggedIn);
  }, [loggedIn])


  return (
    <View style={{flex: 1}}>
    { !loaded ?
      <Loading />
    : (
      !loggedIn ? (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Main'>
        <Stack.Screen name='SignUp' component={SignUp} options={{headerShown: false}}/>
        <Stack.Screen name='Login' component={Login} options={{headerShown: false}}/>
      </Stack.Navigator>
     </NavigationContainer>
    ) : (
    <Provider store={Store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Main'>
      
          <Stack.Screen name='Main' 
            component={Main} 
            options={{headerShown: false}}/>
          <Stack.Screen name='ChatTab'
            component={ChatTab}
            options={{headerShown: false}}/>
          <Stack.Screen name='Notifications'
            component={Notifications}
            options={{headerShown: false}}/>
          <Stack.Screen name='Feed' 
            component={Feed} 
            options={{headerShown: false}}/>
          <Stack.Screen name='Map' 
            component={Map} 
            options={{headerShown: false}}/>
          <Stack.Screen name='TakeImageNGO' 
            component={TakeImageNGO} 
            options={{headerShown: true, title: 'Step 2: Add a photo'}}
          />
          <Stack.Screen name='SaveImageNGO'
            component={SaveImageNGO} 
            options={{headerShown: true, title: 'Step 3: Finish up'}}
          />  
          <Stack.Screen name='TakeImage' 
            component={TakeImage} 
            options={{headerShown: true, title: 'Step 2: Add a photo'}}
          />
          <Stack.Screen name='SaveImage'
            component={SaveImage} 
            options={{headerShown: true, title: 'Step 3: Finish up'}}
          />
          {/* <Stack.Screen name='Uploading'
            component={Uploading} 
            options={{headerShown: false}}
          /> */}
          <Stack.Screen name='Post' 
            component={Post} 
            options={{headerShown: true}}/>
          <Stack.Screen name='Chat'
            component={Chat}
            options={{headerShown: false}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
      )  
    )}
    </View>
  )


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,100,250,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
