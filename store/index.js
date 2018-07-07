import Vue from 'vue'
import Vuex from 'vuex'
import firebase from 'firebase'
import 'firebase/storage' // Workaround for Nuxt usage

// New Firebase Project Template
import firebaseTemplate from '~/assets/firebase/template'
import styleTemplate from '~/assets/map-style/starter-style'

Vue.use(Vuex)

if (!firebase.apps.length) {
  firebase.initializeApp(process.env.firebaseConfig)
}

var db = firebase.database()
var storage = firebase.storage()
var storageRef = storage.ref()
var imageStoreRef = storageRef.child('maps/content')
var styleStoreRef = storageRef.child('style/style.json')

const state = {
  // True if active signed in user is admin or editor
  editMode: false,
  // List of all users
  allUsers: [],
  // Active user info
  user: {
    signedIn: false,
    admin: false,
    profile: {}
  },
  // Project info
  project: {
    title: 'NEW',
    subtitle: '',
    info: ''
  },
  // Map style
  style: {},
  // All project locations
  locations: {},
  // All project maps
  allMaps: {},
  // Active state proerties
  active: {
    location: null,
    locationKey: null,
    categories: {},
    maps: {},
    currentMap: {},
    satelliteMap: false,
  },
  // Mobile device flag
  isMobileDevice: false,
  // Right sidebar content
  rightSidebar: {
    title: '',
    subtitle: ''
  },
  // Map state
  mapbox: {
    style: {
      loaded: false
    },
    'visibleLayers': []
  }
}

const getters = {
  getMobileDevice: (state) => { return state.isMobileDevice },
  getEditModeState: (state) => { return state.editMode },
  getProject: (state) => { return state.project },
  getStyle: (state) => { return state.style },
  getSatelliteMapState: (state) => { return state.active.satelliteMap },
  getMapLoadedState: (state) => { return state.mapbox.style.loaded },
  getActiveLocation: (state) => { return { location: state.active.location, locationKey: state.active.locationKey } },
  getActiveMapPosition: (state) => { if (state.active.location) { return state.active.location.mapPosition } },
  getActiveCategories: (state) => { return state.active.categories },
  getActiveMaps: (state) => { return state.active.maps },
  getAllMaps: (state) => { return state.allMaps },
  getLocations: (state) => { return state.locations },
  getActiveUser: (state) => { return state.user },
  getAllUsers: (state) => { return state.allUsers }
}


