<!--
  Displays legend for the active map
-->
<template lang='pug'>
div
  el-button.toggle-legend(v-if='legend && map.legend.type !== "none"' type='default' icon='el-icon-view' v-on:click="toggleLegend($event)")

  transition(:name='legendTransitionName')
    el-row#full-map-legend(v-if='showLegend')
      el-col(:span='24')
        el-button.right.close-legend(type='primary' v-on:click="toggleLegend($event)" icon= 'el-icon-close' size='mini' plain)
        #legend-name(v-if='legend'): label.label {{legend.name}}
        #legend-data
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'Legend',
  data() {
    return {
      map: null,
      legend: null,
      showLegend: false
    }
  },
  computed:{
    isMobileDevice() { return this.$store.getters.getMobileDevice },
    legendTransitionName() {
      if (this.isMobileDevice) return 'slide-fade-up'
      else return 'slide-fade-down'
    }
  },
  methods: {
    toggleLegend: function () {
      this.showLegend = !this.showLegend
      if (this.showLegend) {
        this.toggleLegendOn()
      }
    },
    toggleLegendOn: function () {
      if (this.map.legend && this.map.legend.type !== 'none') {
        this.showLegend = true
        this.legend = this.map.legend
        var legend = this.legend
        var colors = []
        var stops = []
        var labels = []
        var stopsNorm = []
        var stopsPos = []

        process.nextTick(() => {
          if (legend.type === 'continuous') {
            for(var stop in legend.stops) {
              if ( legend.stops.hasOwnProperty(stop)) {
                colors.push(legend.stops[stop][0])
                labels.push(legend.stops[stop][1])
                stops.push(legend.stops[stop][2])
              }
            }

            var gradient = colors.slice()
            // gradient.splice(0, 1)
            var legendId = "#legend-data"
            if (colors !== null) {
              d3.select("svg").remove()
              var colorScale = d3.scaleLinear().range(gradient)
              var svgW = screen.width < 350 ? screen.width : 350 
              var svgH = 50
              var barW = 300
              var barH = 10
              // Normalize Stops
              var minStop =  Math.min.apply(null, stops)
              var maxStop =  Math.max.apply(null, stops)
              for (var i = 0; i < stops.length; i++) {
                stopsNorm[i] = stops[i] / maxStop
                stopsPos[i] = mapRange(stops[i], 0, maxStop, 0, barW)
              }
              var key = d3.select(legendId).append('svg').attr('width', svgW).attr('height', svgH)
              var gradient = key.append('defs').append('svg:linearGradient').attr('id', legendId)
              gradient.selectAll('stop')
                .data(colorScale.range())
                .enter().append('stop')
                .attr('offset', function(color, stopIndex) {
                  return stopsNorm[stopIndex]
                })
                .attr('stop-color', function(color) {
                  return color
                })

              var xScale = d3.scaleOrdinal()
              .domain(labels)
              .range([0, barW])
              var xAxis = d3.axisBottom(xScale).tickValues(labels)
              var xOffset = (svgW - barW)/2

              key.append('rect')
                .attr('width', barW)
                .attr('height', barH)
                .style('fill', 'url(#' + legendId + ')')
                .attr('y', '0px')
                .attr('x', xOffset)

              key.append('g')
              .attr("class", "xAxis")
              .attr('transform', 'translate('+ xOffset + ',' + barH + ')')
              .call(xAxis)
              .selectAll('.tick').each(function(data, index) {
                var tick = d3.select(this)
                tick.attr('text-anchor', 'end')
                tick.attr('transform', (d,i) => 'translate(' + stopsPos[index] + ',' + 0 + ')  ')
              })
              .style('font-size', 12)
              .style('font-family', 'IBMPlexSans')

              key.selectAll('.tick text')
              .attr('transform', 'rotate(-40)')

              key.selectAll('.xAxis path')
              .style('stroke-opacity', 0.4)
            }
          } else if (legend.type === 'categorical'){
            for(var stop in legend.stops) {
              if ( legend.stops.hasOwnProperty(stop)) {
                colors.push(legend.stops[stop][0])
                labels.push(legend.stops[stop][1])
              }
            }
            var svgW = 300
            var svgH = labels.length * 30
            var barW = 60
            var barH = 20

            d3.select("svg").remove()
            var key = d3.select('#legend-data').append('svg').attr('width', svgW).attr('height', svgH)
            labels.forEach(function(item, i) {
              key.append('rect')
                .attr('width', barW)
                .attr('height', barH)
                .style('fill', colors[i])
                .attr('x', 20)
                .attr('y', 30 * i )

              key.append('text')
                .attr('x', barW + 30)
                .attr('y', 30 * i + 15)
                .attr('text-anchor', 'start')
                .text(labels[i])
                .style('font-size', 12)
                .style('font-family', 'IBMPlexSans')
            })
          }
        })
      } else {
        this.showLegend = false
        this.visible = false
        d3.select("svg").remove()
      }   
      function mapRange(value, in_min, in_max, out_min, out_max) {
        return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
      }
    }
  },
  mounted() {
    // Show/Update legend
    this.$bus.$on('updateLegend',(payload)=>{
      this.map = payload
      this.toggleLegendOn()
    })

    // Hide legend on location update
    this.$bus.$on('flyTo', (payload) => {
      this.showLegend = false
    })

    // Hide legend while viewing satellite imagery
    this.$bus.$on('toggleSatellite', (state) => {
      if (state === true)
        this.showLegend = false
      else
        this.showLegend = true
    })
  }
}
</script>

<style lang='sass' scoped>
.toggle-legend
  position: fixed
  top: 1em
  right: 1em

.close-legend
  margin: 10px 
  padding: 5px !important

.slide-fade-up-enter-active, .slide-fade-down-enter-active
  transition: all .3s ease
.slide-fade-up-leave-active, .slide-fade-down-leave-active
  transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0)
.slide-fade-up-enter, .slide-fade-up-leave-to
  transform: translateY(30px)
  opacity: 0
.slide-fade-down-enter, .slide-fade-down-leave-to
  transform: translateY(-30px)
  opacity: 0


#full-map-legend
  position: absolute
  top: 0.5em
  right: 0.5em
  // z-index: 100
  background: #eee
  padding: 0 0 1em 0
  border-radius: 0.3em

#legend-name
  padding: 1em 1em 1.5em 1em

/* portrait phones */
@media only screen and (max-width: 767px) and (orientation: portrait) 
  #full-map-legend
    width: 100%
    position: absolute
    top: initial
    bottom: 0em
    right: 0em

</style>

