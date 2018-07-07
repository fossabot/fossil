<template lang='pug'>
#app
  ModalSetupNewProject
  no-ssr
    div(v-if='locationLoadedState')
      ModalShareMap
      el-tooltip.create-short-link(content='Share current view', placement='left')
        el-button(type='primary' icon='el-icon-share' v-on:click="createShortLink($event)" circle)
      #map-full
        MapboxMap(:activeLocation='activeLocation')
        Legend
      SidebarLeft
      SidebarRight
</template>

<script>

import MapboxMap from '~/components/map/mapbox-map'
import SidebarLeft from '~/components/sidebar/sidebar-left'
import SidebarRight from '~/components/sidebar/sidebar-right'
import ModalSetupNewProject from '~/components/modals/modal-setup'
import ModalShareMap from '~/components/modals/modal-share-map'
import Legend from '~/components/sidebar/legend'
import queryParamsMixin from '~/components/utils/mixins/queryParamsMixin'

export default {
  name: 'IndexPage',
  components: {
    SidebarLeft,
    SidebarRight,
    Legend,
    MapboxMap,
    ModalSetupNewProject,
    ModalShareMap
  },
  mixins: [queryParamsMixin],
  watchQuery: ['query'],
  asyncData: function (context) {
    var query = null
    // Get query parameters
    if (context.query){ query = context.query }
    return { query: query }
  },
  data: function() {
    return {
      dialogVisible: false
    }
  },
  computed:{
    activeLocation() { return this.$store.getters.getActiveLocation },
    isMobileDevice() { return this.$store.getters.getMobileDevice },
    allMaps() { return this.$store.getters.getAllMaps },
    locationLoadedState() { return this.activeLocation && this.activeLocation.location ? true : false },
    mapLoadedState() { return this.$store.getters.getMapLoadedState}
  },
  methods:{
    createShortLink(e) {
      e.preventDefault()
      // Open Modal
      this.$bus.$emit('openModal', 'shareMap')
    }
  },
  beforeMount(){
    // Check if the project exists
    this.$store.dispatch('checkProject')
    .then((exists) => {
      if (!exists) {
        // If it doesn't exist, open modal for new project setup
        this.$bus.$emit('openModal', 'setup')
      }
    })
  },
  mounted() {
    /*
    Mobile Device detection
    Yes, really... https://stackoverflow.com/a/3540295
    */
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
        this.$store.dispatch('setMobileDevice', true)
    }
    else {
      this.$store.dispatch('setMobileDevice', false)
    }

    // Intitialize active map with default data
    this.$store.dispatch('getProjectInfo')
    this.$store.dispatch('getLocations')
    .then(() => {
      this.$store.dispatch('getAllMaps')
    })

    this.$bus.$on('mapLoaded', (payload) => {
      // If location is mentioned. Flyto location
      var query = this.query
      if (query && query.locationKey) {
        // Location is required. Map and Map Position can be specified
        var locationKey = JSON.parse(query.locationKey)
        // Change active location
        this.$store.dispatch('setActiveLocationFromUrl', {locationKey: locationKey})
        .then(() => {
          // Fly to location
          var flyToPosition = null
          if(query.mapPosition) {
            var mapPosition =JSON.parse(query.mapPosition)
            flyToPosition = {
              longitude: mapPosition.longitude,
              latitude: mapPosition.latitude,
              zoom: mapPosition.zoom,
              bearing: mapPosition.bearing,
              pitch: mapPosition.pitch,
            }
          }
          else
            flyToPosition = this.$store.getters.getActiveMapPosition

          this.$bus.$emit('flyTo', flyToPosition)

          // Show map
          if (query.mapKey) {
            var mapKey = JSON.parse(query.mapKey)
            var allMaps = this.allMaps
            // Get map for corresponding mapKey
            for (var key in allMaps) {
              if (allMaps.hasOwnProperty(key) && key === mapKey ) {
                var map = allMaps[key]
                this.$bus.$emit('updateLegend', map)
                this.$bus.$emit('updateMap', map)
              }
            }
          }
        })
      }
      // Else add current location to URL params
      else { this.appendQueryParam('locationKey', this.activeLocation.locationKey) }
    })
  }
}
</script>

<style lang='sass'>

html
  font-family: 'IBMPlexSans'
body
  margin: 0

  p
    line-height: 1.5em
#app
  width: 100%
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  background: #ddd
#map-full
  width: 100%
  height: 100vh

.editIcon
  margin-left: 0.5em
  opacity: 0.35
.editIcon:hover
  opacity: 1

.edit-button
  padding: 2px 10px !important
  font-size: 12px !important
  border-radius: 3px !important


.right
  float: right

.el-dropdown-menu .el-dropdown-menu__item
  line-height: 3em
  padding: 0 2em
  font-size: 13px

.el-breadcrumb
  margin-bottom: 2em

.create-short-link
  position: absolute
  bottom: 2em
  right: 4em
  z-index: 10

.list-row
  margin: 0em 0em 1em 0em

.el-dialog
  h3
    color: #333
    margin-bottom: 0.5em
    margin-top: 2em

  .el-tag
    margin-bottom: 2em

.top-sep
  margin-top: 3em

a
  color: #333333

// Flexbox Reference: https://jsfiddle.net/LmYay/3726/
.flexbox-parent.sidebar-container
  width: 100%
  height: 100%
  display: flex
  flex-direction: column
  justify-content: flex-start /* align items in Main Axis */
  align-items: stretch /* align items in Cross Axis */
  align-content: stretch
  overflow-y: hidden !important
  z-index: 20

.flexbox-item
  padding: 1em

.flexbox-item-grow
  flex: 1; /* same as flex: 1 1 auto; */

.fill-area
  display: flex
  flex-direction: row
  justify-content: flex-start /* align items in Main Axis */
  align-items: stretch /* align items in Cross Axis */
  align-content: stretch /* Extra space in Cross Axis */

.fill-area-content
  overflow: auto /* Needed for when the area gets squished too far and there is content that can't be displayed */

.flexbox-item.footer
  padding: 0em 1em 2em 1em


.close-sidebar
  padding: 5px !important

.sidebar
  background: #eee
  width: 450px
  overflow-y: scroll

  .map-content
    img
      width: 100%

.break
  height: 7px
  background: #000
  margin: 1em 0em 1em 0em

.el-dialog__body
  padding: 0px 20px 30px 20px !important

.scrollbar::-webkit-scrollbar-track
  -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.25)
  background-color: #F5F5F5

.scrollbar::-webkit-scrollbar
  width: 6px
  background-color: #F5F5F5

.scrollbar::-webkit-scrollbar-thumb
  background-color: #ccc
  border-radius: 3px

.quillWrapper
  min-width: 300px

.vue-editor-minimal
  .ql-editor
    font-family: 'IBMPlexSans'
    min-height: 0px
    padding: 0 0 1em 0
  .ql-container.ql-snow
    border: none

.vue-editor-noToolbar
  .ql-toolbar.ql-snow
    display: none

.vue-editor
  .ql-toolbar.ql-snow .ql-picker-label
    margin-top: 0.5em
  .ql-snow.ql-toolbar
    padding-top: 0 !important
    padding-bottom: 0 !important

</style>
