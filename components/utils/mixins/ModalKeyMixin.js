export default {
  computed: {
    location() {
      if (this.modalLocation !== null) return this.modalLocation.location
      else return null
    },
    locationKey() {
      return this.modalLocation.locationKey
    },
    category() {
      if (this.modalCategory !== null) return this.modalCategory.category
      else return null
    },
    categoryKey() {
      if (this.modalCategory !== null) return this.modalCategory.categoryKey
      else return null
    },
    subcategory() {
      if (this.modalSubcategory !== null) return this.modalSubcategory.subcategory
      else return null
    },
    subcategoryKey() {
      if (this.modalSubcategory !== null) return this.modalSubcategory.subcategoryKey
      else return null
    },
    map() {
      if (this.modalMap !== null ) return this.modalMap.map
      else return null
    },
    mapKey() {
      if (this.modalMap !== null ) return this.modalMap.mapKey
      else return null
    },
    legend() {
      if (this.modalMap !== null ) return this.modalMap.map.legend
      else return null
    },
    maps() { return this.$store.getters.getActiveMaps }
  },
  methods: {
    createMapKey({ location, category, subcategory, mapName }) {
      var locationNameUpper = null
      var categoryNameUpper = null
      var subcategoryNameUpper = null
      var mapNameUpper = null
      var mapKey = null
      // MapName
      if (mapName) { mapNameUpper = changeCase(mapName) }
      // LocationName
      if (location && location.name) { locationNameUpper = changeCase(location.name) }
      // CategoryName
      if (category && category.name) { categoryNameUpper = changeCase(category.name) }
      // SubcategoryName
      if (subcategory && subcategory.name) {
        subcategoryNameUpper = changeCase(subcategory.name)
        mapKey = locationNameUpper + '-' + categoryNameUpper + '-' + subcategoryNameUpper + '-' + mapNameUpper
      } else {
        mapKey = locationNameUpper + '-' + categoryNameUpper + '-' + mapNameUpper
      }
      return mapKey

      function changeCase(str) {
        str = str.trim()
        return str.toLowerCase().replace(/(?:(^.)|(\s+.))/g, function(match) {
          return match.charAt(match.length - 1).toUpperCase()
        })
      }
    }
  }
}
