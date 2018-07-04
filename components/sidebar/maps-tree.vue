<!--
  Heirarchical representation of categories, subcategories and maps for a location
-->
<template lang='pug'>
el-row
  el-col(:span='24')
    //- Map Manager Modals
    div(v-if='editMode')
      MapManagerEditLocation(:modalLocation='modalLocation')
      MapManagerCategories( :modalLocation='modalLocation')
      MapManagerEditMaps( :modalLocation='modalLocation' :modalCategory='modalCategory' :modalSubcategory='modalSubcategory')
      MapManagerEditMap( :modalLocation='modalLocation' :modalCategory='modalCategory' :modalSubcategory='modalSubcategory' :modalMap='modalMap')
      MapManagerSubcategories( :modalLocation='modalLocation' :modalCategory='modalCategory')
      MapManagerLocations
      MapManagerStyle
      //- MapManagerMaster
    
    //---
    p.info
      div(v-if='editMode')
        vue-editor.vue-editor-minimal.vue-editor-noToolbar(:id='locationKey + "-editor"'  placeholder="Provide location description..." hideToolbar @blur='saveLocationInfo($event, {info: location.info})' v-model='location.info')
      div(v-else)
        div(v-if='location && location.info' v-html='location.info')
    

    //- el-row(v-if='editMode')
    //-   el-button.edit-button(v-on:click="managerMaster($event)", size='mini', type = 'primary', round, plain) MANAGER MASTER

    el-row(v-if='editMode')
      el-button.edit-button(v-on:click="manageStyle($event)", size='mini', type = 'primary', round, plain) Manage Style
      el-button.edit-button(v-on:click="manageLocations($event)", size='mini', type = 'primary', round, plain) Manage Locations
      el-button.edit-button(v-on:click="manageCategories($event)", size='mini', type = 'primary', round, plain) Manage Categories

    el-row(v-if='editMode')
      el-button.edit-button(v-on:click="editLocation($event)", size='mini', type = 'primary', round, plain) Edit Location

    div(v-for='(category, categoryKey) in this.categories' :id='category.name')
      h3 {{category.name}}
      p.info
        div(v-if='editMode')
          vue-editor.vue-editor-minimal.vue-editor-noToolbar(:id='categoryKey + "-editor"'  placeholder="Provide category description..." hideToolbar @blur='saveCategoryInfo($event, {categoryKey, info: category.info})' v-model='category.info')
        div(v-else)
          div(v-if='category.info' v-html='category.info')

      //- If no sub categories exist
      div(v-if='!category.subcategories')
        div(v-if='editMode')
          el-button.edit-button(v-on:click="manageSubcategories($event, {category, categoryKey})", size='mini', type = 'primary', round, plain) Manage Subcategories
          el-button.edit-button(v-on:click="editMaps($event, {category, categoryKey})", size='mini', type = 'primary', round, plain) Manage Maps

        ul.map-list
          li.map-list-item(v-for='(map, mapKey) in activeMaps' v-if='categoryKey === map.category')
            a(href='#', v-on:click="showMap($event, {map, mapKey})") {{map.name}}
            a(href='#' v-if='editMode || (map.content && map.content !== "<p><br></p>")' v-on:click="openRightSidebar($event, {map, mapKey})"): i.far.fa-question-circle
            a( href='#' v-if=('editMode') v-on:click="editLayers($event, {category, categoryKey, map, mapKey})"): i.fas.fa-ellipsis-v.editIcon


      //- If no sub categories exist
      div(v-if='category.subcategories')
        div(v-if='editMode')
          el-button.edit-button(v-on:click="manageSubcategories($event, {category, categoryKey})", size='mini', type = 'primary', round, plain) Manage Subcategories
          el-button.edit-button(v-on:click="editMaps($event, {category, categoryKey})", size='mini', type = 'primary', round, plain) Manage Maps

        //- Layers without subcategories
        ul.map-list
          li.map-list-item(v-for='(map, mapKey) in activeMaps' v-if='categoryKey === map.category && !map.subcategory')
            a(href='#', v-on:click="showMap($event, {map, mapKey})") {{map.name}}
            a(href='#',  data-clickOutside=false, data-component='offcanvas', data-target='#offcanvas-right', data-direction='right', data-width='470px', v-if='editMode || map.content' v-on:click="openRightSidebar($event, {map, mapKey})"): i.far.fa-question-circle
            a( href='#' v-if=('editMode') v-on:click="editLayers($event, {category, categoryKey, map, mapKey})"): i.fas.fa-ellipsis-v.editIcon

        //- Subcategory Tabs
        el-tabs
          el-tab-pane(v-for='(subcategory, subcategoryKey) in category.subcategories' :key='subcategoryKey' :label='subcategory.name')
            div(v-if='editMode')
              el-button.edit-button(v-on:click="editMaps($event, {category, categoryKey, subcategory, subcategoryKey})", size='mini', type = 'primary', round, plain) Manage Maps

            p.info
              div(v-if='editMode')
                vue-editor.vue-editor-minimal.vue-editor-noToolbar(:id='subcategoryKey + "-editor"'  placeholder="Provide subcategory description..." hideToolbar @blur='saveSubcategoryInfo($event, {categoryKey, subcategoryKey, info: subcategory.info})' v-model='subcategory.info')
              div(v-else)
                div(v-if='subcategory.info' v-html='subcategory.info')

            ul
              li.map-list-item(v-for='(map, mapKey) in activeMaps' v-if='subcategoryKey === map.subcategory')
                a(href='#', v-on:click="showMap($event, {map, mapKey})") {{map.name}}
                a(href='#', data-component='offcanvas', data-target='#offcanvas-right', data-direction='right',  data-clickOutside=false, data-width='470px', v-if='editMode || map.content' v-on:click="openRightSidebar($event, {map, mapKey})"): i.far.fa-question-circle
                a( href='#' v-if=('editMode') v-on:click="editLayers($event, {category, categoryKey, subcategory,  subcategoryKey, map, mapKey})"): i.fas.fa-ellipsis-v.editIcon
