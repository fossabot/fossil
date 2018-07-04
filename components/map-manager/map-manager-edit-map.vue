<!-- 
  - Update map name & subtitle
  - Manage map layers
  - Manage legend type and key
-->

<template lang='pug'>
el-dialog(v-if='modalMap' title='Edit Map', :visible.sync='dialogVisible' width='600px' append-to-body)
  .break
  MapManagerEditLayer( @addLayerEvent='addLayer' @updateLayerEvent='updateLayer' :modalLocation='modalLocation' :modalCategory='modalCategory' :modalSubcategory='modalSubcategory' :modalMap='modalMap' :modalLayer='modalLayer')
  
  el-breadcrumb(seperator="/")
    el-breadcrumb-item {{location.name}}
    el-breadcrumb-item {{category.name}}
    el-breadcrumb-item(v-if='subcategory') {{subcategory.name}}
    el-breadcrumb-item {{map.name}}

  el-form
    //- Edit Map name & subtitle
    h3 Map
    el-row(:gutter = '20')
      el-col(:span = '12')
        label Map Name
        el-input(type='text' value='none' placeholder='Enter map name...' v-model='map.name')
      el-col(:span = '12')
        label Map Subtitle
        el-input(type='text' value='none' placeholder='Just a few words' v-model='map.subtitle')
        .desc  Visible in right sidebar
    
    //- Edit Layers
    h3 Layers
    el-row(:gutter = '20')
      el-col(:span = '12'): label Layer Name
      el-col(:span = '4')
        label Modify
    el-row.list-row(:gutter = '20' v-if='activeLayers' v-for='(layer, layerKey) in activeLayers' :key='layerKey')
      el-col(:span = '12')
          el-input(type='text' v-model='layer.id' :placeholder='layer.id')
      el-col(:span = '2.5')
            el-button(type = 'primary' v-on:click='editLayer($event, {layer, layerKey})' plain)
              .fas.fa-pencil-alt
      el-col(:span = '2.5')
            el-button(type = 'danger' v-on:click='removeLayer($event, {layerKey})' plain)
              i.far.fa-trash-alt
    br
    el-row
      el-col(:span = '4')
        el-button(type='primary' v-on:click='newLayer($event)' plain) Add Layer

    //- Edit Legend
    el-form-item(v-if='activeLegend')
      h3 Legend
      el-row(:gutter = '20')
        el-col(:span = '12')
          label Legend Name
          el-input(type='text' value='none' placeholder='Enter legend title...' v-model='activeLegend.name')
        el-col(:span = '12')
          .row
            label Legend Data Type
            el-form-item
              el-select(v-model='activeLegend.type' placeholder="Select one")
                el-option(:label ='"None"' :value='"none"') None
                el-option(:label ='"Continuous"' :value='"continuous"') Continuous
                el-option(:label ='"Categorical"' :value='"categorical"') Categorical
              .desc  Depends on the layer data type
    
    //- Continuous Legend
    el-form-item(v-if='activeLegend.type === "continuous"')
      el-col(:span = '24')
        el-row(:gutter = '20' v-if=('activeLegend.stops'))
          el-col(:span = '8')
            label Hex Color
          el-col(:span = '6')
            label Label
          el-col(:span = '6')
            label Stop
          el-col(:span = '2')
        el-row.colorStop(:gutter = '20' v-for = '(stop, index) in activeLegend.stops', :key='index')
          el-col(:span = '8')
            el-row(:gutter = '20')
              el-col(:span = '5')
                el-color-picker(v-model = 'stop[0]')
              el-col(:span = '19')
                el-input( type = 'text' v-model ='stop[0]' placeholder = 'Hex Code' )
          el-col(:span = '6')
            el-input( type='text' v-model ='stop[1]' placeholder = 'Label' )
          el-col(:span = '6')
            el-input( type='text' v-model ='stop[2]' placeholder = 'Stop Value' )
          el-col(:span = '2')
            el-button(type = 'danger' v-on:click='removeColorStop($event, index)' plain)
              i.far.fa-trash-alt
        br
        el-button(type='primary' v-on:click="addColorStop($event)" plain) Add Stop
        
    //- Categorical Legend
    el-form-item(v-if='activeLegend.type === "categorical"')
      el-col(:span = '24')
        el-row(:gutter = '20' v-if=('activeLegend.stops'))
          el-col(:span = '8')
            label Hex Color
          el-col(:span = '6')
            label Label
        el-row.colorStop(:gutter = '20' v-for='(stop, index) in activeLegend.stops', :key='index')
          el-col(:span = '8')
            el-row(:gutter = '20')
              el-col(:span = '5')
                el-color-picker(v-model = 'stop[0]')
              el-col(:span = '19')
                el-input( type = 'text' v-model ='stop[0]' placeholder = 'Hex Code' )
          el-col(:span = '6')
            el-input( type='text' v-model='stop[1]' placeholder='Label' )
          el-col(:span = '2')
            el-button(type = 'danger' v-on:click='removeColorStop($event, index)' plain)
              i.far.fa-trash-alt
        br
        el-button(type='primary' v-on:click="addColorStop($event)" plain) Add Stop
        
    el-row.top-sep
      el-button(type='primary' v-on:click='updateMapInDb($event)') Save
      el-button(v-on:click='closeEditMapModal($event)') Close
