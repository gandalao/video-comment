<script lang="ts" setup>
import { toRefs } from "vue";
import { type RouteRecordRaw } from "vue-router";

import SiderMenu from "./SiderMenu.vue";

interface Props {
  menuData: RouteRecordRaw[];
  collapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
});
const { menuData, collapsed } = toRefs(props);
</script>

<template>
  <div class="member-layout-left" :class="{ collapsed: collapsed }">
    <div class="member-layout-left-box fixed">
      <div class="member-layout-left-logo">
        <router-link to="/" class="logo-url">
          <img class="img" alt="" src="../../assets/vue.svg" />
          <span v-if="!collapsed" class="text">Admin Element Vue</span>
        </router-link>
      </div>
      <div class="member-layout-left-menu">
        <SiderMenu :menu-data="menuData" :collapsed="collapsed" />
      </div>
    </div>
  </div>
</template>
