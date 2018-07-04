# STORE

This directory contains Vuex Store files.
Vuex Store option is implemented in the Nuxt.js framework.
`index.js` file in this directory activates the option in the framework automatically.

More information about the usage of this directory in the documentation:
https://nuxtjs.org/guide/vuex-store


## State
```js
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
```
## Getters
- `getMobileDevice`: Returns a boolean for if client device is mobile device
- `getEditModeState`: Returns a boolen edit mode 
- `getProject`: Returns an object for project info 
- `getStyle`: Returns an object for map style
- `getSatelliteMapState`: Returns a boolean for if the satellite map is toggled
- `getMapLoadedState`: Returns a boolean for Mapbox map loaded state
- `getActiveLocation`: Returns an object for active location
- `getActiveMapPosition`: Returns an object for active map position
- `getActiveCategories`: Returns an object for active location categories
- `getActiveMaps`: Returns an object for active location maps
- `getAllMaps`: Returns an object for all maps in the project
- `getLocations`: Returns an object for all locations
- `getActiveUser`: Returns an object for active user
- `getAllUsers`: Returns an object for all users

## Actions

## Mutations