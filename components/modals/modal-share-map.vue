<!--
  - Share a short link for the current map view.
  - Captures active location, map position, camera position and active map
-->

<template lang='pug'>
div
  el-dialog(title='Share Map', :visible.sync='dialogVisible', append-to-body, width='350px' center)
    el-row(v-if='shortLink')
      el-col(:span='20')
        el-input(placeholder='Short link', v-model='shortLink', :disabled='true')
      el-col(:span='4')
        el-tooltip(content="Copy to clipboard" placement="top")
          el-button(v-clipboard:copy='shortLink', v-clipboard:success='onCopy', v-clipboard:error='onError', icon='el-icon-document', type="primary")
</template>

<script>
export default {
  name: 'ShareMapModal',
  data: function() {
    return {
      dialogVisible: false,
      shortLink: null
    }
  },
  computed: {
    url() { return window.location.href }
  },
  methods: {
    onCopy: function (e) {
      // Link = e.text
      this.$notify({
        title: 'Copied',
        message: 'The link was copied to your clipboard.',
        type: 'success'
      })
    },
    onError: function (e) {
      this.$notify.error({
        title: 'Error',
        message: 'Failed to copy the link.',
      })
    }
  },
  mounted() {
    // Open modal and create short link
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'shareMap') {
        this.$store.dispatch('createShortLink', window.location.href)
        .then((link) => {
          this.shortLink = link
        })
        this.dialogVisible = true
      }
    })
    // Close modal
    this.$bus.$on('closeModal', (payload)=>{
      if(payload === 'shareMap') this.dialogVisible = false
    })
  }
}
</script>

<style lang='sass'>
</style>