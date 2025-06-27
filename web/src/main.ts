import { createApp } from 'vue'
import './styles/index.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'



const app  = createApp(App)


const baseURL = import.meta.env.VITE_BASE_URL

// 挂载到 app.config.globalProperties，便于在组件中访问
app.config.globalProperties.$baseURL = baseURL

app.use(router)
app.use(createPinia())
app.use(ElementPlus)
app.mount('#app')
