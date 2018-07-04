<!--
  - Footer links
  - Contact link
  - Sign in and sign out link
  - Manage users link
  - Email verification link, post account creation
-->

<template lang='pug'>
el-row(:gutter="20")
  el-col(:span='24')
    //- Footer Links
    el-popover(v-if='project.footer' ref='linksPopover', placement='top-start', title='Links', trigger='hover', content=' ')
      ul: li(v-for='(item, itemKey) in project.footer')
        a(target='_blank' :href='item.link') {{item.name}}
    br
    //- Contact link
    el-button.edit-button.right(v-if='project.footer' v-popover:linksPopover='' size='mini' type='primary' plain) Contact
    
    //- Sign In/Out
    ModalLogin
    el-button.edit-button.right(size='mini' type='primary'  v-on:click="loginModal($event)" plain) 
      span(v-if='activeUser') Sign Out
      span(v-else) Sign In
    
    //- Manage Users 
    div(v-if='activeUser && activeUser.role === "admin" ')
      ModalUsers
      el-button.edit-button.right(size='mini' type='primary' v-on:click="usersModal($event)" plain) Users
    
    //- Verify email link
    div(v-if='activeUser && !activeUser.emailVerified')
      el-button.edit-button.right(type='danger', @click="sendEmailVerification()") Verify Email
</template>

<script>
import ProjectKeyMixin from '~/components/utils/mixins/ProjectKeyMixin'
import ModalLogin from '~/components/modals/modal-login'
import ModalUsers from '~/components/modals/modal-users'

export default {
  name: 'Footer',
  mixins:[ProjectKeyMixin],
  data: function(){
    return{
    }
  },
  components: { ModalLogin, ModalUsers },
  computed: {
    activeUser() { return this.$store.getters.getActiveUser }
  },
  methods: {
    sendEmailVerification: function () {
      this.$store.dispatch('sendEmailVerification')
      .then(()=>{
        this.$message.success('Email Verification Sent')
      })
      .catch((error) => {
        this.$message.error(error.message)
      })
    },
    loginModal: function (e) {
      e.preventDefault()
      this.$bus.$emit('openModal', 'login')
    },
    usersModal: function (e) {
      e.preventDefault()
      this.$bus.$emit('openModal', 'users')
    }
  }
}
</script>

<style lang='sass' scoped>
.edit-button
  margin-left: 0.5em
.right
  float: right
ul
  padding-left: 0em
  font-family: monospace
  li
    list-style: none
    margin: 0.25em 0em
    a
      color: #888
</style>
