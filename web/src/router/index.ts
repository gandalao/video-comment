import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/video",
  },

  {
    path: "/home",
    name: "home",
    component: () => import("../views/home/index.vue"),
  },
  {
    path: "/video",
    name: "video",
    component: () => import("../views/video/index.vue"),
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
