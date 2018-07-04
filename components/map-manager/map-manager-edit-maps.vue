<!--
  Create, read, update and delete maps in a category/subcategory 
-->

<template lang='pug'>
el-dialog(v-if='modalLocation && modalCategory' title='Edit Maps', :visible.sync='dialogVisible' width='600px' append-to-body)
  .break
  
  el-breadcrumb(seperator="/")
    el-breadcrumb-item {{location.name}}
    el-breadcrumb-item {{category.name}}
    el-breadcrumb-item(v-if='subcategory') {{subcategory.name}}

  el-form
    //- Labels
    el-row(:gutter="20")
      el-col(:span="15"): label Map Name 
      el-col(:span="6"): label Order
      el-col(:span="2")

    //- Map List (If Subcategory)
    el-row.list-row(v-for='(map, mapKey) in activeMaps' v-if='subcategory && categoryKey === map.category && subcategoryKey === map.subcategory' v-bind:key='mapKey' :gutter="20")
        el-col(:span="15"): el-input(type='text' v-model='map.name')
        el-col(:span="6"): el-input-number(size='mini', v-model='map.order')
        el-col(:span="2"): el-button(size='mini', type='danger', @click='removeMap($event, {mapKey})' plain)
          i.far.fa-trash-alt
    
    //- Map List (If  No Subcategory)
    el-row.list-row(v-for='(map, mapKey) in activeMaps' v-if='!subcategory && !map.subcategory && categoryKey === map.category' v-bind:key='mapKey' :gutter="20")
        el-col(:span="15"): el-input(type='text' v-model='map.name')
        el-col(:span="6"): el-input-number(size='mini', v-model='map.order')
        el-col(:span="2"): el-button(size='mini', type='danger', @click='removeMap($event, {mapKey})' plain)
          i.far.fa-trash-alt

    //- New Map
    el-row.top-sep(:gutter="20")
      el-col(:span="15"): el-input(type='text' placeholder='New Map Name'  v-model='newMap.name')
      el-col(:span="6"): el-input-number(size='mini', v-model='newMap.order')
      el-col(:span="2"): el-button(size='mini', type='primary', @click='addMap($event)' plain)
        i.fas.fa-plus

    el-row.top-sep
      el-button(type='primary' v-on:click='updateActiveMapsInDb($event)') Save
      el-button(v-on:click='closeEditMapsModal($event)') Close

</template>

<script>
import ModalKeyMixin from '~/components/utils/mixins/ModalKeyMixin'
import GenerateIdMixin from '~/components/utils/mixins/GenerateIdMixin'

export default {
  name: 'MapManagerRemoveMap',
  props:['modalLocation','modalCategory','modalSubcategory'],
  mixins: [ModalKeyMixin, GenerateIdMixin],
  data: function(){
    return{
      dialogVisible: false,
      newMap: {},
      newMapKey: null,
      activeMaps: null,
      mapName: null,
      layerId: null,
      componentName: null,
    }
  },
  methods: {
    // Add a new map in the category/subcategory
    addMap(e){
      e.preventDefault()
      var newMap = this.newMap
      this.newMap['category'] = this.categoryKey
      this.newMap['subcategory'] = this.subcategoryKey
      this.newMap['location'] = this.locationKey
      
      var newMapKey = this.generateId()
      // Very first map
      if (this.activeMaps === null) { 
        this.activeMaps = { [newMapKey] : newMap } 
        this.activeMaps = Object.assign({}, this.activeMaps)
      }
      else { this.activeMaps[newMapKey] = Object.assign({}, newMap) }
      // Clear the input after updating the subcategories
      this.newMap.name = null
      this.newMap.order = null
    },
    // Remove map from the category/subcategory
    removeMap(e, {mapKey}){
      e.preventDefault()
      delete this.activeMaps[mapKey]
      this.activeMaps = Object.assign({}, this.activeMaps)
    },
    // Save modified maps in the category/subcategory
    updateActiveMapsInDb(e){
      if(e) {
        e.preventDefault()
        this.dialogVisible = false
      }
      var activeMaps = this.activeMaps
      this.$store.dispatch('updateActiveMaps', {activeMaps})
    },
    // Close modal
    closeEditMapsModal(e){
      e.preventDefault()
      this.dialogVisible = false
    }
  },
  mounted() {
    // Open modal
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'editMaps') {
        this.activeMaps = Object.assign({}, this.maps)
        this.dialogVisible = true
      }
    })
  }
}

</script>

<style lang='sass' scoped>
.fas.fa-trash-alt
  margin-left: 2em
</style>
