import { createRouter, createWebHashHistory } from "vue-router";
import Layout from "../layout/index.vue";
import menuBarRoutes from "./menuBarRoutes";
const routes = [
  {
    path: "/",
    redirect: "/home",
    component: Layout,
    children: menuBarRoutes,
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/views/404/index.vue"),
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