</template>

<script>
import MapManagerEditLayer from './map-manager-edit-layer'
import ModalKeyMixin from '~/components/utils/mixins/ModalKeyMixin'

export default {
  name: 'MapManagerRemoveMap',
  props:['modalLocation','modalCategory','modalSubcategory','modalMap'],
  mixins: [ModalKeyMixin],
  data: function(){
    return{
      dialogVisible: false,
      activeLayers: {},
      legendTemplate: {},
      activeLegend:{},
      modalLayer: null
    }
  },
  components: {
    MapManagerEditLayer
  },
  methods: {
    // Create a new layer
    newLayer(e){
      e.preventDefault()
      this.modalLayer = null
      // this.dialogVisible = false
      process.nextTick(() => {
        this.$bus.$emit('openModal', 'newLayer')
      })
    },
    // Edit existing layer
    editLayer(e, {layer, layerKey}){
      e.preventDefault()
      this.modalLayer = {layer, layerKey}
      // this.dialogVisible = false
      process.nextTick(() => {
        this.$bus.$emit('openModal', 'editLayer')
      })
    },
    // Save new layer to Firebase
    addLayer({layer}){
      var mapKey = this.mapKey
      this.$store.dispatch('addLayer', {mapKey,  layer: layer})
      .then((result) => {
        // If this is the very first layer
        if (this.activeLayers === null) { 
          this.activeLayers = { [result.key] : layer } 
        }
        else { 
          this.activeLayers[result.key] = Object.assign({}, layer) 
        }

        this.activeLayers = Object.assign({}, this.activeLayers)
      })

    },
    // Update existing layer in Firebase
    updateLayer({layer, layerKey}){
      var mapKey = this.mapKey
      this.$store.dispatch('updateLayer', {mapKey,  layer, layerKey})
      .then((result) => {
        this.activeLayers[layerKey] = Object.assign({}, layer)
        this.activeLayers = Object.assign({}, this.activeLayers)
      })

    },
    // Remove a layer
    removeLayer(e, {layerKey}){
      e.preventDefault()
      delete this.activeLayers[layerKey]
      this.activeLayers = Object.assign({}, this.activeLayers)
    },
    // Add a color stop to the legend
    addColorStop(e){
      e.preventDefault()
      if (this.activeLegend.stops) {
        this.activeLegend.stops.push(['',''])
      } else {
        this.activeLegend.stops = [['','']]
      }
      this.activeLegend = Object.assign({}, this.activeLegend)
    },
    // Remove a color stop from the legend
    removeColorStop(e, index){
      this.activeLegend.stops.splice(index, 1)
      this.activeLegend = Object.assign({}, this.activeLegend)
    },
    // Save all changes to the map
    updateMapInDb(e){
      if(e) {
        e.preventDefault()
        this.dialogVisible = false
      }
      var map = this.map
      map['layers'] = this.activeLayers
      map['legend'] = this.activeLegend
      if (this.legend && this.legend.type === 'none') {
        this.legend.stops = null
      }
      var mapKey = this.mapKey
      this.$store.dispatch('updateMap', {map, mapKey})
    },
    // Close Modal
    closeEditMapModal(e){
      e.preventDefault()
      this.dialogVisible = false
    }
  },
  mounted() {
    // Open Modal
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'editMap') {
        if (this.map && this.map.layers) {
          this.activeLayers = this.map.layers
        }
        else {
          this.activeLayers = null
        }

        if(this.legend) {
          this.activeLegend = this.legend
        } 
        else {
          var mapName = this.map.name
          this.legendTemplate = {
            name: mapName,
            type: 'none',
          }
          this.activeLegend = Object.assign({},this.legendTemplate)
        }
        this.dialogVisible = true
      }
    })
  }
}
</script>