<template>
  <div class="member-layout" style="height: 100%">
    <LeftSider :menu-data="routerPathKeyRouter.router" :collapsed="collapsed" />
    <el-container>
      <el-header class="member-layout-header">
        <div class="member-layout-header-left" @click="collapsed = !collapsed">
          <el-icon :size="25" v-if="collapsed">
            <Expand />
          </el-icon>
          <el-icon :size="25" v-else>
            <Fold />
          </el-icon>
        </div>
        <div>
          <el-avatar :size="35" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
        </div>
      </el-header>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import LeftSider from './components/LeftSider.vue';
import layoutRotes from '@/router/menuBarRoutes.ts';
import { formatRoutes } from '@/utils/router';

import { Fold, Expand } from '@element-plus/icons-vue';


const routerPathKeyRouter = ref(formatRoutes(layoutRotes));

const collapsed = ref(false);




</script>

<style lang="scss">
@use "./css/index.scss";
</style>