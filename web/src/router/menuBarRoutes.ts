const routes = [
  {
    meta: {
      title: "首页",
      icon: "HomeFilled",
    },
    path: "home",
    name: "Home",
    component: () => import("@/views/home/index.vue"),
  },
  {
    meta: {
      title: "视频管理",
      icon: "Menu",
    },
    path: "/video",
    children: [
      {
        meta: {
          title: "视频列表",
        },
        path: "list",
        name: "VideoList",
        component: () => import("@/views/video/list/index.vue"),
      },
      {
        meta: {
          title: "演员信息",
        },
        path: "actor",
        name: "VideoActor",
        component: () => import("@/views/video/actor/index.vue"),
      },
    ],
  },
];

export default routes;
