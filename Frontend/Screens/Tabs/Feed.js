import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsFocused } from '@react-navigation/native';

import { connect } from 'react-redux';
import firebase from 'firebase';

// import { fetchUser, fetchUserPosts } from '../../redux/actions';
// import { bindActionCreators } from 'redux';

import * as Color from '../../assets/Colors';

import cat from '../../assets/icons/cat.png';
import cat_off from '../../assets/icons/cat_off.png'; 
import cat_lost from '../../assets/icons/cat_lost.png'; 
import cat_found from '../../assets/icons/cat_found.png';

import dog from '../../assets/icons/dog.png'; 
import dog_off from '../../assets/icons/dog_off.png'; 
import dog_lost from '../../assets/icons/dog_lost.png'; 
import dog_found from '../../assets/icons/dog_found.png'; 

import hostLink from '../../assets/ngrokHost';
import axios from 'axios';

function Feed(props) {

    // const currentUser = props;
    const numOfCols = 1;

    const [allPosts, setAllPosts] = useState([]);
    const [shownPosts, setShownPosts] = useState([]);
   
    const [ngoPosts, setNgoPosts] = useState([]);
    const [shownNgoPosts, setShownNgoPosts] = useState([]);

    const isFocused = useIsFocused();
    const [reRender, setReRender] = useState(true);
    const [refresh, setRefresh] = useState(false);
    
    const [listType, setListType] = useState("userPosts");

    const [catCheckbox, setCatCheckbox] = useState("checkbox-marked");
    const [dogCheckbox, setDogCheckbox] = useState("checkbox-marked");
    const [showCat, setShowCat] = useState(true);
    const [showDog, setShowDog] = useState(true);

    const [showMale, setShowMale] = useState(true);
    const [showFemale, setShowFemale] = useState(true);

    const [showFilters, setShowFilters] = useState(true);

    const [lostCheckbox, setLostCheckbox] = useState("checkbox-marked");
    const [foundCheckbox, setFoundCheckbox] = useState("checkbox-marked");
    const [showLost, setShowLost] = useState(true);
    const [showFound, setShowFound] = useState(true);

    const [mineCheckbox, setMineCheckbox] = useState("checkbox-blank-outline");
    const [showMine, setShowMine] = useState(false);

    const [userNames, setUserNames] = useState({});
    const [userTypes, setUserTypes] = useState({});
    const [userPhotos, setUserPhotos] = useState({});

    const [boxHeight, setBoxHeight] = useState(110);
    const [initialPushdown, setInitialPushdown] = useState(150);
    const [initialPushdownAdopt, setInitialPushdownAdopt] = useState(120);


    const timeFormat = (created_at_str) => {
      let date = created_at_str.split('T')[0];
      let time = created_at_str.split('T')[1].slice(0,5);
      let res = `${date}, at ${time}`;
      return res
    }

    const petIcon = (item) => {
      // console.log(`${petType} ${caseType}`);
      switch(`${item.petType} ${item.caseType}`) {
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

    const onMineCheck = () => {
      mineCheckbox === 'checkbox-marked' 
        ? setMineCheckbox('checkbox-blank-outline') 
        : setMineCheckbox('checkbox-marked');  
      
      setShowMine(!showMine);
      // getAllPosts();
      // getNgoPosts();
    }

    const onCatCheck = () => {
      catCheckbox === 'checkbox-marked' 
        ? setCatCheckbox('checkbox-blank-outline') 
        : setCatCheckbox('checkbox-marked');  
      
      // console.log('from cat filter press:', showCat);
      setShowCat(!showCat);
      // getAllPosts();
      // getNgoPosts();
    }

    const onDogCheck = () => {
      dogCheckbox === 'checkbox-marked' 
        ? setDogCheckbox('checkbox-blank-outline') 
        : setDogCheckbox('checkbox-marked');  
      
      setShowDog(!showDog);
      // getAllPosts();
      // getNgoPosts();
    }
    
    const onFoundCheck = () => {
      foundCheckbox === 'checkbox-marked' 
        ? setFoundCheckbox('checkbox-blank-outline') 
        : setFoundCheckbox('checkbox-marked');  
      
      setShowFound(!showFound);
      // getAllPosts();
    }

    const onLostCheck = () => {
      lostCheckbox === 'checkbox-marked' 
        ? setLostCheckbox('checkbox-blank-outline') 
        : setLostCheckbox('checkbox-marked');  
      
      setShowLost(!showLost);
      // getAllPosts();
    }
    
    const onMaleCheck = () => {
      setShowMale(!showMale);
      // getNgoPosts();
    }

    const onFemaleCheck = () => {
      setShowFemale(!showFemale);
      // getNgoPosts();
    }

    const onFilterToggle = () => {
      if(showFilters) {
        setInitialPushdown(60);
        setInitialPushdownAdopt(60);
      } else {
        setInitialPushdown(150);
        setInitialPushdownAdopt(120);
      }

      setShowFilters(!showFilters);
    }

    const onListToggle = (type) => {
      if(type === 'userPosts') {
        setBoxHeight(110);
      } else {
        setBoxHeight(85);
      }
      setListType(type);
    }

    const getAllPosts = () => {
      axios.get(`${hostLink}/listPosts`).then(res => {
        // console.log('Data fetched from getAllPosts: ', res.data);
        let newest_first = res.data.reverse();
        setAllPosts(newest_first);
      }).catch(err => {
        console.log(err, 'failed to fetch posts')
      })
      getAllUsers();
    }

    const getNgoPosts = () => {
      axios.get(`${hostLink}/listNgoPosts`).then(res => {
        // console.log('Data fetched from getNgoPosts: ', res.data);
        let newest_first = res.data.reverse();
        setNgoPosts(newest_first);
      }).catch(err => {
        console.log(err, 'failed to fetch ngo posts')
      })
      getAllUsers();
    }

    const getAllUsers = () => {
      axios.get(`${hostLink}/listUsers`).then(res => {
        // console.log('Data fetched from getAllUsers: ', res.data);
        
        let usersNames = {}
        let usersPhotos = {}
        let usersTypes = {}

        for (let i=0; i<res.data.length; i++) {
          usersTypes[res.data[i].uid] = res.data[i].user_type;
          usersNames[res.data[i].uid] = res.data[i].name;
          usersPhotos[res.data[i].uid] = res.data[i].photo;
        }
        
        // console.log('usersInfo dictionary');
        setUserNames(usersNames);
        setUserTypes(usersTypes);
        setUserPhotos(usersPhotos);
      }).catch(err => {
        console.log(err, 'failed to fetch users')
      })
    }

    const onAddNgoPost = () => {
      // console.log('add ngo button pressed');
      props.navigation.navigate('TakeImageNGO')
    }

    useEffect(() => {
      // console.log('From feed, listType:', listType);
      // console.log('Feed window in focus:', isFocused);
      if(isFocused) {

        if(reRender) {
          getAllPosts();
          getNgoPosts();
          setReRender(false);
        }
      } else {
        setReRender(true);
      }

      // console.log('Test user type, user/type:', 
        // userTypes[firebase.auth().currentUser.uid],
        // userNames[firebase.auth().currentUser.uid])
    })
    

    useEffect(() => {
      let shownData = allPosts;
      let shownNgoData = ngoPosts;
      
      if(!showLost) {
        shownData = shownData.filter(post => post.caseType === 'Found');
      }
      if(!showFound) {
        shownData = shownData.filter(post => post.caseType === 'Lost');
      }
      if(!showDog) {
        shownData = shownData.filter(post => post.petType === 'Cat');
        shownNgoData = shownNgoData.filter(post => post.petType === 'Cat');
      }
      if(!showCat) {
        shownData = shownData.filter(post => post.petType === 'Dog');
        shownNgoData = shownNgoData.filter(post => post.petType === 'Dog');
      }
      if(showMine) {
        shownData = shownData.filter(post => post.uid === firebase.auth().currentUser.uid);
        shownNgoData = shownNgoData.filter(post => post.uid === firebase.auth().currentUser.uid);
      }
      if(!showFemale) {
        shownNgoData = shownNgoData.filter(post => post.petGender === 'Male');
      }
      if(!showMale) {
        shownNgoData = shownNgoData.filter(post => post.petGender === 'Female');
      }

      if(shownData != shownPosts) {
        setShownPosts(shownData);
        setRefresh(!refresh);
      }
      if(shownNgoData != shownNgoPosts) {
        setShownNgoPosts(shownNgoData);
        setRefresh(!refresh);
      }
      if(allPosts == [] || ngoPosts == []) {
        setRefresh(!refresh);
      }
      setRefresh(!refresh);

      // console.log('from filters hook:', userTypes);

    }, [showFound, 
        showLost,
        showMale,
        showFemale, 
        showCat, 
        showDog, 
        showMine,
        listType, 
        allPosts,
        ngoPosts])

    useEffect(() => {
      getAllPosts();
      getNgoPosts();
      // setShownPosts(allPosts);
    }, [reRender])

    useEffect(() => {
      // console.log('refresh hook:', ngoPosts);
    }, [refresh])


    return (
      <View style={styles.backgroundContainer}>
        <View style={styles.title}>
          <TouchableOpacity 
            onPress={() => onListToggle('userPosts')}
            style={listType !== 'userPosts' ? 
              styles.userPostsButton : 
              {...styles.userPostsButton, 
                borderColor: Color.Color_B4,
                backgroundColor: Color.Color_W5}}>
            <MaterialCommunityIcons 
              size={20} 
              name='alert' 
              color={listType !== 'userPosts' ? 
              Color.Color_B9 : 
              Color.Color_B4}/>
            <Text style={listType !== 'userPosts' ?
              styles.titleText :
              {...styles.titleText, 
              color: Color.Color_B4}}>
                Lost/Found
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onListToggle('ngoPosts')}
            style={listType !== 'ngoPosts' ? 
              styles.ngoPostsButton : 
              {...styles.ngoPostsButton, 
                borderColor: Color.Color_B4,
                backgroundColor: Color.Color_W5}}>
            <MaterialCommunityIcons 
              size={20} 
              name='paw'
              color={listType !== 'ngoPosts' ? 
                Color.Color_B9 : 
                Color.Color_B4}/>
            <Text style={listType !== 'ngoPosts' ?
              styles.titleText :
              {...styles.titleText, 
              color: Color.Color_B4}}>
                Adopt
            </Text>
          </TouchableOpacity>
      </View>


      <View style={ showFilters 
        ? {...styles.filtersContainerActive, height: boxHeight}
        : {...styles.filtersContainerInactive}}>
        { showFilters ? (
      <>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.filtersTitle}>
            Filters:
          </Text>
          <TouchableOpacity 
            onPress={() => onFilterToggle()}
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

          { listType === 'userPosts' &&
          <TouchableOpacity
            style={showLost 
              ? styles.filterButtonActive
              : styles.filterButtonInactive}
            onPress={onLostCheck}>
            <Text
              style={styles.filterCaseText}>
              Lost
            </Text>
          </TouchableOpacity> 
          }

          { listType === 'userPosts' &&
          <TouchableOpacity
            style={showFound 
              ? styles.filterButtonActive
              : styles.filterButtonInactive}
            onPress={onFoundCheck}>
            <Text
              style={styles.filterCaseText}>
              Found
            </Text>
          </TouchableOpacity>
          }

          { listType === 'ngoPosts' &&
            <TouchableOpacity
              style={showMale 
                ? styles.filterButtonActive
                : styles.filterButtonInactive}
              onPress={onMaleCheck}>
              <MaterialCommunityIcons 
                name='gender-male' 
                size={25}
                color='#000'/>
            </TouchableOpacity>
            }

          { listType === 'ngoPosts' &&
            <TouchableOpacity
              style={showFemale 
                ? styles.filterButtonActive
                : styles.filterButtonInactive}
              onPress={onFemaleCheck}>
              <MaterialCommunityIcons 
                name='gender-female' 
                size={25}
                color='#000'/>
            </TouchableOpacity>
            }  
        </View>
        </View>



        { (listType === 'userPosts')
          &&
        <View style={{...styles.filterBox,paddingTop: 3}}>
          <MaterialCommunityIcons 
            size={20} 
            name={mineCheckbox} 
            onPress={onMineCheck}
            style={{marginRight: 5}}
          />
          <Text style={{fontStyle: 'italic'}}>Only show my posts </Text>
        </View>
        }
      </>
        ) : (
          <TouchableOpacity
            onPress={() => onFilterToggle()}>
            <MaterialCommunityIcons 
              size={30}
              name='map-search-outline'
              />
          </TouchableOpacity>
        )}
    </View>
      


        <View style={styles.list}>
        { listType === 'userPosts' &&
          <FlatList
            numColumns={numOfCols}
            keyExtractor={item => item.id.toString()}
            horizontal={false}
            data={shownPosts}
            renderItem={({item}) => ((



              <View style={ item.id !== shownPosts[0].id
                ? styles.postContainer
                : {...styles.postContainer, marginTop: initialPushdown}}>
                <View style={styles.postBody}>
      
                  <View style={styles.postUserContainer}>
                    <Image
                      source={{uri: userPhotos[item.uid]}}
                      style={styles.postUserPhoto}/>            
                    
                    <View style={styles.postUserTextContainer}>
                      <Text>
                        Post by {userNames[item.uid]}
                      </Text>
      
                      <Text>
                        On {timeFormat(item.created_at)}
                      </Text>
                    </View>
                  </View>
      
                  <View style={{...styles.petIconContainer, 
                    borderColor: item.caseType === 'Lost'
                    ? Color.Color_O1
                    : Color.Color_G4}}>
                    <Image 
                      source={petIcon(item)}
                      style={styles.petIcon}/>
                  </View>

                  <View style={styles.postInfoContainer}>
                    <View style={styles.postLeft}>
                      <Image
                        source={{uri: item.downloadURL}}
                        style={styles.postPhoto}/>
                      <TouchableOpacity
                        style={styles.goToPostButton}
                        onPress={() => props.navigation.navigate('Post', {item})}>
                        <MaterialCommunityIcons 
                          name='information-outline' 
                          size={20}
                          color='#fff'/>
                        <Text style={styles.goToText}>
                          Details
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.postRight}>
                      <View style={styles.postDesc}>
                        <MaterialCommunityIcons 
                          size={25} 
                          color={Color.Color_B4} 
                          name='format-quote-open' 
                          style={{alignSelf: 'flex-start'}}
                          />
                        <Text 
                          numberOfLines={5}
                          style={styles.postDescText}>
                          {item.description} 
                        </Text>
                        <MaterialCommunityIcons 
                          size={25}
                          color={Color.Color_B4} 
                          name='format-quote-close' 
                          style={{alignSelf: 'flex-end'}}
                          />
                      </View>
      
                    </View>
                  </View>
                </View>
                </View>
            
            ))} />
          }

        { ((userTypes[firebase.auth().currentUser.uid] === 'NGO') 
            && (listType === 'ngoPosts'))
            && (
          <TouchableOpacity
            style={styles.addNgoPostButton}
            onPress={() => onAddNgoPost()}>
            <MaterialCommunityIcons 
              name='plus-box-multiple' 
              size={40}
              color='white' />
          </TouchableOpacity>
        )}

        { listType === 'ngoPosts' &&
          <FlatList
            numColumns={numOfCols}
            keyExtractor={item => item.id.toString()}
            horizontal={false}
            data={shownNgoPosts}
            renderItem={({item}) => ((

              <View style={ item.id !== shownNgoPosts[0].id
                ? styles.postContainer
                : {...styles.postContainer, marginTop: initialPushdownAdopt}}>
                <View style={styles.postBody}>
      
                  <View style={styles.postUserContainer}>
                    <Image
                      source={{uri: userPhotos[item.uid]}}
                      style={styles.postUserPhoto}/>            
                    
                    <View style={styles.postUserTextContainer}>
                      <Text>
                        Post by {userNames[item.uid]}
                      </Text>
      
                      <Text>
                        On {timeFormat(item.created_at)}
                      </Text>
                    </View>
                  </View>
      
                  <View style={styles.petIconContainer}>
                    <Image 
                      source={item.petType === 'Cat' ? cat : dog}
                      style={styles.petIcon}/>
                  </View>

                  <View style={styles.postInfoContainer}>
                    <View style={styles.postLeft}>
                      <Image
                        source={{uri: item.downloadURL}}
                        style={styles.postPhoto}/>
                      <TouchableOpacity
                        style={styles.goToPostButton}
                        onPress={() => props.navigation.navigate('Post', {item})}>
                        <MaterialCommunityIcons 
                          name='information-outline' 
                          size={20}
                          color='#fff'/>
                        <Text style={styles.goToText}>
                          Details
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.postRight}>
                      <View style={styles.postDesc}>
                        <MaterialCommunityIcons 
                          size={25} 
                          color={Color.Color_B4} 
                          name='format-quote-open' 
                          style={{alignSelf: 'flex-start'}}
                          />
                        <Text 
                          numberOfLines={5}
                          style={styles.postDescText}>
                          {item.description} 
                        </Text>
                        <MaterialCommunityIcons 
                          size={25}
                          color={Color.Color_B4} 
                          name='format-quote-close' 
                          style={{alignSelf: 'flex-end'}}
                          />
                      </View>
      
                    </View>
                  </View>
                </View>
                </View>
            
            ))} />
          }


        </View>
      </View>
    )
}

