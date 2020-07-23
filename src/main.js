import Vue from 'vue'
import App from './App.vue'
import Port from './library/index'

Vue.config.productionTip = false
Vue.use(Port)
new Vue({
  render: h => h(App),
}).$mount('#app')
