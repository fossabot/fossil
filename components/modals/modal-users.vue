<!--
  Manage user account permissions for the project
-->

<template lang='pug'>
el-dialog(title='User Permissions', :visible.sync='dialogVisible' width='800px' append-to-body)
  .break

  el-row
    el-col(:span='12')
      h3.activeUser-email {{activeUser.email}}
      
  el-table(stripe :data='allUsers')
    el-table-column(label='Email' width='300')
      template(slot-scope='scope')
        div(v-if='scope.row.uid !== activeUser.uid')
          .cell {{scope.row.email}}
    
    //- Admin privileges
    el-table-column(label='Admin' width='100')
      template(slot-scope='scope')
        div(v-if='scope.row.uid !== activeUser.uid')
          input(v-if='scope.row.role === "admin"' :name='scope.row.uid' type='radio' v-on:click='updateUserRole($event, {scope, role: "admin"})' checked)
          input(v-else :name='scope.row.uid' type='radio' v-on:click='updateUserRole($event, {scope, role: "admin"})')
    
    //- Editor privileges
    el-table-column(label='Editor' width='100')
      template(slot-scope='scope')
        div(v-if='scope.row.uid !== activeUser.uid')
          input(v-if='scope.row.role === "editor"' :name='scope.row.uid' type='radio' v-on:click='updateUserRole($event, {scope, role: "editor"})' checked)
          input(v-else :name='scope.row.uid' type='radio' v-on:click='updateUserRole($event, {scope, role: "editor"})')
    
    //- Read-only privileges    
    el-table-column(label='Read-Only' width='100')
      template(slot-scope='scope')
        div(v-if='scope.row.uid !== activeUser.uid')
          input(v-if='scope.row.role === "read-only"' :name='scope.row.uid' type='radio' v-on:click='updateUserRole($event, {scope, role: "read-only"})' checked)
          input(v-else :name='scope.row.uid' type='radio' v-on:click='updateUserRole($event, {scope, role: "read-only"})')

    //- Delete user
    el-table-column(label='' width='100')
      template(slot-scope='scope')
        div(v-if='scope.row.uid !== activeUser.uid')
          el-popover(ref='confirmDeletePopover', placement='top', width='160', v-model='confirmDeleteVisible')
            p Are you sure to delete this account?
            div(style='text-align: right; margin: 0')
              el-button(size='mini', type='text', @click='confirmDeleteVisible = false') Cancel
              el-button(type='danger', size='mini', @click='removeUser($event, {uid: scope.row.uid})') Confirm
          el-button(type='danger' plain v-popover:confirmDeletePopover='')
            i.far.fa-trash-alt
  br
  //- Create user
  ModalAddUser
  el-button(type='primary' v-on:click='addUserModal($event)') Add User
  el-button(type='primary' v-on:click='closeUsersModal($event)' plain) Close
</template>

<script>
import ModalAddUser from './modal-add-user'

export default {
  name: 'ModalUsers',
  props:['location','category','subcategory'],
  data: function(){
    return{
      dialogVisible: false,
      confirmDeleteVisible: false,
    }
  },
  components: {
    ModalAddUser
  },
  computed: {
    activeUser() { return this.$store.getters.getActiveUser },
    allUsers() {return this.$store.getters.getAllUsers}
  },
  methods: {
    // Add a new user
    addUserModal: function (e) {
      e.preventDefault()
      this.$bus.$emit('openModal', 'addUserModal')
    },
    // Update user role
    updateUserRole: function (e, {scope, role}) {
      var user = scope.row
      this.$store.dispatch('updateUserRole' , {user,role})
    },
    // Remove user
    removeUser: function(e, {uid}){
      this.$store.dispatch('removeUser' , {uid})
      .then(() => {
        this.$message.success('Removed')
      })
      .catch((error) => {
        this.$message.error(error)
      })
    },
    // Close modal
    closeUsersModal: function (e) {
      e.preventDefault()
      this.dialogVisible = false
    }
  },
  mounted() {
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'users') {
        this.dialogVisible = true
        this.$store.dispatch('getAllUsers')
      }
    })
  }
}

</script>

<style lang='sass' scoped>
.activeUser-email
  margin-top: -0.5em
</style>