const styles = StyleSheet.create({
  addNgoPostButton: {
    zIndex: 10,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.Color_B11,
    borderRadius: 50,
    borderWidth: .5,
    top: 395,
    left: 265,
    width: 70,
    height: 70
},
  backgroundContainer: {
    flex: 1,
    marginTop: 25,
    // justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: Color.Color_W1
  },
  categoryTitle: {
    fontStyle: 'italic'
  },
  filterBox: {
    flexDirection: 'row',
    marginTop: 3,
    // shadowColor: "#000",
  },
  filtersContainerActive: {
    // height: 110,
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
  goToPostButton: {
    backgroundColor: Color.Color_G4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 5,
    marginTop: 3,
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
  image: {
    height: 150,
    width: 150,
    margin: 5,
    borderRadius: 15,
    aspectRatio: 1/1,
    // alignSelf: 'flex-start',
    borderColor: Color.Color_G2,
    borderWidth: 0.1,
  },
  list: {
    flex: 1,
    // marginTop: 5,
    // paddingTop: 15,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  ngoPostsButton: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomEndRadius: 10,
    borderWidth: 2,
    borderRightWidth: 1,
    backgroundColor: Color.Color_W2,
    borderColor: Color.Color_B9,
  },
  petIcon: {
    aspectRatio: 1,
    height: 30,
    width: 30
  },
  petIconContainer: {
    // padding: 10,
    borderRadius: 100,
    top: 5,
    right: 10,
    width: 40,
    height: 40,
    borderWidth: 1,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  postText: {
    // alignItems: 'flex-start',
    flexDirection: 'column',
    marginBottom: 10,
    width: 250
  },
  postBody: {
    height: 195,
    width: 315,
    borderRadius: 5,
    backgroundColor: Color.Color_W6,
    // paddingTop: 10,
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  postLeft: {
    bottom: 2,
    marginRight: 4
  },
  postRight: {
    paddingHorizontal: 5,
  },
  postContainer: {
    flexDirection: 'row',
    padding: 3,
    width: 320,
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
  postInfoContainer: {
    flexDirection: 'row',
    padding: 3,
    width: 320,
    // alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingTop: 7,
    marginBottom: 8,
    borderRadius: 5
  },
  postDesc: {
    height: 80,
    width: 190,
    // flexDirection: 'row'
  },
  postDescText: {
    fontSize: 14,
    fontStyle: 'italic'
  },
  postPhoto: {
    aspectRatio: 1,
    height: 90,
    width: 90,
    borderRadius: 5,
    margin: 3 
  },
  postUserContainer: {
    width: 315,
    borderRadius: 5,
    height: 50,
    // alignItems: 'center',
    // justifyContent: 'center',
    flexDirection: 'row',
    padding: 5,
    paddingTop: 3,
    // marginBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: Color.Color_B4,
    // backgroundColor: Color.Color_W4
  },
  postUserPhoto: {
    aspectRatio: 1,
    width: 35,
    height: 35,
    margin: 3,
    borderRadius: 5
  },
  postUserTextContainer: {
    // alignItems: 'center',
    justifyContent: 'center',
    // bottom: 1///0,
    marginLeft: 5
  },
  title: {
    height: 40,
    width: 200,
    justifyContent: 'center',
    // alignItems: 'center',
    flexDirection: 'row',
    // borderRadius: 5,
    // marginTop: 10,
    width: '100%',
    // backgroundColor: Color.Color_W2
  },
  titleText: {
    fontSize: 18,
    color: Color.Color_B9,
    marginLeft: 5,
    paddingBottom: 1,
    fontWeight: 'bold'
  },
  userPostsButton: {
    width: '50%',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomStartRadius: 10,
    borderWidth: 2,
    borderLeftWidth: 1,
    borderColor: Color.Color_B9,
    backgroundColor: Color.Color_W2,
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
})


export default connect(mapStateToProps, null)(Feed);