const actions = {
  // Check if project exists
  checkProject: function(store) {
    return new Promise((resolve, reject) => {
      // Check for project key in Firebase Realtime DB
      db.ref('project').once('value')
        .then((snap) => {
          if (snap.val() === null) {
            // No project found
            resolve(false)
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  setMapLoadedState: function(store, flag) {
    store.commit('storeMapLoadedState', flag)
  },
  setMobileDevice: function(store, payload) {
    if (typeof(payload) === 'boolean') {
      store.commit('storeMobileDevice', payload)
    }
  },
  createShortLink: function(store, payload) {
    return new Promise((resolve, reject) => {
      var url = payload
      if (url !== "") {
        var id = Math.random().toString(36).substr(2, 6)
        db.ref('shortLinks/' + id).set(url)
          .then((snap) => {
            resolve(location.protocol + '//' + location.host + location.pathname + 'share/' + id)
          })
          .catch((error) => {
            reject(error)
          })
      }
    })
  },
  getLongLink: function(store, payload) {
    return new Promise((resolve, reject) => {
      db.ref('shortLinks/' + payload).once('value')
        .then((snap) => {
          resolve(snap)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },
  toggleSatellite: function(store) {
    store.commit('toggleSatellite')
  },
  // Firebase Realtime DB APIs
  createProject: function(store) {
    db.ref('project').once('value')
      .then((snap) => {
        if (snap.val() === null) {
          // Set basic template
          db.ref('/').set(firebaseTemplate)
            .then(() => {
              // Also set default map style to Basic Style
              // return db.ref('/style/').set(styleTemplate)
              return true
            })
            .then(() => {
              location.reload()
            })
        }
      })
  },
  getStyle: function(store) {
    return new Promise((resolve, reject) => {
      styleStoreRef.getDownloadURL()
        .then(function(url) {
          resolve(url)
        }).catch(function(error) {
          switch (error.code) {
            case 'storage/object-not-found':
              // File doesn't exist
              // Set Default Style
              store.dispatch('setDefaultStyle')
              break
          }
        })
    })
  },
  setDefaultStyle: function(store) {
    return new Promise((resolve, reject) => {
      styleStoreRef.putString(JSON.stringify(style))
        .then(function(snapshot) {
          alert('Default style set!')
          location.reload()
        })
    })
  },
  // Required?
  downloadStyle: function(store) {
    return new Promise((resolve, reject) => {
      styleStoreRef.getDownloadURL()
        .then(function(url) {
          resolve(url)
        }).catch(function(error) {
          reject(error)
        })
    })
  },
  uploadStyle: function(store, { style }) {
    return new Promise((resolve, reject) => {
      styleStoreRef.put(style)
        .then(function(snapshot) {
          resolve()
        })
        .catch((error) => { reject(error) })
    })
  },
  getAllMaps: function(store) {
    return new Promise((resolve, reject) => {
      var mapsRef = db.ref('maps')
      mapsRef.once('value')
        .then(function(snap) {
          store.commit('storeAllMaps', snap.val())
          resolve(snap.val())
        })
        .catch((error) => { reject(error) })
    })
  },
  loadActiveMaps: function(store) {
    var activeLocation = store.getters.getActiveLocation
    var activeLocationKey = activeLocation.locationKey
    var activeMaps = store.getters.getActiveMaps
    var allMaps = store.getters.getAllMaps
    for (var map in allMaps) {
      if (allMaps[map].location === activeLocationKey) {
        activeMaps[map] = Object.assign({}, allMaps[map])
      }
    }
    store.commit('storeActiveMaps', activeMaps)
  },
  updateActiveMaps: function(store, { activeMaps }) {
    var activeLocation = store.getters.getActiveLocation
    var activeLocationKey = activeLocation.locationKey
    var old_activeMaps = store.getters.getActiveMaps
    var new_activeMaps = activeMaps
    // Save New Maps
    for (var new_map in new_activeMaps) {
      db.ref('maps/' + new_map).set(new_activeMaps[new_map])
    }
    // Remove deleted maps
    for (var old_map in old_activeMaps) {
      var deleted = true
      for (var new_map in new_activeMaps) {
        if (old_map === new_map) {
          deleted = false
        }
      }
      if (deleted) {
        db.ref('maps/' + old_map).remove()
      }
    }
  },
  getProjectInfo: function(store) {
    return new Promise((resolve, reject) => {
      db.ref('project').once('value')
        .then((snap) => {
          store.commit('storeProjectInfo', snap.val())
          resolve()
        })
    })
  },
  getLocations: function(store) {
    return new Promise((resolve, reject) => {
      var locationsRef = db.ref('locations')
      locationsRef.once('value')
        .then(function(snap) {
          var locations = snap.val()
          // STORE LOCATIONS
          store.commit('storeLocations', snap.val())
          // SET DEFAULT
          if (!store.state.active.location) {
            db.ref('defaultLocation').once('value').then((defaultLocationKey) => {
              for (var locationKey in locations) {
                if (locations.hasOwnProperty(locationKey) && locationKey === defaultLocationKey.val()) {
                  store.commit('storeActiveLocation', { location: locations[locationKey], locationKey: locationKey })
                  resolve(snap.val())
                }
              }
            })
          } else {
            resolve(snap.val())
          }
        })
        .catch((error) => { reject(error) })
    })
  },
  setActiveLocation: function(store, { location, locationKey }) {
    store.commit('storeActiveLocation', { location: location, locationKey: locationKey })
  },
  setActiveLocationFromUrl: function(store, { locationKey }) {
    return new Promise((resolve, reject) => {
      var locations = store.getters.getLocations
      for (const key in locations) {
        if (key === locationKey) {
          store.commit('storeActiveLocationFromUrl', { locationKey: locationKey })
          resolve()
        }
      }
    })
  },
  updateLocations: function(store, locations) {
    return new Promise((resolve, reject) => {
      db.ref('locations').set(locations)
      resolve()
    })
  },
  updateLocation: function(store, { location, locationKey }) {
    return new Promise((resolve, reject) => {
      db.ref('locations/' + locationKey).set(location)
        .then((value) => {
          resolve(value)
        })
    })
  },
  // addLocation: function(store, newLocation) {
  //  return new Promise((resolve, reject) => {
  //    db.ref('locations').push(newLocation)
  //      .then((value) => {
  //        resolve(value)
  //      })
  //  })
  // },
  // Not Required
  addMap: (store, { map }) => {
    return new Promise((resolve, reject) => {
      db.ref('maps').push(map)
        .then((value) => {
          resolve(value)
        })
    })
  },
  // Not Required
  removeMap: function(store, { mapKey }) {
    var allMaps = store.getters.getAllMaps
    for (var map in allMaps) {
      if (map === mapKey) {
        delete allMaps[mapKey]
      }
    }
  },
  updateMap: function(store, { mapKey, map }) {
    return new Promise((resolve, reject) => {
      db.ref('maps/' + mapKey).set(map)
        .then((value) => {
          resolve(value)
        })
    })
  },
  // Required?
  updateMaps: (store, { allMaps }) => {
    db.ref('maps').set(allMaps)
  },
  addLayer: (store, { mapKey, layer }) => {
    return new Promise((resolve, reject) => {
      db.ref('maps/' + mapKey + '/layers').push(layer)
        .then((value) => {
          resolve(value)
        })
    })
  },
  updateLayer: (store, { mapKey, layer, layerKey }) => {
    return new Promise((resolve, reject) => {
      db.ref('maps/' + mapKey + '/layers/' + layerKey).set(layer)
        .then((value) => {
          resolve(value)
        })
    })
  },
  // Required ?
  getCategories: function(store, { locationKey }) {
    return new Promise((resolve, reject) => {
      var locationsRef = db.ref('locations').child(locationKey).child('categories')
      locationsRef.orderByChild('order').once('value')
        .then(function(snap) {
          resolve(snap.val())
        })
        .catch((error) => { reject(error) })
    })
  },
  // Not Required
  addCategory: function(store, { locationKey, category }) {
    return new Promise((resolve, reject) => {
      db.ref('locations/' + locationKey + '/categories').push(category)
        .then((value) => {
          resolve(value)
        })
    })
  },
  loadActiveCategories: function(store) {
    var activeLocation = store.getters.getActiveLocation
    var activeLocationKey = activeLocation.locationKey
    if (activeLocationKey) {
      return new Promise((resolve, reject) => {
        var locationsRef = db.ref('locations').child(activeLocationKey).child('categories')
        locationsRef.orderByChild('order').once('value')
          .then(function(snap) {
            store.commit('storeActiveCategories', snap.val())
            resolve(snap.val())
          })
          .catch((error) => { reject(error) })
      })
    }
  },
  updateCategories: function(store, { locationKey, categories }) {
    return new Promise((resolve, reject) => {
      db.ref('locations/' + locationKey + '/categories/').set(categories)
        .then((result) => {
          resolve(result)
        })
    })
  },
  checkCategoryMaps: function(store, { locationKey, categoryKey }) {
    return new Promise((resolve, reject) => {
      var mapsRef = db.ref('maps/')
      mapsRef.once('value')
        .then(function(snap) {
          var maps = snap.val()
          for (var mapKey in maps) {
            if (maps.hasOwnProperty(mapKey) && maps[mapKey].location === locationKey && maps[mapKey].category === categoryKey) {
              resolve(true)
              break
            }
          }
          resolve(false)
        })
        .catch((error) => { reject(error) })
    })
  },
  getSubcategories: function(store, { categoryKey, locationKey }) {
    return new Promise((resolve, reject) => {
      var categoryRef = db.ref('locations/' + locationKey + '/categories/')
      categoryRef.once('value')
        .then(function(snap) {
          var categories = snap.val()
          if (categories[categoryKey].subcategories) {
            var subcategories = categories[categoryKey].subcategories
            resolve(subcategories)
          } else {
            resolve(null)
          }
        })
        .catch((error) => { reject(error) })
    })
  },
  // Not Required
  addSubcategory: function(store, { locationKey, categoryKey, subcategory }) {
    return new Promise((resolve, reject) => {
      db.ref('locations/' + locationKey + '/categories/' + categoryKey + '/subcategories').push(subcategory)
        .then((value) => {
          resolve(value)
        })
    })
  },
  checkSubcategoryMaps: function(store, { locationKey, categoryKey, subcategoryKey }) {
    return new Promise((resolve, reject) => {
      var mapsRef = db.ref('maps/')
      mapsRef.once('value')
        .then(function(snap) {
          var maps = snap.val()
          for (var mapKey in maps) {
            if (maps.hasOwnProperty(mapKey) && maps[mapKey].location === locationKey && maps[mapKey].category === categoryKey && maps[mapKey].subcategory === subcategoryKey) {
              resolve(true)
              break
            }
          }
          resolve(false)
        })
        .catch((error) => { reject(error) })
    })
  },
  updateSubcategories: function(store, { locationKey, categoryKey, subcategories }) {
    return new Promise((resolve, reject) => {
      db.ref('locations/' + locationKey + '/categories/' + categoryKey + '/subcategories').set(subcategories)
        .then((result) => {
          resolve(result)
        })
    })
  },
  saveMapContent: function(store, { mapKey, content }) {
    return new Promise((resolve, reject) => {
      db.ref('maps/' + mapKey + '/content').set(content)
        .then((result) => {
          resolve(result)
        })
    })
  },
  uploadContentImage: (store, { file, fileName, mapKey }) => {
    return new Promise((resolve, reject) => {
      // Create the file metadata
      var metadata = { contentType: 'image/jpeg' }

      // Upload file and metadata to the object 'images/mountains.jpg'
      var uploadTask = imageStoreRef.child('images/' + mapKey + '/' + fileName).put(file, metadata)

      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function(snapshot) {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log('Upload is ' + progress + '% done')
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused')
              break
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running')
              break
          }
        },
        function(error) {
          reject(error.code)
        },
        function() {
          // Upload completed successfully, now we can get the download URL
          var downloadURL = uploadTask.snapshot.downloadURL
          resolve(downloadURL)
        })
    })
  },
  saveLocationInfo: (store, { locationKey, info }) => {
    return new Promise((resolve, reject) => {
      db.ref('locations/' + locationKey + '/info').set(info)
        .then((result) => {
          resolve(result)
        })
    })
  },
  saveCategoryInfo: (store, { locationKey, categoryKey, info }) => {
    return new Promise((resolve, reject) => {
      db.ref('locations/' + locationKey + '/categories/' + categoryKey + '/info').set(info)
        .then((result) => {
          resolve(result)
        })
    })
  },
  saveSubcategoryInfo: (store, { locationKey, subcategoryKey, categoryKey, info }) => {
    return new Promise((resolve, reject) => {
      db.ref('locations/' + locationKey + '/categories/' + categoryKey + '/subcategories/' + subcategoryKey + '/info').set(info)
        .then((result) => {
          resolve(result)
        })
    })
  },
  saveProjectInfo: (store, { value }) => {
    return new Promise((resolve, reject) => {
      db.ref('project/').set(value)
        .then((result) => {
          resolve(result)
        })
    })
  },
  // Firebase Auth
  signUpWithEmailAndPassword: function(store, { formData }) {
    return new Promise((resolve, reject) => {
      firebase.auth()
        .createUserWithEmailAndPassword(formData.email, formData.pass)
        .then(function(userRecord) {
          // See the UserRecord reference doc for the contents of userRecord.
          resolve(userRecord)
        })
        .catch(function(error) {
          reject(error)
        })
    })
  },
  signInWithEmail: function(store, { formData }) {
    console.log('signInWithEmail')
    return new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(formData.email, formData.pass)
        .then(() => {
          resolve()
        })
        .catch(function(error) {
          reject(error)
        })
    })

  },
  sendEmailVerification: function(store) {
    return new Promise((resolve, reject) => {
      firebase.auth().currentUser.sendEmailVerification()
        .then(function() {
          resolve()
        }).catch(function(error) {
          reject(error)
        })
    })
  },
  sendPasswordReset: function(store, email) {
    return new Promise((resolve, reject) => {
      firebase.auth().sendPasswordResetEmail(email)
        .then(function() {
          resolve()
        }).catch(function(error) {
          reject(error)
        })
    })
  },
  setupProjectTemplate: function(store) {
    // Setup new project
    store.dispatch('createProject')
  },
  signOut: function(contex, payload) {
    return new Promise((resolve, reject) => {
      firebase.auth().signOut()
        .then(() => {
          resolve()
        })
        .catch(function(error) {
          reject(error)
        })
    })
  },
  setEditModeState: function(store, payload) {
    store.commit('setEditModeState', payload)
  },
  getAllUsers: function(store, payload) {
    return new Promise((resolve, reject) => {
      var usersRef = db.ref('users')
      usersRef.once('value')
        .then(function(snap) {
          var allUsers = []
          var usersObj = snap.val()
          for (var userKey in usersObj) {
            allUsers.push(usersObj[userKey])
          }
          store.commit('storeAllUsers', allUsers)
          resolve(allUsers)
        })
        .catch((error) => { reject(error) })
    })
  },
  removeUser: function(store, { uid }) {
    return new Promise((resolve, reject) => {
      db.ref('users/' + uid).remove()
        .then(() => {
          store.commit('removeUser', { uid })
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })

  },
  updateUserRole: function(store, { user, role }) {
    db.ref('users/' + user.uid + '/role').set(role)
  }
}

const mutations = {
  storeMobileDevice: (state, payload) => {
    state.isMobileDevice = payload
  },
  setEditModeState: (state, payload) => {
    state.editMode = payload
  },
  setActiveUser: (state, payload) => {
    state.user = payload
  },
  storeAllUsers: (state, payload) => {
    state.allUsers = payload.slice()
  },
  // Indicates if map is loaded
  storeMapLoadedState: (state, payload) => {
    state.mapbox.style.loaded = payload
  },
  removeUser: (state, { uid }) => {
    var allUsers = state.allUsers
    allUsers.forEach(function(user, index) {
      if (user.uid === uid) {
        state.allUsers.splice(index, 1)
      }
    })
  },
  storeProjectInfo: (state, payload) => {
    state.project = Object.assign({}, payload)
  },
  storeStyle: (state, payload) => {
    state.style = Object.assign({}, payload)
  },
  storeLocations: (state, payload) => {
    state.locations = Object.assign({}, payload)
  },
  storeActiveLocation: (state, { location, locationKey }) => {
    state.active.location = Object.assign({}, location)
    state.active.locationKey = locationKey
  },
  storeActiveLocationFromUrl: (state, { locationKey }) => {
    var locations = state.locations
    state.active.location = Object.assign({}, locations[locationKey])
    state.active.locationKey = locationKey
  },
  storeMapPosition: (state, payload) => {
    state.active.mapPosition = Object.assign({}, payload)
  },
  storeActiveCategories: (state, payload) => {
    state.active.categories = Object.assign({}, payload)
  },
  storeActiveMaps: (state, payload) => {
    state.active.maps = Object.assign({}, payload)
  },
  storeAllMaps: (state, payload) => {
    state.allMaps = Object.assign({}, payload)
  },
  storeAllTilesets: (state, payload) => {
    payload ? (state.allTilesets = payload.slice()) : (state.allTilesets = null)
  },
  updateScenario: (state, payload) => {
    state.scenario = payload
  },
  updateRightSidebarContent: (state, map) => {
    state.rightSidebar.title = map.name
    state.rightSidebar.subtitle = map.excerpt
    state.currentMap.componentName = map.component
  },
  rightSidebarState: (state, payload) => {
    state.rightSidebar.state = payload // opened / closed
  },
  loadedMap: (state, payload) => {
    state.mapbox[payload].loaded = true // layers added to the map
  },
  addVisibleLayer: (state, layerName) => {
    state.mapbox['visibleLayers'].push(layerName)
  },
  emptyVisibleLayers: state => {
    state.mapbox.visibleLayers = []
  },
  toggleSatellite: state => {
    state.active.satelliteMap = !state.active.satelliteMap
  }
}


const store = () => {
  return new Vuex.Store({
    state,
    getters,
    actions,
    mutations
  })
}

export default store
