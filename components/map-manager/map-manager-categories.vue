<!-- 
  Create, read, update and delete map categories 
-->

<template lang='pug'>
el-dialog(v-if='modalLocation && modalLocation.location' title='Manage Categories', :visible.sync='dialogVisible' width='600px' append-to-body)
  .break
  el-breadcrumb(seperator="/")
    el-breadcrumb-item {{location.name}}
    el-breadcrumb-item 

  div(v-if=('location'))
    //- Labels    
    el-row(:gutter="20")
      el-col(:span="15")
        label Category 
      el-col(:span="6")
        label Order
      el-col(:span="2")

    //- Category List
    el-row.list-row(v-for='(category, categoryKey) in categories' v-bind:key='categoryKey' :gutter="20")
        el-col(:span="15"): el-input(type='text' v-model='category.name')
        el-col(:span="6"): el-input-number(size='mini', v-model='category.order')
        el-col(:span="2"): el-button(size='mini', type='danger', @click='removeCategory($event, {category, categoryKey})' plain)
          i.far.fa-trash-alt
    
    //- New Category
    el-row.top-sep(:gutter="20")
      el-col(:span="15"): el-input(type='text' placeholder='New Category Name'  v-model='newCategory.name')
      el-col(:span="6"): el-input-number(size='mini', v-model='newCategory.order')
      el-col(:span="2"): el-button(size='mini', type='primary', @click='addCategory($event)' plain)
        i.fas.fa-plus
    
    el-row.top-sep
      el-button(type='primary' v-on:click='updateCategoryInDb($event)') Save
      el-button(v-on:click='closeCategoriesModal($event)') Close
</template>

<script>
import ModalKeyMixin from '~/components/utils/mixins/ModalKeyMixin'
import GenerateIdMixin from '~/components/utils/mixins/GenerateIdMixin'


export default {
  name: 'MapManagerCategories',
  props: ['modalLocation'],
  mixins: [ModalKeyMixin, GenerateIdMixin],

  data: function(){
    return{
      dialogVisible: false,
      categories: {},
      newCategory: {
        name: null,
        order: null
      },
    }
  },
  components: {
  },
  computed: {
  },
  methods: {
    // Updates modified changes in Firebase DB
    updateCategoryInDb(e){
      if(e) {
        e.preventDefault()
        this.dialogVisible = false
      }
      var locationKey = this.locationKey
      var categories = this.categories
      this.categories = Object.assign({}, this.categories)
      this.$store.dispatch('updateCategories', {locationKey , categories: categories})
    },
    // Creates a new category
    addCategory(e) {
      e.preventDefault()
      var newCategory = Object.assign({}, this.newCategory)
      var newCategoryKey = this.generateId()
      var locationKey = this.locationKey

      // Initialize First Category
      if (this.categories === null) { this.categories = { [newCategoryKey] : newCategory } }
      else{ this.categories[newCategoryKey] = Object.assign({}, newCategory) }

      // Clear the input after updating the categories
      this.newCategory.name = null
      this.newCategory.order = null
    },
    // Removes an existing category
    removeCategory(e, {category, categoryKey}) {
      var locationKey = this.locationKey
      var categories = this.categories
      this.$store.dispatch('checkCategoryMaps', {locationKey, categoryKey})
      .then((maps) => {
        if (!maps) {
          delete categories[categoryKey]
          this.categories = Object.assign({}, this.categories)
        }
        else{
          this.$message.error('The category contains maps. It must be empty.')
        }
      })
    },
    // Closes Modal
    closeCategoriesModal(e) {
      e.preventDefault()
      this.dialogVisible = false
    }
  },
  mounted() {
    // Opens Modal
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'manageCategories') {
        process.nextTick(() => {
          if (this.location.categories)
            this.categories = this.location.categories
          else
            this.categories = null
          this.dialogVisible = true
        })
      }
    })
  }
}

</script>