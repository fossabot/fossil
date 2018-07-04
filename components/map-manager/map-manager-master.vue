<template lang='pug'>
el-dialog(title='Master Manager', :visible.sync='dialogVisible' width='600px' append-to-body)
  //- MapManagerEditLocation(:modalLocation='modalLocation')
  //- MapManagerCategories( :modalLocation='modalLocation')
  //- MapManagerEditMaps( :modalLocation='modalLocation' :modalCategory='modalCategory' :modalSubcategory='modalSubcategory')
  //- MapManagerEditMap( :modalLocation='modalLocation' :modalCategory='modalCategory' :modalSubcategory='modalSubcategory' :modalMap='modalMap')
  //- MapManagerSubcategories( :modalLocation='modalLocation' :modalCategory='modalCategory')
  //- MapManagerLocations
  .break
  el-row
    .title {{project.title}}
      el-button.edit-button(v-on:click='projectInfoModal' type='text' size='mini' plain style="margin-left: 1em") Edit
  el-row
    .subtitle {{project.subtitle}}
  el-row.top-sep
    el-button.edit-button(v-on:click='projectInfoModal' type='text' size='mini' plain) Manage Locations
  
  el-row.top-sep
    el-input(placeholder='Filter keyword', v-model='filterText')
  
  el-row.top-sep
    el-tree(class='filter-tree' :data='projectTree', node-key='order', default-expand-all='', :expand-on-click-node='false' :filter-node-method='filterNode' ref="projectTree")
      span.tree-node(slot-scope='{ node, data }')
        span {{data.name}}
        span(v-if='data.type === "location"')
          el-button.edit-button(type='text', size='mini', @click='() => manageCategories()' plain) Manage Categories
          

    //- el-tree(class='filter-tree' :data='dummyTree', node-key='id', default-expand-all='', :expand-on-click-node='false' :filter-node-method='filterNode' ref="dummyTree")
      span.tree-node(slot-scope='{ node, data }')
        span {{ node.label }} 
        span(v-if='data.type === "location"')
          el-button.edit-button(type='text', size='mini', @click='() => append(data)' plain)
            | Manage Categories
          el-button.edit-button(type='text', size='mini', @click='() => remove(node, data)' plain)
            | Delete
        span(v-if='data.type === "category"')
          el-button.edit-button(type='text', size='mini', @click='() => append(data)' plain)
            | Manage Subcategories
          el-button.edit-button(type='text', size='mini', @click='() => append(data)' plain)
            | Manage Maps
          el-button.edit-button(type='text', size='mini', @click='() => remove(node, data)' plain)
            | Delete

</template>

<script>
// import MapManagerAddMap from '../map-manager/map-manager-add-map'
// import MapManagerEditMaps from '../map-manager/map-manager-edit-maps'
// import MapManagerEditMap from '../map-manager/map-manager-edit-map'
// import MapManagerSubcategories from '../map-manager/map-manager-subcategories'
// import MapManagerCategories from '../map-manager/map-manager-categories'
// import MapManagerLocations from '../map-manager/map-manager-locations'
// import MapManagerEditLocation from '../map-manager/map-manager-edit-location'

import ProjectKeyMixin from '~/components/utils/mixins/ProjectKeyMixin'

