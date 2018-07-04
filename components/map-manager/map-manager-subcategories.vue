<!--
  Create, read, update and delete subcategories for a map category.
-->

<template lang='pug'>
el-dialog(v-if='modalLocation && modalCategory' title='Manage Subcategories', :visible.sync='dialogVisible' width='600px' append-to-body)
  .break
  
  el-breadcrumb(seperator="/")
    el-breadcrumb-item {{location.name}}
    el-breadcrumb-item {{category.name}}

  //- Labels    
  el-row(:gutter="20")
    el-col(:span="15"): label Subcategory 
    el-col(:span="6"): label Order
    el-col(:span="2")
  
  //- Subcategory List
  el-row.list-row(v-for='(subcategory, subcategoryKey) in subcategories' v-bind:key='subcategoryKey' :gutter="20")
      el-col(:span="15"): el-input(type='text' v-model='subcategory.name')
      el-col(:span="6"): el-input-number(size='mini', v-model='subcategory.order')
      el-col(:span="2"): el-button(size='mini', type='danger', @click='removeSubcategory($event, {subcategory, subcategoryKey})' plain) 
        i.far.fa-trash-alt
  
  //- New Subcategory
  el-row.top-sep(:gutter="20")
    el-col(:span="15"): el-input(type='text' placeholder='New Subcategory Name'  v-model='newSubcategory.name')
    el-col(:span="6"): el-input-number(size='mini', v-model='newSubcategory.order')
    el-col(:span="2"): el-button(size='mini', type='primary', @click='addSubcategory($event)' plain) 
      i.fas.fa-plus
  
  el-row.top-sep
    el-button(type='primary' v-on:click='updateSubcategoryInDb($event)') Save
    el-button(v-on:click='closeSubcategoriesModal($event)') Close
</template>

<script>
import ModalKeyMixin from '~/components/utils/mixins/ModalKeyMixin'
import GenerateIdMixin from '~/components/utils/mixins/GenerateIdMixin'

export default {
  name: 'MapManagerSubcategories',
  props:['modalLocation','modalCategory'],
  mixins: [ModalKeyMixin, GenerateIdMixin],

  data: function(){
    return{
      dialogVisible: false,
      subcategories: {},
      newSubcategory: {
        name: null,
        order: null
      },
    }
  },
  methods: {
    // Save modified subcategories data to Firebase DB
    updateSubcategoryInDb(e){
      if(e) {
        e.preventDefault()
        this.dialogVisible = false
      }
      var categoryKey = this.categoryKey
      var locationKey = this.locationKey
      var subcategories = this.subcategories
      this.subcategories = Object.assign({}, this.subcategories)
      this.$store.dispatch('updateSubcategories', {locationKey, categoryKey, subcategories})
    },
    // Create new subcategory
    addSubcategory(e) {
      e.preventDefault()
      var newSubcategory = Object.assign({}, this.newSubcategory)
      var newSubcategoryKey = this.generateId()
      var categoryKey = this.categoryKey
      var locationKey = this.locationKey
      
      // Initialize First Subcategory
      if (this.subcategories === null) 
        this.subcategories = { [newSubcategoryKey] : newSubcategory } 
      else
        this.subcategories[newSubcategoryKey] = Object.assign({}, newSubcategory)

      // Clear the input after updating the subcategories
      this.newSubcategory.name = null
      this.newSubcategory.order = null
      
    },
    // Remove subcategory
    removeSubcategory(e, {subcategory, subcategoryKey}) {
      var category = this.category
      var categoryKey = this.categoryKey
      var location = this.location
      var locationKey = this.locationKey
      var subcategories = this.subcategories
      this.$store.dispatch('checkSubcategoryMaps', {locationKey, categoryKey, subcategoryKey})
      .then((exist) => {
        if (exist) {
          this.$message.error('The subcategory contains layers. It must be empty.')
        }
        else{
          delete subcategories[subcategoryKey]
          this.subcategories = Object.assign({}, this.subcategories)
        }
      })
    },
    // Close modal
    closeSubcategoriesModal(e) {
      e.preventDefault()
        this.dialogVisible = false
    }
  },
  mounted() {
    // Open modal
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'manageSubcategories') {
        process.nextTick(() => {
          var categoryKey = this.categoryKey
          var locationKey = this.locationKey
          this.subcategories = null
          this.$store.dispatch('getSubcategories', {categoryKey, locationKey})
          .then((payload) => {
            if (payload !== null) this.subcategories = payload
            this.dialogVisible = true
          })
        })
      }
    })
  }
}
</script>