import 'babel-polyfill'
import Vue from 'vue'
import Vuetify from 'vuetify'
import * as VueGoogleMaps from 'vue2-google-maps'
import App from './App.vue'
import 'vuetify/dist/vuetify.css'

Vue.use(Vuetify)
Vue.config.productionTip = false
Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyAtnqcd7L1MqAuMhmyWJ0DyYaBQvC9eFAw'
  }
})

new Vue({ // eslint-disable-line no-new
  el: '#app',
  render: h => h(App)
})
