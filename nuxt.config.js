module.exports = {
  env: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000'
  },
  /*
  ** Headers of the page
  */
  head: {
    title: 'client-manager',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Client Manager' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** Run ESLint on save
    */
    extend (config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    },
    vendor: [
      'axios',
      'vee-validate',
      'vue-swatches',
      'vue-clipboard2',
      'vue-videobg'
    ]
  },
  modules: [
    '@nuxtjs/font-awesome',
    '@nuxtjs/vuetify'
  ],
  router: {
    base: '/'
    //middleware: 'auth'
  },
  vuetify: {
    // Vuetify の設定はここに書く
    theme: {
      primary: '#03A9F4',
      secondary: '#b0bec5',
      accent: '#8c9eff',
      error: '#F44336'
    }
  },
  plugins: [
    {src: '~plugins/vee-validate.js', ssr: true},
    {src: '~plugins/vue-swatches.js', ssr: false},
    {src: '~plugins/vue-clipboard2.js', ssr: false},
    {src: '~plugins/vue-videobg.js', ssr: false},
    {src: '~plugins/axios.js', ssr: false}
  ]
}
