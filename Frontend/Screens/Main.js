import React, { useState, useEffect } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { LogBox, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsFocused } from '@react-navigation/native';

import firebase from 'firebase';
require('firebase/firestore');

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchUser, fetchUserPosts, clearData } from '../redux/actions';

import * as Color from '../assets/Colors';

import Map from './Tabs/Map';
import Feed from './Tabs/Feed';
import Profile from './Tabs/Profile';
import ChatTab from './Tabs/ChatTab';
import Notifications from './Tabs/Notifications';

const Tab = createMaterialBottomTabNavigator();
const Posts = createStackNavigator();


function Main(props) {

  const isFocused = useIsFocused();
  const [reRender, setReRender] = useState(true);

  //Setting Icons dynamically
  const [notifIcon, setNotifIcon] = useState('bell');
  const [chatIcon, setChatIcon] = useState('chat');


  useEffect(() => {
    props.clearData();
    props.fetchUser();
  }, [])

  useEffect(() => {
    // Listen for unread notifications
    // and set tab icon dynamically
    firebase.firestore()
    .collection('Notifications')
    .doc(firebase.auth().currentUser.uid)
    .collection('Comments')
    .onSnapshot((collection) => {
        firebase.firestore()
        .collection('Notifications')
        .doc(firebase.auth().currentUser.uid)
        .collection('Comments')
        // .orderBy('creation', 'desc')
        .get()
        .then((snapshot) => {
        // console.log('from Main hook:', snapshot.docs);
          let count = 0;

          for(let i of snapshot.docs) {
            if(!i.data().seen) {
              // console.log('mapping over docs:', i.data());
              count++;
            }

          if(count > 0) {
            setNotifIcon('bell-alert');
          } else {
            setNotifIcon('bell');
          }

        }
      })
    })


    // Listen for unread chats
    // and set tab icon dynamically
    firebase.firestore()
    .collection(firebase.auth().currentUser.uid)
    .onSnapshot((collection) => {
        firebase.firestore()
        .collection(firebase.auth().currentUser.uid)
        .get()
        .then((snapshot) => {
        // console.log('from Main hook:', snapshot.docs);
          let count = 0;

          for(let i of snapshot.docs) {
            if(!i.data().seen) {
              // console.log('mapping over docs:', i.data());
              count++;
            }

          if(count > 0) {
            setChatIcon('chat-alert');
          } else {
            setChatIcon('chat');
          }

        }
      })
    })
}, [])

  useEffect(() => {
    console.log('Main window in focus:', isFocused);
    LogBox.ignoreLogs(['Setting a timer']);      


    if(isFocused) {
      if(reRender) {
      setReRender(false);
      }
    } else {
      setReRender(true);
    }
  })

  return (
    <Tab.Navigator 
      style={styles.navigator} 
      labeled={true}
      activeColor='#fff'
      // inactiveColor='rgba(20,80,20,1)'
      initialRouteName="Map"
      barStyle={{backgroundColor: Color.Color_B5}}
      >

      <Tab.Screen name='Feed' component={Feed} 
        options={{
          tabBarIcon: ({color, size}) => (
              <MaterialCommunityIcons name='folder-multiple-image' color={color} size={25} />
          )
      }} />
      <Tab.Screen name='Notifications' component={Notifications} 
        options={{
          tabBarIcon: ({color, size}) => (
              <MaterialCommunityIcons name={notifIcon} color={color} size={25} />
          )
      }} />
      <Tab.Screen name='Map' component={Map}
        options={{
          tabBarIcon: ({color, size}) => (
              <MaterialCommunityIcons name='google-maps' color={color} size={25} />
          )
      }} />
 
     <Tab.Screen name='Inbox' component={ChatTab}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name={chatIcon} color={color} size={25} />
          )
      }} />
     <Tab.Screen name='Profile' component={Profile}
        options={{
          tabBarIcon: ({color, size}) => (
            <MaterialCommunityIcons name='account' color={color} size={25} />
          )
      }} />
    </Tab.Navigator>
  )
}

const mapStateToProps = (store) => ({
    currentUser: store.userState.currentUser
})

const mapDispatchProps = (dispatch) => bindActionCreators(
    {fetchUser, fetchUserPosts, clearData}, dispatch)

const styles = StyleSheet.create({

    backgroundContainer: {
      flex: 1,
      width:'100%',
      backgroundColor: 'navy',
      alignItems: 'center',
      justifyContent: 'center'
    },
    navigator: {
    }

  });

export default connect(mapStateToProps, mapDispatchProps)(Main);