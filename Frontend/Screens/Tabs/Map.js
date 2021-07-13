import React, { useState, useEffect } from 'react';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';
import { LogBox, StyleSheet, Text, View, Dimensions, TouchableOpacity, Image } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import axios from 'axios';
import hostLink from '../../assets/ngrokHost';
import firebase from 'firebase';

import * as Color from '../../assets/Colors';

import cat from '../../assets/icons/cat.png'; 
import cat_off from '../../assets/icons/cat_off.png'; 
import cat_lost from '../../assets/icons/cat_lost.png'; 
import cat_found from '../../assets/icons/cat_found.png'; 
import cat_lost_active from '../../assets/icons/cat_lost_active.png'; 
import cat_found_active from '../../assets/icons/cat_found_active.png'; 

import dog from '../../assets/icons/dog.png'; 
import dog_off from '../../assets/icons/dog_off.png'; 
import dog_lost from '../../assets/icons/dog_lost.png'; 
import dog_found from '../../assets/icons/dog_found.png';
import dog_lost_active from '../../assets/icons/dog_lost_active.png'; 
import dog_found_active from '../../assets/icons/dog_found_active.png';



export default function Map(props) {

  const isFocused = useIsFocused();
  const [reRender, setReRender] = useState(true);

  const [userLocation, setUserLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [longPressReady, setLongPressReady] = useState(false);

  const [markers, setMarkers] = useState([]);
  const [shownMarkers, setShownMarkers] = useState([]);

  const [newPetType, setNewPetType] = useState(null);
  const [newCaseType, setNewCaseType] = useState(null);
  const [newPetGender, setNewPetGender] = useState(null);
  const [newMarkerCoord, setNewMarkerCoord] = useState(null);
  
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedUser, setSelectedUser] = useState({});

  const [showCat, setShowCat] = useState(true);
  const [showDog, setShowDog] = useState(true);

  const [showLost, setShowLost] = useState(true);
  const [showFound, setShowFound] = useState(true);

  const [showMine, setShowMine] = useState(false);
  const [mineCheckbox, setMineCheckbox] = useState("checkbox-blank-outline");


  const onCatCheck = () => {
    // console.log('from cat filter press:', showCat);
    setShowCat(!showCat);
  }

  const onDogCheck = () => {
    setShowDog(!showDog);
  }
  
  const onFoundCheck = () => {
    setShowFound(!showFound);
    // getAllPosts();
  }

  const onLostCheck = () => {
    setShowLost(!showLost);
    // getAllPosts();
  }

  const onMineCheck = () => {
    mineCheckbox === 'checkbox-marked' 
      ? setMineCheckbox('checkbox-blank-outline') 
      : setMineCheckbox('checkbox-marked');  
    
    setShowMine(!showMine);
  }

  const initialLoc = {
    latitude: 33.94,
    longitude: 35.6,
    latitudeDelta: 0.6,
    longitudeDelta: 0.6
    }

  const onAddPin = (e) => {
    if(longPressReady) {
      // console.log(e.nativeEvent.coordinate);
      setNewMarkerCoord(e.nativeEvent.coordinate);
      // let newMarker = e.nativeEvent.coordinate;
      let newMarkers = [...markers]
      if(added) {
        newMarkers.pop();
      }
    // setMarkers([...newMarkers, {id: (markers.length)*100, location: newMarker}])
    setAdded(true);
    }
  }

  const onSelectPin = (e) => {
    // console.log(e.nativeEvent.coordinate);
    if (!isAdding){
    let coords = e.nativeEvent.coordinate;

    let selected = markers.filter(item => (
      item['location']['latitude'] === coords['latitude']
      &&        
      item['location']['longitude'] === coords['longitude']
      ));
    if(selected.length !== 0) {
      setSelectedPost(selected[0]);
      // console.log('Filtered not empty', selected);
      } else { 
      // console.log('Filtered empty', selected);
    }
   }
  }

  const pinLocationMsg = () => {
    let message = '';
    if(newCaseType === 'Lost') {
      message = `Is this where your ${newPetType.toLowerCase()} was last spotted?`
    } else {
      message = `Is this where you found this ${newPetType.toLowerCase()}?`
    }
    return message;
  }

  const timeFormat = (created_at_str) => {
    let date = created_at_str.split('T')[0];
    let time = created_at_str.split('T')[1].slice(0,5);
    let res = `${date}, at ${time}`;
    return res
  }

  const onAddCancelPress = () => {
    setSelectedPost(null);
    setNewPetType(null);
    setNewPetGender(null);
    setNewCaseType(null);
    setNewMarkerCoord(null);
    setLongPressReady(false);
    setAdded(false);

    if(isAdding) {
      setIsAdding(false);
      getAllPosts();
    } else if (!selectedPost) {
      setIsAdding(true);
    } else {
      setIsAdding(false);
    }
  }

  const initialFocus = () => {
    if(props.route.params) {
      let latLong = JSON.parse(props.route.params.focusLocation)
      let loc = {
        ...latLong, 
        latitudeDelta: 0.1, longitudeDelta: 0.1
      }
      return loc;
    } else {
      let loc = {
        latitude: 33.84,
        longitude: 35.6,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5
        }

      // let loc = {
      //   latitude: 33.84,
      //   longitude: 35.6,
      //   latitudeDelta: 0.3,
      //   longitudeDelta: 0.3
      //   }
  
        return loc;
      }
  }

  const getAllPosts = () => {
    axios.get(`${hostLink}/listPosts`).then(res => {
      // console.log('Data fetched from getAllPosts: ', res.data);
      let markersData = []
      for(let i=0; i<res.data.length; i++) {
        let marker = {...res.data[i]};
        marker['location'] = JSON.parse(res.data[i]['location']);
        
        if(marker.petType === 'Cat') {
          (marker.caseType === 'Lost')
            ? marker['icons'] = [cat_lost, cat_lost_active]
            : marker['icons'] = [cat_found, cat_found_active]
          } else {
            (marker.caseType === 'Lost')
            ? marker['icons'] = [dog_lost, dog_lost_active]
            : marker['icons'] = [dog_found, dog_found_active]
          }

        // console.log('after switch: ', marker.petType, marker.caseType);  
        markersData.push(marker);
        }
      // console.log('markersData: ', markersData);
      setMarkers(markersData);
      // setAllPosts(res.data);
    }).catch(err => {
      console.log(err, 'failed to fetch posts')
    })
  }

  const getUser = (uid) => {
    axios.get(`${hostLink}/getUser/${uid}`).then(res => {
      // console.log('User fetched from getUser: ', res.data.name);
      setSelectedUser({name: res.data.name, photo: res.data.photo});
    }).catch(err => {
        console.log(err, 'failed to fetch user')
      })
    }


  useEffect(() => {
    // console.log('Map window in focus:', isFocused);
    // console.log('Map initialRoute prop:', props.route.params.focusLocation);
    // console.log('Map initialFocus:', initialFocus());
    
    
    if(newCaseType === 'Found') {
      setLongPressReady(true);
    } else if (newPetGender) {
      setLongPressReady(true);
    }

    LogBox.ignoreLogs(['Possible Unhandled Promise']);      

    if(isFocused) {
      if(reRender) {
      getAllPosts();
      setReRender(false);
      }
    } else {
      setReRender(true);
    }

    /*
    console.log('petType:', newPetType, 
    '- caseType:', newCaseType, 
    '- gender:', newPetGender,
    '- pin ready:', longPressReady,
    // '- isAdding:', isAdding
    );
    */

  })

  useEffect(() => {
    let shownData = markers;
    
    if(!showLost) {
      shownData = shownData.filter(post => post.caseType === 'Found');
    }
    if(!showFound) {
      shownData = shownData.filter(post => post.caseType === 'Lost');
    }
    if(!showDog) {
      shownData = shownData.filter(post => post.petType === 'Cat');
    }
    if(!showCat) {
      shownData = shownData.filter(post => post.petType === 'Dog');
    }
    if(showMine) {
      shownData = shownData.filter(post => post.uid === firebase.auth().currentUser.uid);
    }

    if(shownData != shownMarkers) {
      setShownMarkers(shownData);
      // setReRender(!reRender);
    }

    if(!markers || !shownMarkers) {
      // setReRender(!reRender);
    }
    if(!isAdding) {
      // setReRender(!reRender);
    }

  }, [showFound, 
      showLost,
      showCat, 
      showDog,
      showMine,
      markers
    ])

  useEffect(() => {
    getAllPosts();
    setAdded(false);
    setIsAdding(false);
    setNewMarkerCoord(null);
    setNewPetGender(null);
    setNewPetType(null);
    setNewCaseType(null);
    setLongPressReady(false);
    setSelectedPost(null);
    setSelectedUser({});
    // console.log('From map re-render');
  }, [reRender])
  
  useEffect(() => {
    selectedPost && getUser(selectedPost.uid);
    // alert(JSON.stringify(selectedPost));
    // console.log('Selected pin: ', selectedPost);
  }, [selectedPost])
  
  /*
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      // console.log(location);
      setUserLocation(location);

    })();
  }, [])
  */

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        loadingEnabled={true}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onLongPress={(e) => onAddPin(e)}
        initialRegion={{
          latitude: 33.94,
          longitude: 35.6,
          latitudeDelta: 0.6,
          longitudeDelta: 0.6
          }}>
        
      {shownMarkers.map((marker, index) => (
        <MapView.Marker
          key={marker['id']}
          coordinate={marker['location']}
          image={(selectedPost && marker['id'] === selectedPost['id']) 
            ? marker['icons'][1] : marker['icons'][0]} 
          onPress={(e) => onSelectPin(e)}/>
      ))}

      { newMarkerCoord &&
      <MapView.Marker
          key={(markers.length)*100}
          coordinate={newMarkerCoord} />
        }

      </MapView>



      <View style={ showFilters 
        ? styles.filtersContainerActive
        : styles.filtersContainerInactive}>
        { showFilters ? (
      <>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.filtersTitle}>
            Filters:
          </Text>
          <TouchableOpacity 
            onPress={() => setShowFilters(false)}
            style={styles.hideFiltersButton}>
            <MaterialCommunityIcons 
              name='close-thick' 
              size={20}
              color='red'/>
          </TouchableOpacity>
        </View>

        <View style={{flexDirection: 'row', 
          width: '100%'}}>
        <View style={styles.filterBox}>
          <TouchableOpacity
            onPress={onCatCheck}
            style={showCat 
              ? {...styles.filterButtonActive, marginLeft: 0}
              : {...styles.filterButtonInactive, marginLeft: 0}}>
            <Image
              source={cat}
              style={styles.filterPetIcon}/>
          </TouchableOpacity>

          <TouchableOpacity
            style={showDog
              ? styles.filterButtonActive
              : styles.filterButtonInactive}
            onPress={onDogCheck}>
            <Image
              source={dog}
              style={styles.filterPetIcon}/>
          </TouchableOpacity>

          <TouchableOpacity
            style={showLost 
              ? {...styles.filterButtonActive}
              : styles.filterButtonInactive}
            onPress={onLostCheck}>
            <Text
              style={styles.filterCaseText}>
              Lost
            </Text>
          </TouchableOpacity> 

          <TouchableOpacity
            style={showFound 
              ? {...styles.filterButtonActive}
              : {...styles.filterButtonInactive}}
            onPress={onFoundCheck}>
            <Text
              style={styles.filterCaseText}>
              Found
            </Text>
          </TouchableOpacity>

          </View>
         </View>

         <View style={{...styles.filterBox,paddingTop: 3}}>
          <MaterialCommunityIcons 
            size={20} 
            name={mineCheckbox} 
            onPress={onMineCheck}
            style={{marginRight: 5}}
          />
          <Text style={{fontStyle: 'italic'}}>Only show my posts </Text>
        </View>
        </>
        ) : (
          <TouchableOpacity
            onPress={() => setShowFilters(true)}>
            <MaterialCommunityIcons 
              size={30}
              name='map-search-outline'
              />
          </TouchableOpacity>
        )}

      </View>



      { selectedPost && 
        <View style={{...styles.selectedContainer,
          backgroundColor: selectedPost.caseType === 'Lost'
          ? Color.Color_O1 
          : Color.Color_G5}}>
          <View style={styles.selectedBody}>

            <View style={{...styles.selectedUserContainer,
              borderBottomColor: selectedPost.caseType === 'Lost'
              ? Color.Color_O1 : Color.Color_G5}}>
              <Image
                source={{uri: selectedUser.photo}}
                style={styles.selectedUserPhoto}/>            
              
              <View style={styles.selectedUserTextContainer}>
                <Text>
                  Post by {selectedUser.name}
                </Text>

                <Text>
                  On {timeFormat(selectedPost.created_at)}
                </Text>
              </View>
            </View>

            <View style={styles.selectedPostContainer}>
              <View style={styles.selectedPostLeft}>
                <Image
                  source={{uri: selectedPost.downloadURL}}
                  style={styles.selectedPostPhoto}/>
                <TouchableOpacity
                  style={styles.goToPostButton}
                  onPress={() => props.navigation.navigate('Post', {item: selectedPost})}>
                  <MaterialCommunityIcons 
                    name='information-outline' 
                    size={20}
                    color='#fff'/>
                  <Text style={styles.goToText}>
                    Details
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.selectedPostRight}>
                

                <View style={styles.selectedPostDesc}>
                  <MaterialCommunityIcons 
                      size={25} 
                      color={Color.Color_B4} 
                      name='format-quote-open' 
                      style={{alignSelf: 'flex-start'}}
                      />
                  <Text 
                    numberOfLines={5}
                    style={styles.selectedPostDescText}>
                    {selectedPost.description} 
                  </Text>
                  <MaterialCommunityIcons 
                      size={25} 
                      color={Color.Color_B4} 
                      name='format-quote-close' 
                      style={{alignSelf: 'flex-end'}}
                      />
                </View>

                <TouchableOpacity 
                  onPress={() => onAddCancelPress()}
                  style={styles.deselectButton}>
                  <MaterialCommunityIcons 
                    name='close-thick' 
                    size={30}
                    color='#fff'/>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      }


      { (isAdding && added) && (
      <View style={styles.twoButtons}>
        <TouchableOpacity
          style={styles.unAddButton}
          onPress={() => onAddCancelPress()}>
          <MaterialCommunityIcons 
            name='close-thick'
            size={50}
            color='white' />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => props.navigation.navigate('TakeImage', {
            petType: newPetType,
            caseType: newCaseType,
            petGender: newPetGender,
            location: newMarkerCoord,
            allPosts: markers})}
        >
          <MaterialCommunityIcons 
            name='check'
            size={50}
            color='white' />
        </TouchableOpacity>
      </View>
      )} 
      { (isAdding && !added) && (
        <TouchableOpacity
          style={styles.addCancelButton}
          onPress={() => onAddCancelPress()}>
          <MaterialCommunityIcons 
            name='close-thick' 
            size={50}
            color='white' />
        </TouchableOpacity>
      )}

      { !isAdding && (
        <TouchableOpacity
          style={styles.addCancelButton}
          onPress={() => onAddCancelPress()}>
          <MaterialCommunityIcons 
            name='map-marker-plus-outline' 
            size={50}
            color='white' />
        </TouchableOpacity>
      )}

      { (isAdding && !added && !newPetType) &&
        <View style={{...styles.popupAddedContainer, bottom: 214}}>
          <View style={styles.popupAddedBody}>
            <Text
              style={{fontSize: 13, marginBottom: 8, fontStyle: 'italic'}}>
              Is this about a cat or a dog?
            </Text>
            <View style={styles.petIconsContainer}>
              <TouchableOpacity 
                style={styles.catIconContainer}
                onPress={() => setNewPetType('Cat')}>
                <Image
                  source={cat}
                  size={10}
                  style={styles.catIcon}/>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.dogIconContainer}
                onPress={() => setNewPetType('Dog')}>
                <Image
                  source={dog}
                  style={styles.dogIcon}/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }


      { (isAdding && !added && newPetType && !newCaseType) &&
        <View style={{...styles.popupAddedContainer, bottom: 214}}>
          <View style={styles.popupAddedBody}>
            <Text
              style={{fontSize: 13, marginBottom: 8, fontStyle: 'italic'}}>
              Was this {newPetType.toLowerCase()} lost or found?
            </Text>
            <View style={styles.petIconsContainer}>
              <TouchableOpacity 
                style={styles.lostIconContainer}
                onPress={() => setNewCaseType('Lost')}>
                <Image
                  source={(newPetType === 'Cat') ? cat_lost : dog_lost}
                  size={10}
                  style={styles.catIcon}/>
                <Text style={{color: Color.Color_O1, fontWeight: 'bold'}}>Lost</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.foundIconContainer}
                onPress={() => setNewCaseType('Found')}>
                <Image
                  source={(newPetType === 'Cat') ? cat_found : dog_found}
                  style={styles.dogIcon}/>
                <Text style={{color: Color.Color_G5, fontWeight: 'bold'}}>Found</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        }

      { (isAdding && !added && newPetType && !newPetGender && (newCaseType === 'Lost')) &&
        <View style={{...styles.popupAddedContainer, bottom: 214}}>
          <View style={styles.popupAddedBody}>
            <Text
              style={{fontSize: 13, marginBottom: 8, fontStyle: 'italic'}}>
              Is your lost {newPetType.toLowerCase()} male or female?
            </Text>
            <View style={styles.petIconsContainer}>
              <TouchableOpacity 
                style={{...styles.lostIconContainer, borderColor: Color.Color_B7}}
                onPress={() => setNewPetGender('Male')}>
                <MaterialCommunityIcons 
                  name='gender-male' 
                  size={50}
                  color={Color.Color_B7}/>
                <Text style={{color: Color.Color_B7, fontWeight: 'bold'}}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{...styles.foundIconContainer, borderColor: Color.Color_B7}}
                onPress={() => setNewPetGender('Female')}>
                <MaterialCommunityIcons 
                  name='gender-female' 
                  size={50}
                  color={Color.Color_B7}/>
                <Text style={{color: Color.Color_B7, fontWeight: 'bold'}}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        }


      {/* { (isAdding && !added && newPetType
          && ((newCaseType === 'Found') || ((newCaseType === 'Lost') && newPetGender))) &&  */}
      { longPressReady && !added &&
        <View style={styles.popupNotAddedContainer}>
          {/* <Text>Creating pin at {JSON.stringify(newMarkerCoord)}</Text> */}
          <View style={styles.popupNotAddedBody}>
            <MaterialCommunityIcons 
                name='gesture-double-tap' 
                size={40}
                style={{marginBottom: 1}}
                color='red'/>
            <Text
              style={{fontSize: 17}}>
              Long press to add pin 
            </Text>
          </View>
        </View>
      }

      { added &&
        <View style={styles.popupAddedContainer}>
          <View style={styles.popupAddedBody}>
            <Text
              style={{fontSize: 13, marginBottom: 5, fontStyle: 'italic'}}>
              {/* Is this where the pet was last spotted? */}
              {pinLocationMsg()}
            </Text>
            <MaterialCommunityIcons 
              name='map-marker-radius' 
              size={40}
              style={{margin: 8}}
              color='red' />
            <Text 
              style={{fontSize: 13}}>
              Long press the map to edit pin 
            </Text>
            <Text
              style={{fontSize: 16, fontWeight: 'bold'}}>
              Create post at this location? 
            </Text>
          </View>
        </View>
        }

    </View>
  );
}

