<!--
	Accepts a short link and fetches the associated long link.
	Then redirect the page to the long link
-->
<script>
export default {
   async fetch ({ params, store, redirect}) {
    await store.dispatch('getLongLink', params.id)
      .then((link) => {
        console.log('REDIRECT', link.val())
        redirect(301, link.val())
      })
      .catch((error) => {
        console.error('ERROR', error)
        redirect(301, '/')
      })
  }
}
</script>