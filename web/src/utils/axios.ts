import axios from "axios";
import { ElMessage } from "element-plus";

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 15000,
});

service.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.status !== 200) {
      ElMessage.error(res.message);
      return Promise.reject(res);
    }
    return res;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default service;
