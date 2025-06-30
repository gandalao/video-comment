import { createApp } from "vue";
import "./styles/index.scss";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";

const app = createApp(App);

const baseURL = import.meta.env.VITE_BASE_URL;

// 挂载到 app.config.globalProperties，便于在组件中访问
app.config.globalProperties.$baseURL = baseURL;

app.use(router);
app.use(createPinia());
app.use(ElementPlus, {
  locale: zhCn,
});
app.mount("#app");