const styles = StyleSheet.create({
  addCancelButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.Color_B11,
    borderRadius: 50,
    borderWidth: .5,
    bottom: 80,
    left: 130,
    width: 70,
    height: 70
  },
  catIcon: {
    aspectRatio: 1,
    flex: 3/4
  },
  catIconContainer: {
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: Color.Color_B5,
    borderWidth: 2,
    // borderColor: Color.Color_B5,
    borderRadius: 30,
    height: 90,
    width: 90
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  deselectButton: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: Color.Color_R4,
    borderRadius: 25,
    bottom: 145,
    left: 145,
    height: 35,
    width: 35
  },
  dogIcon: {
    aspectRatio: 1,
    flex: 3/4
  },
  dogIconContainer: {
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: Color.Color_B5,
    borderWidth: 2,
    borderRadius: 30,
    height: 90,
    width: 90
  },
  foundIconContainer: {
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: Color.Color_W5,
    borderWidth: 2,
    borderColor: Color.Color_G5,
    borderRadius: 30,
    height: 90,
    width: 90
  },
  goToPostButton: {
    backgroundColor: Color.Color_G4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 5,
    marginLeft: 3,
    height: 35,
    width: 90,
  },
  goToText: {
    color: '#fff', 
    fontWeight: 'bold',
    marginLeft: 2,
    fontSize: 15
  },

  lostIconContainer: {
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: Color.Color_W5,
    borderWidth: 2,
    borderColor: Color.Color_O1,
    borderRadius: 30,
    height: 90,
    width: 90
  },
  map: {
    alignSelf: 'flex-start',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 79,
    marginTop: 25
  },
  petIconsContainer: {
    // height: 50,
    flexDirection: 'row'
  },
  popupAddedBody: {
    height: 150,
    width: 240,
    borderRadius: 10,
    backgroundColor: Color.Color_W5,
    paddingTop: 10,
    // justifyContent: 'center',
    alignItems: 'center'
  },
  popupAddedContainer: {
    height: 150,
    width: 250,
    borderRadius: 10,
    backgroundColor: Color.Color_BL2,
    bottom: 290,
    right: 45,
    alignItems: 'center',
    paddingTop: 5
  }, 
  popupNotAddedBody: {
    height: 90,
    width: 240,
    borderRadius: 10,
    backgroundColor: Color.Color_W5,
    paddingTop: 5,
    // justifyContent: 'center',
    alignItems: 'center'
  },
  popupNotAddedContainer: {
    height: 85,
    width: 250,
    borderRadius: 10,
    backgroundColor: Color.Color_BL2,
    bottom: 150,
    right: 45,
    alignItems: 'center',
    paddingTop: 5
  },
  popupText: {
    fontSize: 15
  },
  twoButtons: {
    backgroundColor: Color.Color_BL4,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 1,
    bottom: 150,
    left: 130,
    width: 70,
    // height: 70
  },
  saveButton: {
    backgroundColor: 'green',
    borderRadius: 30,
    marginTop: 5
  },
  selectedBody: {
    height: 190,
    width: 290,
    borderRadius: 5,
    backgroundColor: Color.Color_W6,
    // paddingTop: 10,
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  selectedContainer: {
    width: 300,
    borderRadius: 5,
    height: 200,
    bottom: 228,
    alignItems: 'center',
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 7,
    },
    shadowOpacity: 0.47,
    shadowRadius: 8.49,

    elevation: 17,
  },
  selectedPostLeft: {
    bottom: 2,
    marginRight: 4
  },
  selectedPostRight: {
    paddingHorizontal: 5
  },
  selectedPostContainer: {
    flexDirection: 'row',
    padding: 5,
    width: 190,
    // paddingTop: 10,
    marginBottom: 3,
  },
  selectedPostDesc: {
    height: 80,
    // width: 200
  },
  selectedPostDescText: {
    fontSize: 14,
    fontStyle: 'italic'
  },
  selectedPostPhoto: {
    aspectRatio: 1,
    height: 90,
    width: 90,
    borderRadius: 5,
    margin: 3 
  },
  selectedUserContainer: {
    width: 290,
    borderRadius: 5,
    height: 50,
    // alignItems: 'center',
    flexDirection: 'row',
    padding: 5,
    paddingTop: 3,
    // marginBottom: 3,
    borderBottomWidth: 3,
    // backgroundColor: Color.Color_W4
  },
  selectedUserPhoto: {
    aspectRatio: 1,
    width: 35,
    height: 35,
    margin: 3,
    borderRadius: 5
  },
  selectedUserTextContainer: {
    // alignItems: 'center',
    justifyContent: 'center',
    // bottom: 10,
    marginLeft: 5
  },
  unAddButton: {
    backgroundColor: 'red',
    borderRadius: 30,
    marginBottom: 5
  },
  filterBox: {
    flexDirection: 'row',
    marginTop: 3,
    // shadowColor: "#000",
  },
  filtersContainerActive: {
    height: 110,
    width: 215,
    zIndex: 10,
    borderBottomColor: Color.Color_R2,
    borderBottomWidth: .2,
    // alignSelf: 'center',
    position: 'absolute',
    backgroundColor: '#fff',
    // backgroundColor: Color.Color_B3,
    // margin: 5,
    // marginLeft: 0,
    // marginBottom: 0,
    padding: 10,
    left: 69,
    top: 60,
    borderRadius: 8,
    // paddingLeft: 20,
    paddingTop: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  filtersContainerInactive: {
    height: 40,
    width: 50,
    zIndex: 10,
    // alignSelf: 'center',
    position: 'absolute',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    left: 30,
    top: 50,
    borderRadius: 12,
    paddingHorizontal: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  filterButtonInactive: {
    borderWidth: 0.5,
    // width: 72.5,
    // height: 55,
    width: 44,
    height: 40,
    marginHorizontal: 3,
    marginVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: Color.Color_BL5
  },
  filterCaseText: {
    // fontStyle: 'italic'
  },
  filterButtonActive: {
    borderWidth: 1,
    // width: 72.5,
    // height: 55,
    width: 44,
    height: 40,
    marginVertical: 2,
    marginHorizontal: 3,
    backgroundColor: Color.Color_B9,
    // backgroundColor: Color.Color_B1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  filterPetIcon: {
    aspectRatio: 1,
    width: 30,
    height: 30,
  },
  filtersTitle: {
    fontWeight: 'bold',
    fontSize: 17,
  },
  hideFiltersButton: {
    bottom: 5,
    left: 182,
    // width: 30,
    // height: 30,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
});