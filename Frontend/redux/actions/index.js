import firebase from 'firebase';
import { USER_STATE_CHANGE, USER_POSTS_STATE_CHANGE, CLEAR_DATA } from '../constants/index';


export function clearData() {
    return ((dispatch) => {
        dispatch({ type: CLEAR_DATA })
    })
}

export function fetchUser() {
    return ((dispatch) => {
        firebase.firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .get()
            .then((snapshot) => {
                if(snapshot.exists) {
                    console.log('from fetchUser, snapshot:', snapshot.data());
                    dispatch({type: USER_STATE_CHANGE, currentUser: snapshot.data()});
                } else {
                    console.log('USER DOES NOT EXIST')
                }
            })
    })
}

export function fetchUserPosts() {
    return ((dispatch) => {
        firebase.firestore()
            .collection('posts')
            .doc(firebase.auth().currentUser.uid)
            .collection('userPosts')
            .orderBy('creation', 'asc')
            .get()
            .then((snapshot) => {
                // console.log('from fetchUserPosts:', snapshot.docs);

                let posts = snapshot.docs.map(doc => {
                    const id = doc.id;
                    const data = doc.data();
                    // console.log('TESTESTEST', data)

                    return { id, ...data };
                })

                console.log('posts after mapping:', posts);
                dispatch({type: USER_POSTS_STATE_CHANGE, posts});

            })
    })
}