<script lang="ts" setup>
import { ref, toRefs, watch, nextTick } from "vue";
import { type RouteRecordRaw } from "vue-router";

// import { getSelectLeftMenuPath } from "@/utils/router";

import SiderMenuItem from "./SiderMenuItem.vue";

interface Props {
	menuData: RouteRecordRaw[];
	mode?: "horizontal" | "vertical";
	collapsed?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	mode: "vertical",
	collapsed: false,
});

const { menuData, mode, collapsed } = toRefs(props);


</script>

<template>
	<el-menu class="member-layout-menu" :mode="mode" :collapse="collapsed" :collapse-transition="false">
		<SiderMenuItem v-for="item in menuData" :key="item.path" :route-item="item" />
	</el-menu>
</template>