export default {
  name: 'LayerManager',
  props:['state'],
  mixins:[ProjectKeyMixin],
  watch: {
    filterText(val) {
      this.$refs.projectTree.filter(val);
    }
  },
  data: function(){
    return{
      dialogVisible: false,
      filterText: '',
      projectTree: [],
      defaultProps: {
          children: 'children',
          name: 'name'
      }
    }
  },
  components: {
    // MapManagerAddMap,
    // MapManagerEditMaps,
    // MapManagerEditMap,
    // MapManagerSubcategories,
    // MapManagerCategories,
    // MapManagerLocations,
    // MapManagerEditLocation
  },
  computed: {
    locations() {return this.$store.getters.getLocations},
    allMaps(){ return this.$store.getters.getAllMaps },
  },
  methods: {
    filterNode(value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
    },
    closeManagerMasterModal(e) {
      e.preventDefault()
      this.dialogVisible = false
    },
    projectInfoModal: function (e) {
      e.preventDefault()
      this.$bus.$emit('openModal', 'projectInfo')
    },
    manageCategories($event){
      this.showModal = true
      this.$bus.$emit('openModal', 'manageCategories')
    },
  },
  beforeMount() {
    // Append Locations
    var locations = this.locations
    for (var locationKey in locations) {
      if (locations.hasOwnProperty(locationKey)) {
        var location = {
          key: locationKey,
          name: locations[locationKey].name,
          order: locations[locationKey].order,
          type: 'location',
          children: []
        }
        
        // Append Categories
        if (locations[locationKey].categories) {
          var categories = locations[locationKey].categories
          for (var categoryKey in categories) {
            if (categories.hasOwnProperty(categoryKey)) {
              var category = {
                key: categoryKey,
                name: categories[categoryKey].name,
                order: categories[categoryKey].order,
                type: 'category',
                children: []
              }

              // Append Subcategories
              if (categories[categoryKey].subcategories) {
                var subcategories = categories[categoryKey].subcategories
                for (var subcategoryKey in subcategories) {
                  if (subcategories.hasOwnProperty(subcategoryKey)) {
                    var subcategory = {
                      key: subcategoryKey,
                      name: subcategories[subcategoryKey].name,
                      order: subcategories[subcategoryKey].order,
                      type: 'subcategory',
                      children: []
                    }
                  }
                category.children.push(subcategory)
                }
              }
              location.children.push(category)
            }
          }
        }
        this.projectTree.push(location)
      }
    }

    // Append Maps
    var maps = this.allMaps
    for (var mapKey in maps) {
      if (maps.hasOwnProperty(mapKey)) {
        
        // Find Location in Tree
        this.projectTree.forEach(function(location) {
          if (maps[mapKey].location === location.key) {
            // Find Category
            location.children.forEach(function(category) {
              if (maps[mapKey].category === category.key) {
                // Check if map is for subcategory
                if (maps[mapKey].subcategory) {
                  console.log('subcategory')
                }
                else{
                  var map = {
                    key: mapKey,
                    name: maps[mapKey].name,
                    order: maps[mapKey].order,
                    type: 'map',
                    children: []
                  }
                  category.children.push(map)
                }
              }
            })
          }
        })

      }
    }
    console.log(this.projectTree)
  },
  mounted() {
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'masterManager') {
        process.nextTick(() => {
          this.dialogVisible = true
        })
      }
    })
  }
}

/*
projectTree
name: Location A
order: 1
type: location
children:
  name: Category A
  order: 1
  type: category
  children:
    
    name: map A
    order: 1
    type: map
    
    name: Subcategory A
    order: 1
    type: subcategory
    children:
      name: map A-A
      order: 1
      type: map


*/
</script>
<style lang='sass' scoped>
.title
  font-size: 1.5em
  font-weight: bold
  color: #333
  margin: 0em
.subtitle
  margin: 0.25em 0em
  color: #333

.el-tree-node__content
  button
    opacity: 0.2

.el-tree-node__content:hover
  button
    opacity: 1

.filter-tree
  .edit-button
    margin-left: 1em

.modalTrigger
  display: none
.req
  font-weight: 500
  padding-left: .2em

.breadcrumbs li:after
  content: '>'

.colorStop
  padding-bottom: 1em

.action-buttons
  button
    margin-right: 1em

.delete-button
  padding: 6px 15px
.update-button
  padding: 6px 15px
  font-size: 1.2em

.modal
  .label
    margin-top: 1.5em
    margin-bottom: 1em

.location-label
  margin-top: 0.5em !important
  float: right
</style>
