<template>
  <el-container class="layout-container-demo" style="height: 100%">
    <LeftSider :menu-data="routerPathKeyRouter.router" :collapsed="collapsed" />

    <el-container>
      <el-header style="text-align: right; font-size: 12px">

      </el-header>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import LeftSider from './components/LeftSider.vue';
import layoutRotes from '@/router/menuBarRoutes.ts';
import { formatRoutes } from '@/utils/router';


const routerPathKeyRouter = ref(formatRoutes(layoutRotes));

const collapsed = ref(false);




</script>

<style lang="scss">
@import "./css/index.scss";
</style>