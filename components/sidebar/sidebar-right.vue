<!--
  Off-canvas right sidebar content
-->

<template lang='pug'>
div
  OffCanvas.sidebar-container#sidebarRight.flexbox-parent(v-model='showSidebar', sidebarId='sidebarRight' :align='"right"' :width='470', :duration='.3', effect='ease-in-out', @sidebarWasClosed='showSidebar=$event')
    el-row.flexbox-item.header(v-if='map')
      el-col(:span='24')
        h3.title {{map.name}}
          //- Close Sidebar       
          //- el-button.right.close-sidebar(type='primary' v-on:click="toggleNav($event)" icon= 'el-icon-close' size='mini' plain)
        .subtitle(v-if='map.subtitle') {{map.subtitle}}
        .subtitle(v-else): br

    el-row.break(style='margin: 0em 1em')
    
    //- Sidebar Content: Map Info
    el-row.flexbox-item.flexbox-item-grow.fill-area(v-if='map')
      el-col.flexbox-item-grow.fill-area-content.scrollbar(:span='24')
        div(v-if='editMode')
          vue-editor#vue-content-editor.vue-editor(placeholder="Provide project description..." useCustomImageHandler :editorToolbar='customToolbar' @imageAdded='handleImageAdded' v-model='content')
          br
          el-button(type='primary' v-on:click='handleSaveContent') Save
        div(v-else)
          .map-content(v-if='map.content' v-html='map.content')
    
    //- Footer
    el-row.flexbox-item.footer
      el-col(:span='24')
</template>

<script>
import OffCanvas from './sidebar-offCanvas'
import GenerateIdMixin from '~/components/utils/mixins/GenerateIdMixin'

import hljs from 'highlight.js'

export default {
  data() {
    return {
      map: null,
      mapKey: null,
      showSidebar: false,
      state: 'closed',
      content: ``,
      customToolbar: [
        [{ 'size': ['small', false, 'large'] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['image', 'code-block']
      ]
    }
  },
  mixins: [GenerateIdMixin],
  methods:{
    // Toggle right sidebar
    toggleNav(e){
      e.preventDefault()
      this.showSidebar = !this.showSidebar
    },
    // Upload added image to Firebase storage
    handleImageAdded: function(file, Editor, cursorLocation, resetUploader) {
      var mapKey = this.mapKey
      var fileName = this.generateId() + '-' + file.name
      this.$store.dispatch('uploadContentImage', {file, fileName, mapKey})
      .then((result) => {
        var url = result
        Editor.insertEmbed(cursorLocation, 'image', url)
        resetUploader()
      })
      .catch((error) => {
        console.log(error)
      })
    },
    handleSaveContent(e) {
      e.preventDefault()
      var content = this.content
      var mapKey = this.mapKey
      this.$store.dispatch('saveMapContent', {mapKey, content})
      .then((result) => {
        // console.log('Saved', result)
      })
    },
    onEditorBlur(editor) {
      // console.log('editor blur!', editor)
    },
    onEditorFocus(editor) {
      // console.log('editor focus!', editor)
    },
    onEditorReady(editor) {
      // console.log('editor ready!', editor)
    }
  },
  components:{
    OffCanvas
  },
  computed: {
    editMode() { return this.$store.getters.getEditModeState }
  },
  mounted(){
    // Toggle right sidebar
    this.$bus.$on('toggleRightSidebar', () =>{
      this.showSidebar = !this.showSidebar
    })
    // Open right sidebar
    this.$bus.$on('openRightSidebar', ({map, mapKey}) => {
      this.map = map
      this.mapKey = mapKey
      if (map.content)
        this.content = map.content
      else
        this.content = `<p>Add Some Map Content</p>`
      
      this.showSidebar = true
    })
  }
}
</script>

<style lang='sass' scoped>
.title
  margin: 0px
.subtitle
  margin-top: 0.8em 
  margin-bottom: 0em !important
  color: #666
</style>