</template>

<script>
import MapManagerMaster from '~/components/map-manager/map-manager-master'
import MapManagerStyle from '~/components/map-manager/map-manager-style'
import MapManagerEditMaps from '~/components/map-manager/map-manager-edit-maps'
import MapManagerEditMap from '~/components/map-manager/map-manager-edit-map'
import MapManagerSubcategories from '~/components/map-manager/map-manager-subcategories'
import MapManagerCategories from '~/components/map-manager/map-manager-categories'
import MapManagerLocations from '~/components/map-manager/map-manager-locations'
import MapManagerEditLocation from '~/components/map-manager/map-manager-edit-location'
import queryParamsMixin from '~/components/utils/mixins/queryParamsMixin'

export default {
  name: 'MapLayers',
  data() {
    return{
      showModal: true,
      modalCategory: null,
      modalSubcategory: null,
      modalMap: null,
      content: ``,
      customToolbar: []
    }
  },
  props:['showMapList', 'showMapInfo', 'activeLocation', 'categories'],
  mixins: [queryParamsMixin],
  components: {
    MapManagerMaster,
    MapManagerStyle,
    MapManagerEditMaps,
    MapManagerEditMap,
    MapManagerSubcategories,
    MapManagerCategories,
    MapManagerLocations,
    MapManagerEditLocation
  },
  computed: {
    editMode() { return this.$store.getters.getEditModeState },
    activeMaps(){ return this.$store.getters.getActiveMaps },
    allMaps(){ return this.$store.getters.getAllMaps },
    modalLocation() { return this.activeLocation },
    location() {return this.activeLocation.location},
    locationKey() {return this.activeLocation.locationKey}
  },
  methods: {
    managerMaster: function (e) {
      this.showModal = true
      this.$bus.$emit('openModal', 'masterManager')
    },
    openRightSidebar: function (e, {map, mapKey}) {
      e.preventDefault()
      this.$bus.$emit('openRightSidebar', {map, mapKey})
    },
    showMap: function(e, {map, mapKey}) {
      e.preventDefault()
      this.$bus.$emit('updateLegend', map)
      this.$bus.$emit('updateMap', map)
      this.appendQueryParam('mapKey', mapKey)
    },
    editMaps($event, {category, categoryKey, subcategory, subcategoryKey}){
      this.showModal = true
      // this.modalLocation = this.activeLocation
      this.modalCategory = {category, categoryKey}
      if (subcategory)
        this.modalSubcategory = {subcategory, subcategoryKey}
      else
        this.modalSubcategory = null
      process.nextTick(() =>{
        this.$bus.$emit('openModal', 'editMaps')
      })
    },
    editLayers($event, {category, categoryKey, subcategory, subcategoryKey, map, mapKey}){
      this.showModal = true
      // this.modalLocation = this.activeLocation
      this.modalCategory = {category, categoryKey}
      if (subcategory)
        this.modalSubcategory = {subcategory, subcategoryKey}
      else
        this.modalSubcategory = null
      this.modalMap = {map, mapKey}
      process.nextTick(() =>{
        this.$bus.$emit('openModal', 'editMap')
      })
    },
    manageSubcategories($event, {category, categoryKey}){
      this.showModal = true
      this.modalCategory = {category, categoryKey}
      this.$bus.$emit('openModal', 'manageSubcategories')
    },
    manageCategories($event){
      this.showModal = true
      this.$bus.$emit('openModal', 'manageCategories')
    },
    manageTilesets($event){
      this.showModal = true
      this.$bus.$emit('openModal', 'manageTilesets')
    },
    manageLocations($event){
      this.showModal = true
      this.$bus.$emit('openModal', 'manageLocations')
    },
    manageStyle($event){
      this.showModal = true
      this.$bus.$emit('openModal', 'manageStyle')
    },
    editLocation($event){
      this.showModal = true
      process.nextTick(() =>{ this.$bus.$emit('openModal', 'editLocation') })
    },
    saveLocationInfo($event, {info}){
      if (!info) { info = null }
      else {
        if (info === '<p><br></p>' || info === ' ')
          info = null
      }
      var locationKey = this.activeLocation.locationKey
      this.$store.dispatch('saveLocationInfo', {locationKey, info})
    },
    saveCategoryInfo($event, {categoryKey, info}){
      if (!info) { info = null }
      else {
        if (info === '<p><br></p>' || info === ' ')
          info = null
      }
      var locationKey = this.activeLocation.locationKey
      this.$store.dispatch('saveCategoryInfo', {locationKey, categoryKey, info})
    },
    saveSubcategoryInfo($event, {categoryKey, subcategoryKey, info}){
      if (!info) { info = null }
      else {
        if (info === '<p><br></p>' || info === ' ')
          info = null
      }
      var locationKey = this.activeLocation.locationKey
      this.$store.dispatch('saveSubcategoryInfo', {locationKey, categoryKey, subcategoryKey, info})
    }
  },
}
</script>

<style lang='sass' scoped>
h3
  margin-top: 2em

.map-list-item
  margin: 5px 0

ul
  .fa-question-circle
    margin-left: 10px
    color: #ccc
  .fa-question-circle:hover , .far.fa-edit:hover
    color: #f03c69

</style>
