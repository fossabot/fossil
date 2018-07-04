<!--
  Off-canvas left sidebar content
-->

<template lang='pug'>
div
  //- Open Left Sidebar
  el-button.open-left-nav(type='primary' icon='el-icon-tickets' v-on:click="toggleNav($event)" ) Menu
  //- Left Sidebar OffCanvas
  OffCanvas.sidebar-container#sidebarLeft.flexbox-parent(v-model='showSidebar', sidebarId='sidebarLeft' :width='400', :duration='.3', effect='ease-in-out', @sidebarWasClosed='showSidebar=$event', :hideOnEsc='false' , :hideOnClickOutside='false' )
    //- Header
    el-row.flexbox-item.header
      el-col(:span='24')
        el-row
          //- Project Title
          el-col(:span='24')
            ModalProjectInfo
            h2(v-if='project.subtitle').title {{project.title}}
              el-button.edit-button(v-if='editMode' v-on:click='projectInfoModal', size='mini', type = 'primary', style="margin-left: 1em;  vertical-align: middle" round, plain) Project Info
              //- Close Sidebar
              el-button.right.close-sidebar(type='primary' v-on:click="toggleNav($event)" icon= 'el-icon-close' size='mini' plain)
        
        el-row
          //- Project Subtitle
          el-col.subtitle(v-if='project.subtitle' :span='24')
            span {{project.subtitle}}
        
        el-row
          //- Project Info
          div(v-if='editMode')
            vue-editor.vue-editor-minimal.vue-editor-noToolbar(id='projectInfoEditor' placeholder="Provide project description..." hideToolbar @focus='handleEditorFocus' @blur='saveProjectInfo' v-model='project.info')
          div(v-else)
            p(v-html='project.info')

        el-row
          //- Location Dropdown
          el-col(:span='12')
            el-dropdown
              el-button(size='mini')
                span {{activeLocation.location.name}}
                i.el-icon-arrow-down.el-icon--right

              el-dropdown-menu(slot='dropdown')
                div(v-for='(location, locationKey) in locations')
                  a(v-on:click="setLocation($event, {location, locationKey})")
                    el-dropdown-item {{location.name}}
          //- Satellite Toggle
          el-col(:span='12')
            el-button.right(size='mini' v-on:click="toggleSatellite($event)")
              span Satellite Map
    
    el-row.break(style='margin: 0em 1em')
    
    //- Sidebar Content: Map Tree
    el-row.flexbox-item.flexbox-item-grow.fill-area
      el-col.flexbox-item-grow.fill-area-content.scrollbar(:span='24')
        MapsTree(v-if='activeLocation' :activeLocation='activeLocation' :categories='categories')
    
    //- Footer
    el-row.flexbox-item.footer
      el-col(:span='24')
        Footer

</template>

<script>
import OffCanvas from './sidebar-offCanvas'
import MapsTree from './maps-tree'
import Footer from './footer'

import ModalProjectInfo from '~/components/modals/modal-project-info'
import ProjectKeyMixin from '~/components/utils/mixins/ProjectKeyMixin'
import queryParamsMixin from '~/components/utils/mixins/queryParamsMixin'

export default {
  name: 'sidebar-left',
  components: {
    OffCanvas,
    MapsTree,
    Footer,
    ModalProjectInfo,
  },
  mixins:[ProjectKeyMixin, queryParamsMixin],
  data() {
    return{
      title: '',
      subtitle: '',
      satelliteMap: false,
      showSidebar: false
    }
  },
  computed: {
    isMobileDevice() { return this.$store.getters.getMobileDevice },
    activeUser() { return this.$store.getters.getActiveUser },
    editMode() { return this.$store.getters.getEditModeState },
    locations() {return this.$store.getters.getLocations},
    categories() {return this.$store.getters.getActiveCategories },
    activeLocation(){ return this.$store.getters.getActiveLocation },
    satelliteMapState() {return this.$store.getters.getSatelliteMapState },
  },
  beforeMount() {
    //this.$store.dispatch('updateActiveCategories')
  },
  mounted() {
    if(!this.isMobileDevice) {
      this.showSidebar = true
    }
    this.$bus.$on('toggleLeftSidebar', () =>{
      this.showSidebar = !this.showSidebar
    })
  },
  methods:{
    toggleNav(e){
      e.preventDefault()
      this.showSidebar = !this.showSidebar
    },
    handleEditorFocus: function (html) {
      // console.log('Focus', html)
    },
    handleEditorBlur: function (html) {
      // console.log('Blur', html)
    },
    setLocation: function (e, {location, locationKey}) {
      e.preventDefault()
      // Set active map name
      if (!location.info) 
        location.info = null
      this.$store.dispatch('setActiveLocation', {location: location, locationKey: locationKey})
      // Set URL query parameters
      this.appendQueryParam('locationKey', this.activeLocation.locationKey)
      // Get data for active map
      this.$store.dispatch('loadActiveCategories')
      this.$store.dispatch('loadActiveMaps')
      // FLy to new location
      var flyToPosition = this.$store.getters.getActiveMapPosition
      this.$bus.$emit('flyTo', flyToPosition)
    },
    toggleSatellite: function (e) {
      e.preventDefault()
      this.$store.dispatch('toggleSatellite')
      this.$bus.$emit('toggleSatellite', this.$store.getters.getSatelliteMapState)
    },
    loginModal: function (e) {
      e.preventDefault()
      this.$bus.$emit('openModal', 'login')
    },
    usersModal: function (e) {
      e.preventDefault()
      this.$bus.$emit('openModal', 'users')
    },
    contactModal: function (e) {
      e.preventDefault()
      this.$bus.$emit('openModal', 'contact')
    },
    projectInfoModal: function (e) {
      e.preventDefault()
      this.$bus.$emit('openModal', 'projectInfo')
    }
  }
}
</script>

<style lang='sass' scoped>
.open-left-nav
  position: fixed
  top: 1em
  left: 1em

.title
  margin: 0px

.subtitle
  margin-top: 0.8em 
  margin-bottom: 1em !important
  color: #666
  span
    padding: 3px 5px
    border: 1px solid #ccc
    border-radius: 2px  
</style>
