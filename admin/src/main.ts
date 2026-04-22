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

// ⚠️ 【交接说明：网关拦截开关】
// 目前为了让无本地 Java/Go 后端的环境能跑通列表，这里开启了底层拦截器。
// 后端配合联调时，同事实际只需 **将下面这行代码注释掉**，
// 页面里的所有代码就会变成纯净的 API 真实请求直达 localhost:8080。
setupMock()

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')
