<!--
  Create a new user account with email and temporary password
-->

<template lang='pug'>
div
  el-dialog(title='Add User', :visible.sync='dialogVisible', append-to-body, center)
    el-form
      el-row(:gutter = '20')
        el-col(:span = '12' :offset='6')
          el-form.top-sep(:model='signUpForm', status-icon='', :rules='formRules', ref='signUpForm')

            p Setting temporary credentials. Make sure to reset the password on first login. 
            
            el-form-item(label='Email', prop='email')
              el-input(v-model='signUpForm.email', auto-complete='on')
            el-form-item(label='Temporary Password', prop='pass')
              el-input(type='password', v-model='signUpForm.pass', auto-complete='off')
            
            el-form-item.top-sep
              el-button(type='primary', @click="signUpWithEmailAndPassword('signUpForm')") Add Account
</template>

<link type="text/css" rel="stylesheet" href="node_modules/firebaseui/dist/firebaseui.css" />

<script>
export default {
  name: 'AddUserModal',
  data: function(){
    var validatePass = (rule, value, callback) => {
      if (value === '' || value.length < 6) {
        callback(new Error('Password must be atleast 6 characters long.'))
      } else {
        if (this.signUpForm.checkPass !== '') {
          this.$refs.signUpForm.validateField('checkPass')
        }
        callback()
      }
    }
    return {
      dialogVisible: false,
      signUpForm: {
        email: '',
        pass: '',
        checkPass: ''
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
  methods: {
    // Create an account with email and temporary password
    signUpWithEmailAndPassword: function (signUpForm) {
      this.$refs[signUpForm].validate((valid) => {
          if (valid) {
            var formData = this.signUpForm
            this.$store.dispatch('signUpWithEmailAndPassword', {formData})
            .catch((error) => {
              this.$message.error(error.message)
            })
          } else {
              this.$message.error('Invalid form input.')
          }
        })
    },
    // Send email verification via Firebase Auth
    sendEmailVerification: function () {
      this.$store.dispatch('sendEmailVerification')
      .then(()=>{
        this.$message.success('Email Verification Sent')
      })
      .catch((error) => {
        this.$message.error(error.message)
      })
    }
  },
  mounted() {
    // Open modal
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'addUserModal') this.dialogVisible = true
    })
    // Close modal
    this.$bus.$on('closeModal', (payload)=>{
      if(payload === 'addUserModal') this.dialogVisible = false
    })
  }
}
</script>