/*
 ** Environment Variables
 */
const dotenv = require('dotenv').config()

let env = process.env.NODE_ENV || 'dev'
let firebaseConfig
let mapboxAccessToken
let mapboxStyleUrl

if (env === 'dev') {
  firebaseConfig = {
    apiKey: process.env.FIREBASE_DEV_KEY,
    authDomain: process.env.FIREBASE_DEV_DOMAIN,
    databaseURL: process.env.FIREBASE_DEV_URL,
    projectId: process.env.FIREBASE_DEV_ID,
    storageBucket: process.env.FIREBASE_DEV_BUCKET,
    messagingSenderId: process.env.FIREBASE_DEV_SENDER_ID
  }

  mapboxAccessToken = process.env.MAPBOX_DEV_TOKEN
  mapboxStyleUrl = process.env.MAPBOX_DEV_STYLE

} else {

  firebaseConfig = {
    apiKey: process.env.FIREBASE_PROD_KEY,
    authDomain: process.env.FIREBASE_PROD_DOMAIN,
    databaseURL: process.env.FIREBASE_PROD_URL,
    projectId: process.env.FIREBASE_PROD_ID,
    storageBucket: process.env.FIREBASE_PROD_BUCKET,
    messagingSenderId: process.env.FIREBASE_PROD_SENDER_ID
  }

  mapboxAccessToken = process.env.MAPBOX_PROD_TOKEN
  mapboxStyleUrl = process.env.MAPBOX_PROD_STYLE

}

module.exports = {
  /*
   ** Environment Variables
   */
  env: {
    NODE_ENV: env,
    firebaseConfig: firebaseConfig,
    mapboxAccessToken: mapboxAccessToken,
    mapboxStyleUrl: mapboxStyleUrl
  },
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.FRONTEND_PROJECT_TITLE,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.FRONTEND_PROJECT_DESCRIPTION }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
   ** CSS Stylesheets
   */
  css: [
    'element-ui/lib/theme-chalk/index.css',
    '@/assets/css/fonts.css',
    '@/assets/css/fontawesome-all.min.css',
    '@/assets/css/mapbox-gl-js/v0.43.0/mapbox-gl.css'
  ],
  /*
   ** Customize the progress bar color
   */
  loading: { color: '#3B8070' },
  /*
   ** Build configuration
   */
  build: {
    vendor: ['mapbox-gl'],
    modules: [
      '@nuxtjs/google-analytics',
      'nuxt-sass-resources-loader'
    ],
    /*
     ** Google Analytics ID
     */
    'google-analytics': {
      id: process.env.GOOGLE_ANALYTICS_ID
    },
    /*
     ** Run ESLint on save
     */
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      config.module.noParse = /(mapbox-gl)\.js$/
    }
  },
  /*
   ** Plugins
   */
  plugins: [
    { src: '~plugins/local-storage', ssr: false },
    { src: '~plugins/quill-editor', ssr: false },
    '~plugins/element-ui',
    '~/plugins/event-bus',
    '~/plugins/firebase',
    '~/plugins/vue-clipboard'
  ],
  /*
   ** For live reloading
   */
  watchers: {
    webpack: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }
}
