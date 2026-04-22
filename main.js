import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { tracker } from '@/utils/tracker'

export function createApp() {
  const app = createSSRApp(App)
  
  app.mixin({
    onShow() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      // 确保是页面并且已经挂载 route
      if (currentPage && currentPage.route) {
        tracker.track('PAGE_VIEW', {
          path: '/' + currentPage.route
        });
      }
    }
  })

  return {
    app
  }
}
// #endif