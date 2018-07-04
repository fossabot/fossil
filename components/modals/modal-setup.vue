<!--
  - Setup a new project from start
  - Sign up first user with email and password
  - Populate dummy content in Firebase DB
-->

<template lang='pug'>
div
  el-dialog(title='Get Started', :visible.sync='dialogVisible', :close-on-press-escape='false', :close-on-click-modal='false', :show-close='false', append-to-body, center)
    el-form
      //- Step 1: Provide Email & Password for the first account (Created as Admin)
      el-row(v-if='setupStep === 1', :gutter = '20')
        el-col(:span = '12' :offset='6')
          el-form.top-sep(:model='signUpForm', status-icon='', :rules='formRules', ref='signUpForm')

            el-form-item(label='Let\'s register your account first.')
            
            el-form-item(label='Email', prop='email')
              el-input(v-model='signUpForm.email', auto-complete='on')
            el-form-item(label='Password', prop='pass')
              el-input(type='password', v-model='signUpForm.pass', auto-complete='off')
            el-form-item(label='Confirm', prop='checkPass')
              el-input(type='password', v-model='signUpForm.checkPass', auto-complete='off')
            
            
            el-form-item.top-sep
              el-button(type='primary', @click="signUpWithEmailAndPassword('signUpForm')") Get Started
              el-button(@click="resetForm('signUpForm')") Reset
      
      //- Step 2: Verify Email
      el-row(v-if='setupStep === 2', :gutter = '20')
        el-col(:span = '12' :offset='6')
          el-form.top-sep(style='text-align: center')
            p Let's verify your email address. Refresh this page once you've clicked on the verification link in email.
            el-form-item.top-sep
              el-button(type='primary', @click="sendEmailVerification()") Send Email
      
      //- Step 3: Populate dummy content template for the project
      el-row(v-if='setupStep === 3', :gutter = '20')
        el-col(:span = '12' :offset='6')
          el-form.top-sep(style='text-align: center')
            p One last thing. Let's setup your project.
            el-form-item.top-sep
              el-button(type='success', @click="setupProjectTemplate()" plain) Setup Project
      
      //- Progress Bar
      el-row.top-sep(:gutter = '20')
        el-col(:span = '24' )
          el-steps(:active='setupStep', align-center='')
            el-step(title='Step 1', description='Create Account')
            el-step(title='Step 2', description='Verify Email')
            el-step(title='Step 3', description='Setup Project Template')
</template>

<link type="text/css" rel="stylesheet" href="node_modules/firebaseui/dist/firebaseui.css" />

<script>
import ProjectKeyMixin from '~/components/utils/mixins/ProjectKeyMixin'

export default {
  name: 'LoginModal',
  mixins:[ProjectKeyMixin],
  data: function(){
    // Verify password length
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
    // Verify password match
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('Please input the password again'))
      } else if (value !== this.signUpForm.pass) {
        callback(new Error('Two inputs don\'t match!'))
      } else {
        callback()
      }
    }
    return {
      dialogVisible: false,
      signUpForm: {
        pass: '',
        checkPass: '',
        email: '',
        displayName: '',
        lastName: ''
      },
      formRules: {
        pass: [{ required: true, validator: validatePass, trigger: 'blur' }],
        checkPass: [{ required: true, validator: validatePass2, trigger: 'blur' }],
        email: [
          {required: true, message: 'Please input email address', trigger: 'blur' },
          { type: 'email', message: 'Please input correct email address', trigger: 'blur,change' }
        ]
      }
    }
  },
  computed: {
    activeUser() { return this.$store.getters.getActiveUser },
    setupStep() {
      if (!this.activeUser) {
        return 1 // User Registeration
      }
      if (!this.activeUser.email) {
        return 1 // User Registeration
      }
      else if(!this.activeUser.emailVerified) {
        return 2 // Email Verification
      }
      else if(this.activeUser.emailVerified) {
        return 3 // Create Project
      }
    }
  },
  methods: {
    // Sign up the new user in Firebase Auth with Email and Password
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
            return false
          }
        })
    },
    // Send email verification via Firebase
    sendEmailVerification: function () {
      this.$store.dispatch('sendEmailVerification')
      .then(()=>{
        this.$message.success('Email Verification Sent')
      })
      .catch((error) => {
        this.$message.error(error.message)
      })
    },
    // Setup Firebase DB template
    setupProjectTemplate: function () {
      this.$store.dispatch('setupProjectTemplate')
      .catch((error) => {
        this.$message.error(error.message)
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  },
  mounted() {
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'setup') this.dialogVisible = true
    })
    this.$bus.$on('closeModal', (payload)=>{
      if(payload === 'setup') this.dialogVisible = false
    })
  }
}
</script>