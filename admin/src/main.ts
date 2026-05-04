import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import './styles/index.scss'
import { setupMock } from './mock/setup'
import { useUiFeatureStore } from '@/stores/ui-feature'

// Mock is disabled by default to avoid interfering with backend integration.
// Enable only when explicitly needed:
//   VITE_ENABLE_MOCK=true npm run dev
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK === 'true') {
  setupMock()
}

const app = createApp(App)
const pinia = createPinia()

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)

const uiFeatureStore = useUiFeatureStore(pinia)
void uiFeatureStore.initFeatures().finally(() => {
  app.use(router)
  app.use(ElementPlus, { locale: zhCn })
  app.mount('#app')
})
