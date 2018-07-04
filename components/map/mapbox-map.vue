<template lang='pug'>
#mapbox
</template>

<script>

import queryParamsMixin from '~/components/utils/mixins/queryParamsMixin'

export default {
  name: 'mapbox',
  props: ['activeLocation'],
  mixins: [queryParamsMixin],
  methods: {
    removeActiveLayers({map}) {
      var visibleLayers = this.visibleLayers
      // Remove all visible layers
      if (visibleLayers) {
        visibleLayers.forEach(function(layer) {
          map.removeLayer(layer)
        })
      }
      // Empty Visible Layer Array
      this.$store.commit('emptyVisibleLayers')
    }
  },
  computed:{
    visibleLayers() { return this.$store.state.mapbox['visibleLayers']},
    mapLoaded() { return this.$store.getters.getMapLoadedState },
    satelliteMapState() { return this.$store.getters.getSatelliteMapState }, 
    style() { return this.$store.getters.getStyle },
    queryParameters() { return this.$store.getters.context.query}
  },
  mounted() {
    const mapboxgl = require('mapbox-gl/dist/mapbox-gl')
    var scale = new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'imperial' })
    var nav = new mapboxgl.NavigationControl()
    
    var activeLocation = this.activeLocation
    var map
    mapboxgl.accessToken = process.env.mapboxAccessToken
    var labelLayerId // Maps will be loaded beneath this layer (Map Symbols)
    var mapPosition = activeLocation.location.mapPosition

    this.$store.dispatch('getStyle')
    .then((url) => {
      map = new mapboxgl.Map({
        container: 'mapbox',
        style: url,
        center: [mapPosition.longitude, mapPosition.latitude],
        zoom: mapPosition.zoom,
        pitch: mapPosition.pitch,
        bearing: mapPosition.bearing
      })

      map.on('load', (e) => {
        this.$store.commit('emptyVisibleLayers')
        this.$store.dispatch('loadActiveCategories')
        this.$store.dispatch('loadActiveMaps')

        // Add all layers
        var layers = map.getStyle().layers
        // Insert new layers after symbols
        for (var i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id
            break
          }
        }

        // Add satellite layer
        map.addLayer(
          {"id": "mapbox-satellite",
          "type": "raster",
          "source": "mapbox://mapbox.satellite",
          "layout": {
              "visibility": "none"
          },
          "paint": {
              "raster-opacity": 1
          }
        },labelLayerId)

        // Add Controls
        map.addControl(nav, 'bottom-right')
        map.addControl(scale)

        // Map is loaded
        this.$store.dispatch('setMapLoadedState', true)
        this.$bus.$emit('mapLoaded', true)
      }) 

      // On Map moveend, update URL query parameters
      map.on('moveend', (e) => {
        var mapPosition = {
          longitude : map.getCenter().lng.toFixed(6),
          latitude : map.getCenter().lat.toFixed(6),
          pitch : map.getPitch().toFixed(2),
          bearing : map.getBearing().toFixed(2),
          zoom : map.getZoom().toFixed(2)
        }
        this.appendQueryParam('mapPosition', mapPosition)
      })
    })

    this.$bus.$on('flyTo', (payload) => {
      map.flyTo({
        center: [payload.longitude, payload.latitude],
        zoom: payload.zoom,
        bearing: payload.bearing,
        pitch: payload.pitch,
      })

      this.$store.dispatch('loadActiveCategories')
      this.$store.dispatch('loadActiveMaps')
      this.removeActiveLayers({map})
      
    })

    this.$bus.$on('toggleSatellite', (payload) => {
      if (payload === true) {
          map.setLayoutProperty('mapbox-satellite', 'visibility', 'visible')
      } else {
          map.setLayoutProperty('mapbox-satellite', 'visibility', 'none')
      }
    })

    this.$bus.$on('updateMap', (payload) => {
      this.removeActiveLayers({map})
      // Add New Layers
      var newLayers = payload.layers
      for (var layer in newLayers) {
        if (newLayers.hasOwnProperty(layer)) {
          var id = newLayers[layer].id
          map.addLayer(newLayers[layer],labelLayerId)
          map.setLayoutProperty(id, 'visibility', 'visible')
          // Add to Visible Layer Array
          this.$store.commit('addVisibleLayer', id)
        }
      }
    })
  }
}
</script>

<style lang='sass' scoped>
#mapbox
  padding: 0
  height: 100vh
</style>
