<!-- 
  - Sign In and Sign Out flows.
  - Email a password reset link via Firebase Auth
-->

<template lang='pug'>
div
  div(v-if='activeUser')
    //- Sign Out
    el-dialog(title='Sign Out', :visible.sync='dialogVisible', width='300px' append-to-body)
      p.top-sep Do you wish to sign out?
      el-button(type='danger' v-on:click='signOut($event)') Sign Out
      el-button(v-on:click='closeLogin($event)') Cancel
  div(v-else)
    //- Sign In
    el-dialog(title='Log In With Email', :visible.sync='dialogVisible', width='300px' append-to-body)
      el-form.top-sep(:model='signInForm', status-icon='', :rules='formRules', ref='signInForm')
          el-form-item(label='Email', prop='email')
            el-input(v-model='signInForm.email')
          el-form-item(label='Password', prop='pass')
            el-input(type='password', v-model='signInForm.pass', auto-complete='off')
      el-button.top-sep(type='primary' v-on:click='signInWithEmail($event)') Sign In
      el-button.top-sep.edit-button.right(type='primary' v-on:click='sendPasswordReset($event)' plain) Reset Password

</template>

<script>
export default {
  name: 'LoginModal',
  data: function(){
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('Please input the password'))
      } else {
        if (this.signInForm.checkPass !== '') {
          this.$refs.signInForm.validateField('checkPass')
        }
        callback()
      }
    }
    return{
      dialogVisible: false,
      signInForm: {
        email: '',
        checkPass: '',
        pass: ''
      },
      formRules: {
        pass: [{ required: true, validator: validatePass, trigger: 'blur' }],
        email: [
          {required: true, message: 'Please input email address', trigger: 'blur' },
          { type: 'email', message: 'Please input correct email address', trigger: 'blur,change' }
        ]
      }
    }
  },

  computed: {
    activeUser() { return this.$store.getters.getActiveUser }
  },
  methods: {
    // Request to sign in with email and password
    signInWithEmail: function(e) {
      e.preventDefault()
      var formData = this.signInForm
      this.$store.dispatch('signInWithEmail', {formData})
      .then(() => {
        this.dialogVisible = false
      })
      .catch((error) => {
        this.$message.error(error.message)
      })
    },
    // Email a password reset link via Firebase Auth
    sendPasswordReset: function (e) {
      e.preventDefault()
      var email = this.signInForm.email
      this.$store.dispatch('sendPasswordReset', email)
      .then(() => {
        this.$message.success('Password Reset Email Sent!')
        this.dialogVisible = false
      })
      .catch((error) => {
        this.$message.error(error.message)
      })
    },
    // Sign out user
    signOut: function(e) {
      e.preventDefault()
      this.dialogVisible = false
      this.$store.dispatch('signOut')
    },
    // Close modal
    closeLogin: function (e) {
      e.preventDefault()
      this.dialogVisible = false
    }
  },
  mounted() {
    // Open modal
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'login') this.dialogVisible = true
    })
    // Close modal
    this.$bus.$on('closeModal', (payload)=>{
      if(payload === 'login') this.dialogVisible = false
    })
  }
}

</script>