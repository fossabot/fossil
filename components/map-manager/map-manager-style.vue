<!-- 
  Upload or download the map style as `style.json` file
-->

<template lang='pug'>
div
  div(v-if='activeUser')
    el-dialog(title='Manage Style', :visible.sync='dialogVisible', width='600px' append-to-body)
      p.top-sep Upload JSON map style of size less than 10MB
      
      //- Upload section
      el-row
        el-upload.upload-demo(drag='', action='',:http-request='uploadStyle'  :on-preview='handlePreview', :on-remove='handleRemove', :file-list='fileList', multiple=false)
          i.el-icon-upload
          .el-upload__text
            | Drop file here or 
            em click to upload
          .el-upload__tip(slot='tip') JSON style less than 10MB
      
      //- Download section
      el-row.top-sep
        p Download active saved map style. 
        a(:href='downloadURL' download='style.json' target='_blank')
          el-button(type='primary' plain) Download
        p: em Right click Download to 'Save Link As'
      el-row.top-sep(v-if='style')
        el-input(type='textarea', :autosize='{ minRows: 2, maxRows: 4}', placeholder='No style data available', v-model='style')
</template>

<script>
export default {
  name: 'MapManagerStyle',
  data: function(){
    return{
      fileList: [],
      dialogVisible: false,
      style: null,
      downloadURL: null,
    }
  },
  computed: {
    activeUser() { return this.$store.getters.getActiveUser }
  },
  methods: {
    // Upload JSON file to Firebase Storage
    uploadStyle(e){
      var store = this.$store
      store.dispatch('uploadStyle', {style: e.file})
      .then(() => {
        this.$notify({ title: 'Saved', message: 'The style JSON was uploaded.', type: 'success'})
        this.getDownloadURL()
      })
      .catch((error) => {
        this.$notify.error({ title: 'Error',message: error })
      })
    },
    // Download current style as JSON file from Firebase Storage
    getDownloadURL(){
      this.$store.dispatch('downloadStyle')
        .then((url) => {
          this.downloadURL = url
        })
        .catch((error) => {
          this.$notify.error({ title: 'Error',message: error })
        })
    },
    handleRemove(file, fileList) {
      // console.log(file, fileList)
    },
    handlePreview(file) {
      // console.log(file)
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${ file.name }？`);
    }
  },
  mounted() {
    // Open modal
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'manageStyle') {
        this.dialogVisible = true
        this.getDownloadURL()
      }
    })
    // Close modal
    this.$bus.$on('closeModal', (payload)=>{
      if(payload === 'manageStyle') this.dialogVisible = false
    })
  }
}
</script>