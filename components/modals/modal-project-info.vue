<!--
  - Update project info: Title and subtitle
  - Manage footer links
-->

<template lang='pug'>
el-dialog(title='Project Info', :visible.sync='dialogVisible', width='600px' append-to-body)
  .break
  el-form
    el-form-item(label='Title')
      el-input( placeholder='project.title' v-model='project.title')
    el-form-item(label='Subtitle')
      el-input( placeholder='project.subtitle' v-model='project.subtitle')
    
    el-form-item(label='Footer Links')
      el-row.top-sep(:gutter="20")
        el-col(:span="8"): label Name
        el-col(:span="6"): label Link
        el-col(:span="6"): label Order
        el-col(:span="2")

    //- Footer List
    el-row.list-row(v-for='(item, itemKey) in footerItems' v-bind:key='itemKey' :gutter="20")
      el-col(:span="8"): el-input(type='text' v-model='item.name')
      el-col(:span="6"): el-input(type='text' v-model='item.link')
      el-col(:span="6"): el-input-number(size='mini', v-model='item.order')
      el-col(:span="2"): el-button(size='mini', type='danger', @click='removeFooterItem($event, {itemKey})' plain)
        i.far.fa-trash-alt
    //- New Footer Item
    el-row.top-sep(:gutter="20")
      el-col(:span="8"): el-input(type='text' placeholder='New Item Name' v-model='newFooterItem.name')
      el-col(:span="6"): el-input(type='text' placeholder='New Item Name' v-model='newFooterItem.link')
      el-col(:span="6"): el-input-number(size='mini', v-model='newFooterItem.order')
      el-col(:span="2"): el-button(size='mini', type='primary', @click='addFooterItem($event)' plain)
          i.fas.fa-plus

    el-row.top-sep
      el-button(type='primary' v-on:click='saveProjectInfo($event)') Save
</template>

<script>
import ProjectKeyMixin from '~/components/utils/mixins/ProjectKeyMixin'
import GenerateIdMixin from '~/components/utils/mixins/GenerateIdMixin'

export default {
  name: 'ProjectInfo',
  mixins:[ProjectKeyMixin, GenerateIdMixin],
  data: function(){
    return{
      dialogVisible: false,
      footerItems: null,
      newFooterItem: {
        name: null,
        link: null, 
        order: null
      }
    }
  },
  methods: {
    // Add a new footer item
    addFooterItem(e) {
      e.preventDefault()
      var newFooterItem = Object.assign({}, this.newFooterItem)
      var newFooterItemKey = this.generateId()
      // Very first footerItem
      if (!this.footerItems) { this.footerItems = { [newFooterItemKey] : newFooterItem } }
      else{ this.footerItems[newFooterItemKey] = Object.assign({}, newFooterItem) }

      // Clear the input after updating the footerItems
      this.newFooterItem.name = null
      this.newFooterItem.link = null
      this.newFooterItem.order = null
    },
    // Remove a footer item
    removeFooterItem(e, {itemKey}) {
      delete this.footerItems[itemKey]
      this.footerItems = Object.assign({}, this.footerItems)
    },
    // Close modal
    closeProjectInfo: function (e) {
      e.preventDefault()
      this.dialogVisible = false
    }
  },
  mounted() {
    // Set project.footer
    if (this.project.footer) {
      this.footerItems = this.project.footer
    }
    // Open modal
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'projectInfo') 
        this.dialogVisible = true
    })
  }
}
</script>