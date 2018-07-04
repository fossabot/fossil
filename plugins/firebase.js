import Vuex from 'vuex'
import firebase from 'firebase'
import 'firebase/storage' // Workaround for Nuxt usage

// New Firebase Project Template 
import firebaseTemplate from '~/assets/firebase/template'
import styleTemplate from '~/assets/map-style/starter-style'

// Reference: https://github.com/davidroyer/nuxt-firebase-auth/blob/master/plugins/fireauth.js
export default (context) => {
  const { store } = context

  if (!firebase.apps.length) {
    firebase.initializeApp(process.env.firebaseConfig)
  }
  
  var db = firebase.database()
  var storage = firebase.storage()
  var storageRef = storage.ref()
  var imageStoreRef = storageRef.child('maps/content')
  var styleStoreRef = storageRef.child('style/style.json')


  // If this is a brand new project, setup a new project
  db.ref('project').once('value')
    .then((snap) => {
      if (snap.val() === null) {
        this.$bus.$emit('openModal', 'setup')
      }
    })

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      var profile = {
        displayName: user.displayName,
        email: user.email,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
        uid: user.uid,
        providerData: user.providerData,
      }
      if (!profile.emailVerified) {
        console.log('Email not verified')
        // store.dispatch('sendEmailVerification')
        store.commit('setActiveUser', profile)
        store.commit('setEditModeState', false)

      } else {
        // Email Verified Register User
        var usersRef = db.ref('users')
        usersRef.once('value')
          .then((snapshot) => {
            //  If this is the very first user
            if (snapshot.val() === null) {
              // Set role as admin
              profile.role = 'admin'
              db.ref('users/' + user.uid).set(profile)
              store.commit('setEditModeState', true)
            }
            // Check if new/existing user
            return db.ref('users/' + user.uid).once('value')
          })
          .then((snapshot) => {
            if (snapshot) {
              // If user doesn't exist
              if (snapshot.val() === null) {
                // Create new editor
                profile.role = 'editor'
                db.ref('users/' + user.uid).set(profile)
                store.commit('setEditModeState', true)
              } else {
                // User Exists
                // Is it Admin / Editor / Unassigned User
                if (snapshot.val().role === 'admin') {
                  // Admin
                  profile.role = 'admin'
                  store.commit('setEditModeState', true)
                } else if (snapshot.val().role === 'editor') {
                  // Editor
                  profile.role = 'editor'
                  store.commit('setEditModeState', true)
                } else {
                  // Read Only Access
                  profile.role = 'read-only'
                  store.commit('setEditModeState', false)
                }
                db.ref('users/' + user.uid).set(profile)
                store.commit('setActiveUser', profile)
              }
            }
          })
      }
    } else {
      // User is signed out.
      store.commit('setActiveUser', '')
      store.commit('setEditModeState', false)
    }
  })

}
