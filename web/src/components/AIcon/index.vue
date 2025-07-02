<script setup lang="ts">
import { computed } from 'vue'
import { HomeFilled,Menu } from '@element-plus/icons-vue'

const iconsMap = {
  HomeFilled,
  Menu
}

const props = defineProps({
  name: {
    type: String as () => keyof typeof iconsMap | undefined,
    default: undefined,
  },
})

// 使用 computed 确保响应性更新
const component = computed(() => {
  if (!props.name) return null
  const iconComponent = iconsMap[props.name]
  if (!iconComponent) {
    console.warn(`Icon "${props.name}" not found in iconsMap`)
    return null
  }
  return iconComponent
})
</script>

<template>
  <el-icon>
    <component v-if="component" :is="component" class="svg-icon" />
  </el-icon>
</template>

<style lang="scss" scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  overflow: hidden;
  vertical-align: -0.15em;
  fill: currentcolor;
}
</style>