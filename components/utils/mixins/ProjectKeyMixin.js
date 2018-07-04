export default {
  computed: {
    project() { return this.$store.getters.getProject }
  },
  methods: {
    // Save project info
    saveProjectInfo() {
      var project = this.project
      if (this.footerItems) {
        this.project.footer = Object.assign({}, this.footerItems)
      }
      this.$store.dispatch('saveProjectInfo', { value: project })
        .then((result) => {
          this.dialogVisible = false
        })
    }
  }
}
