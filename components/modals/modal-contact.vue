<!--
  Display contact email
-->

<template lang='pug'>
.row
  .col.col-12
    button.modalTrigger(data-component='modal', data-target='#contact-Modal', data-width='400px')#Contact
    #contact-Modal.modal-box.hide
      .modal
        span#Contact-close.close
        .modal-header Contact
        .modal-body
          p {{email}}        
</template>

<script>
export default {
  name: 'ContactModal',
  props:['email'],
  methods: {
    // Close Modal
    closeContact: function (e) {
      e.preventDefault()
      $('#Contact-close').click()
    }
  },
  mounted() {
    // Open Modal
    this.$bus.$on('openModal', (payload)=>{
      if(payload === 'contact') $('#Contact').click()
    })
    // Close Modal
    this.$bus.$on('closeModal', (payload)=>{
      if(payload === 'contact') $('#Contact-close').click()
    })
  }
}
</script>