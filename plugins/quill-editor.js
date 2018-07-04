import Vue from 'vue'
import { VueEditor } from 'vue2-editor'

// Extend the original module
var Editor = {
    extends: VueEditor,
    // Emitting editor focus events.
    methods: {
    initializeVue2Editor() {
      this.prepareModules()
      this.setQuillElement()
      this.setEditorElement()
      this.handleDynamicStyles()
      this.checkForInitialContent()
      this.checkForCustomImageHandler()
      // Mark model as touched if editor lost focus
      this.quill.on('selection-change', range => {
        if (!range) {
          this.$emit('blur', this.editor.innerHTML)
        } else {
          this.$emit('focus', this.editor.innerHTML)
        }
      })
    }
  }
}

Vue.component('vue-editor', Editor)