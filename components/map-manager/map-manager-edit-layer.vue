<!-- 
  JSON text editor to create a new Mapbox map layer **or** edit an existing one in a map.
-->

<template lang='pug'>
el-dialog(v-if='modalMap' :title='layerKey ? "Edit Layer" : "New Layer"', :visible.sync='dialogVisible' width='600px' append-to-body)
  .break
  el-breadcrumb(seperator="/")
    el-breadcrumb-item {{location.name}}
    el-breadcrumb-item {{category.name}}
    el-breadcrumb-item(v-if='subcategory') {{subcategory.name}}
    el-breadcrumb-item {{map.name}}
  
  el-row
    vue-editor.vue-json-editor.vue-editor-minimal.vue-editor-noToolbar(v-model='editorContent' hideToolbar)
  
  el-row.top-sep
    el-button(type='primary' v-on:click="saveLayer($event)") Save Layer
    el-button(v-on:click='closeNewLayerModal($event)') Cancel
</template>

<script>
import ModalKeyMixin from '~/components/utils/mixins/ModalKeyMixin'

export default {
  name: 'MapManagerEditLayer',
  props:['modalLocation','modalCategory','modalSubcategory','modalMap', 'modalLayer'],
  mixins: [ModalKeyMixin],
  data: function(){
    return{
      dialogVisible: false,
      editorContent: ``,
      messageError:'',
      editorOption:{
        modules: {
          syntax: {highlight: text => hljs.highlightAuto(text).value}
        }
      },
      // Dummy layer data
      layer: {
        id : "New Layer Name",
        layout : {
          visibility : 'none'
        },
        filter: ['has','height'],
        paint : { },
        source : 'composite',
        'source-layer' : null,
        type : 'fill-extrusion'
      },
      layerKey: null
    }
  },
  computed: {
    editor() { return this.$refs.jsonEditor.quill },
    tilesets(){ return this.$store.getters.getAllTilesets },
    sourceLayer(){ return this.layerTileset.tileset }
  },
  methods: {
    // Save layer content
    saveLayer(e) {
      var layerString = this.editorContent
      layerString = layerString.replace('<pre>','')
      layerString = layerString.replace('</pre>','')
      var layerKey = this.layerKey
      if (IsJsonString(layerString)) {
        layerString = JSON.parse(layerString)
        // Update existing layerString or Save a new one
        if (layerKey) {
          this.$emit('updateLayerEvent' , {layer: layerString, layerKey})
        }
        else {
          this.$emit('addLayerEvent' , {layer: layerString})
        }

        this.dialogVisible = false
        this.$bus.$emit('openModal', 'editMap')
      }
      else{
        this.$message.error('Invalid JSON')
      }
      function IsJsonString(str) {
        try {
          var o = JSON.parse(str)
          if (o && typeof(o) === 'object')
            return true
        }
        catch (e) { return false }
      }
    },
    closeNewLayerModal(e){
      e.preventDefault()
      this.dialogVisible = false
      this.$bus.$emit('openModal', 'editMap')
    }
  },
  mounted() {
    // Either create new map layer or update exisiting map layer
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'newLayer' || payload === 'editLayer') {
        if (this.modalLayer) {
          // Update Layer
          this.editorContent = '<pre>' + JSON.stringify(this.modalLayer.layer,null, 2) + '</pre>'
          this.layerKey = this.modalLayer.layerKey
        }
        else {
          // New Layer
          this.editorContent = '<pre>' + JSON.stringify(this.layer,null, 2) + '</pre>'
          this.layerKey = null
        }
        this.dialogVisible = true
      }
    })
  }
}

</script>
<style lang='sass' scoped>
.quill-code
  border: none
  height: auto
  > code
    width: 100%
    margin: 0
    padding: 1rem
    border: 1px solid #ccc
    border-top: none
    border-radius: 0
    height: 10rem
    overflow-y: auto
    resize: vertical
</style>
