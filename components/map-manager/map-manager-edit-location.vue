<!--
  - Manage default longitude and latitude for the location
  - Manage default camera position for the location
  - Set a default map for the location (Optional)
-->

<template lang='pug'>
el-dialog(v-if='modalLocation && location' title='Edit Location', :visible.sync='dialogVisible' width='600px' append-to-body)
  .break

  el-form(v-if='location' :label-position='"top"')
    el-row(:gutter="20")
      el-col(:span="12")
        el-form-item(label="Name")
          el-input(v-model='location.name', :placeholder='location.name' type='text')
      el-col(:span="4")
          el-form-item(label="Order")
            el-input-number(size='mini', :placeholder='location.order' v-model='location.order')
    //- Set default longitude and latitude
    h3 Default Map Position
    el-row(:gutter="20")
      el-col(:span="8")
        el-form-item(label="Longitude")
          el-input-number(size='mini', :placeholder='location.mapPosition.longitude' v-model='location.mapPosition.longitude')


      el-col(:span="8")
        el-form-item(label="Latitude")
          el-input-number(size='mini', :placeholder='location.mapPosition.latitude' v-model='location.mapPosition.latitude')
    //- Set default camera position
    h3 Camera Position
    el-row(:gutter="20")
      el-col(:span="8")
        el-form-item(label="Pitch")
          el-input-number(size='mini', :placeholder='location.mapPosition.pitch' v-model='location.mapPosition.pitch' )


      el-col(:span="8")
        el-form-item(label="Bearing")
          el-input-number(size='mini', :placeholder='location.mapPosition.bearing' v-model='location.mapPosition.bearing')


      el-col(:span="8")
        el-form-item(label="Zoom")
          el-input-number(size='mini', :placeholder='location.mapPosition.zoom' v-model='location.mapPosition.zoom')
    
    //- Set default map (Optional)
    h3 Default Map
    el-form-item(v-if='Object.keys(maps).length > 0' label="Map Name")
      el-select(v-if='location.defaultMap' placeholder="Please select a default map" v-model='location.defaultMap.name' )
        el-option(v-for='(map, mapKey) in maps' :key='mapKey' :label='map.name' :value='mapKey' ) {{map.name}}
    el-form-item(v-else)
      label.italic No Maps Present.

    .top-sep
      el-button(type="primary" v-on:click='updateLocationInDb($event, {location, locationKey})') Save
      el-button(v-on:click='closeLocationsModal($event)') Close
</template>

<script>
import ModalKeyMixin from '~/components/utils/mixins/ModalKeyMixin'

export default {
  name: 'MapManagerEditLocation',
  props:['state', 'modalLocation'],
  mixins: [ModalKeyMixin],
  data: function(){
    return{
      dialogVisible: false,
      defaultMap: null,
    }
  },
  methods: {
    // Update location in Firebase
    updateLocationInDb(e, {location, locationKey}){
      if(e) {
        e.preventDefault()
        this.dialogVisible = false
      }
      this.$store.dispatch('updateLocation', {location, locationKey})
    },
    // Close modal
    closeLocationsModal(e) {
      e.preventDefault()
      this.dialogVisible = false
    }
  },
  mounted() {
    // Open Modal
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'editLocation')
        {
          if(!this.location.defaultMap)
            this.location.defaultMap = {name: ''}
          this.dialogVisible = true
        }
    })
  }
}
</script>