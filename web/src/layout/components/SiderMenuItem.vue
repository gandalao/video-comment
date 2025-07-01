<script lang="ts" setup>
import { toRefs } from "vue";
import { type RouteRecordRaw } from "vue-router";


import ALink from "@/components/ALink/index.vue";
import Icon from "@/components/AIcon/index.vue";


interface Props {
  routeItem: RouteRecordRaw;
  userRoles?: string[];
}

const props = defineProps<Props>();

const { routeItem, userRoles } = toRefs(props);

</script>
<template>
  <template v-if="!routeItem.meta?.hidden">
    <template v-if="routeItem.children">
      <el-sub-menu :index="routeItem.path" popper-class="member-layout-menu-popper">
        <template #title>
          <Icon v-if="routeItem.meta?.icon" :name="routeItem.meta?.icon" class="icon" />
          <span>{{ routeItem.meta?.title || "" }}</span>
        </template>
        <SiderMenuItem v-for="item2 in routeItem.children" :key="item2.path" :route-item="item2"
          :user-roles="userRoles" />
      </el-sub-menu>
    </template>
    <template v-else>
      <ALink :to="routeItem.path">
        <el-menu-item :index="routeItem.path">
          <Icon v-if="routeItem.meta?.icon" :name="routeItem.meta?.icon" class="icon" />
          <template #title>{{ routeItem.meta?.title || "" }}</template>
        </el-menu-item>
      </ALink>
    </template>
  </template>
</template>
