// Updates URL query parameters with the provided key-value.

export default {
  methods: {
    appendQueryParam(key, value) {
      if ('URLSearchParams' in window) {
        var searchParams = new URLSearchParams(window.location.search)
        searchParams.set(key, JSON.stringify(value))
        var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString()
        history.pushState(null, '', newRelativePathQuery)
      }
    }
  }
}
