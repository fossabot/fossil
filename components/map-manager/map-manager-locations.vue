<!--
  Create, read, update and delete locations.
-->

<template lang='pug'>
el-dialog(title='Manage Locations', :visible.sync='dialogVisible' width='600px' append-to-body)
  .break
  el-row.top-sep(:gutter="20")
    el-col(:span="15"): label Name
    el-col(:span="6"): label Order
    el-col(:span="2")

  //- Location List
  el-row.list-row(v-for='(location, locationKey) in locations' v-bind:key='locationKey' :gutter="20")
      el-col(:span="15"): el-input(type='text' v-model='location.name')
      el-col(:span="6"): el-input-number(size='mini', v-model='location.order')
      el-col(:span="2"): el-button(size='mini', type='danger', @click='removeLocation($event, {locationKey})' plain)
        i.far.fa-trash-alt

  //- New Location
  el-row.top-sep(:gutter="20")
    el-col(:span="15"): el-input(type='text' placeholder='New Location Name' v-model='newLocation.name')
    el-col(:span="6"): el-input-number(size='mini', v-model='newLocation.order')
    el-col(:span="2"): el-button(size='mini', type='primary', @click='addLocation($event)' plain)
        i.fas.fa-plus

  el-row.top-sep
    el-button(type='primary' v-on:click='updateLocationsInDb($event)') Save
    el-button(v-on:click='closeLocationsModal($event)') Close
</template>

<script>
import GenerateIdMixin from '~/components/utils/mixins/GenerateIdMixin'

export default {
  name: 'LayerManager',
  props:['state'],
  mixins: [GenerateIdMixin],
  data: function(){
    return{
      dialogVisible: false,
      locations: {},
      // Dummy data
      newLocation: {
        name: null,
        order: null,
        mapPosition: {
          latitude: 10,
          longitude: -10,
          bearing: 0,
          pitch: 0,
          zoom: 5
        }
      },
    }
  },
  methods: {
    // Save modified locations data in Firebase
    updateLocationsInDb(e){
      if(e) {
        e.preventDefault()
        this.dialogVisible = false
      }
      this.$store.dispatch('updateLocations', this.locations)
    },
    // Create a new location
    addLocation(e) {
      e.preventDefault()
      var newLocation = Object.assign({}, this.newLocation)
      var newLocationKey = this.generateId()
      // Very first location
      if (this.locations === null) { this.locations = { [newLocationKey] : newLocation } }
      else{ this.locations[newLocationKey] = Object.assign({}, newLocation) }

      // Clear the input after updating the locations
      this.newLocation.name = null
      this.newLocation.order = null
    },
    // Remove a location
    removeLocation(e, {locationKey}) {
      if (this.locations[locationKey].mapLayers) {
        this.$message.error('The location contains categories. It must be empty.')
      }
      else {
        delete this.locations[locationKey]
        this.locations = Object.assign({}, this.locations)
      }
    },
    // Close modal
    closeLocationsModal(e) {
      e.preventDefault()
      this.dialogVisible = false
    }
  },
  mounted() {
    // Open modal
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'manageLocations') {
        process.nextTick(() => {
          this.$store.dispatch('getLocations')
          .then((payload) => {
            if (payload !== null) this.locations = payload
          })
          this.dialogVisible = true
        })
      }
    })
  }
}
</script>