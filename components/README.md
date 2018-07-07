# COMPONENTS

The components directory contains Vue.js Components.

```sh
📂 [components]
└ 📂 map
  └ 📄 mapbox-map.vue
└ 📂 map-manager
  └ 📄 map-manager-style.vue
  └ 📄 map-manager-locations.vue
  └ 📄 map-manager-edit-location.vue
  └ 📄 map-manager-categories.vue
  └ 📄 map-manager-subcategories.vue
  └ 📄 map-manager-edit-maps.vue
  └ 📄 map-manager-edit-map.vue
  └ 📄 map-manager-edit-layer.vue
  └ 📄 map-manager-master.vue
└ 📂 modals
  └ 📄 modal-setup.vue
  └ 📄 modal-login.vue
  └ 📄 modal-users.vue
  └ 📄 modal-add-user.vue
  └ 📄 modal-project-info.vue
  └ 📄 modal-share-map.vue
  └ 📄 modal-contact.vue
└ 📂 sidebar
  └ 📄 sidebar-offCanvas.vue
  └ 📄 sidebar-left.vue
  └ 📄 sidebar-right.vue
  └ 📄 maps-tree.vue
  └ 📄 legend.vue
  └ 📄 footer.vue
└ 📂 utils
  └ 📂 mixins
    └ 📄 GenerateIdMixin.vue
    └ 📄 ModalKeyMixin.vue
    └ 📄 ProjectKeyMixin.vue
    └ 📄 queryParamsMixin.vue
```

## Map
Contains Mapbox-gl map component.

`mapbox-map.vue`:
- `$store.dispatch('getStyle')` Requests style from Firebase Storage
- Renders the primary full screen map for the visualization.
- `map = new mapboxgl.Map()` Initializes a new Mapbox-Gl Map 
- `map.on(load)` Handles loading and unload of layers 
- `map.on(moveend)` Updates URL query parameters upon map movement 
- Handles Satellite Map toggle

## Map Manager
Components are accessible when the user logs in with authorized credentials. These components allow the logged in user to manage the content of the app.

`map-manager-style.vue`:
Upload or download the map style as `style.json` file

`map-manager-locations.vue`:
Create, read, update and delete locations.

`map-manager-edit-location.vue`: 
- Manage default longitude and latitude for the location
- Manage default camera position for the location
- Set a default map for the location (Optional)

`map-manager-categories.vue`: 
Create, read, update and delete map categories

`map-manager-subcategories.vue`:
Create, read, update and delete subcategories for a map category.

`map-manager-edit-maps.vue`:
Create, read, update and delete maps in a category/subcategory.

`map-manager-edit-map.vue`: 
- Update map name & subtitle
- Manage map layers
- Manage legend type and key

`map-manager-edit-layer.vue`: 
JSON text editor to create a new Mapbox map layer **or** edit an existing one in a map.

`map-manager-master.vue`:
[Work in progress]
- Access all map manager actions from this component.
- Replaces map manager actions in the left sidebar

## Modals
`modal-setup.vue`:
- Setup a new project from start
- Sign up first user with email and password
- Populate dummy content in Firebase DB

`modal-login.vue`:
- Sign In and Sign Out flows.
- Email a password reset link via Firebase Auth

`modal-users.vue`:
Manage user account permissions for the project

`modal-add-user.vue`:
Create a new user account with email and temporary password

`modal-project-info.vue`:
- Update project info: Title and subtitle
- Manage footer links

`modal-share-map.vue`:
- Share a short link for the current map view.
- Captures active location, map position, camera position and active map

`modal-contact.vue`:
Display contact email

## Sidebar
`sidebar-offCanvas.vue`:
Configurable off-canvas sidebar component

`sidebar-left.vue`:
Off-canvas left sidebar content

`sidebar-right.vue`:
Off-canvas right sidebar content

`maps-tree.vue`:
Heirarchical representation of categories, subcategories and maps for a location

`legend.vue`:
Displays legend for the active map.

`footer.vue`:
- Footer links
- Contact link
- Sign in and sign out link
- Manage users link
- Email verification link, post account creation

## Utils

### Mixins

`GenerateIdMixin.vue`:
Fancy ID generator that creates 20-character string identifiers

`ModalKeyMixin.vue`: Common computed properties and methods required by modals.

#### Computed
- `location()` : Active location value
- `locationKey()` : Active location key
- `category()` : Category value
- `categoryKey()` : Category key
- `subcategory()` : Subcategory Value
- `subcategoryKey()` : Subcategory Key
- `map()` : Map value
- `mapKey()` : Map key
- `legend()` : Legend data
- `maps()` : Active location maps

#### Methods
`createMapKey()`: Create a unique key for a new map to be added

`ProjectKeyMixin.vue`: Project info details

#### Computed
`project()`: Returns project info

#### Methods
`saveProjectInfo()`: Saves project info

`queryParamsMixin.vue`: Updates URL query parameters with the provided key-value.