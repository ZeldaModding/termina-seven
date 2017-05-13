import Vue from 'vue'
import Electron from 'vue-electron'
import Resource from 'vue-resource'
import Router from 'vue-router'
import BootstrapVue from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App'
import routes from './routes'

Vue.use(Electron)
Vue.use(Resource)
Vue.use(Router)
Vue.use(BootstrapVue)
Vue.config.debug = true

const Config = require('electron-config')
const config = new Config()

console.log(config.get('last_rom'))

const router = new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes,
})

/* eslint-disable no-new */
new Vue({
  router,
  ...App,
}).$mount('#app')
