<template>
    <div
        ref="elRef"
        class="fixed bottom-0 left-0 right-0 bg-light-900 opacity-70 hover:opacity-100 transition-all"
        :class="[isOpen ? '!opacity-100' : '']"
        @click="isOpen = !isOpen"
    >
        <div
            class="flex justify-center items-center cursor-pointer h-18px hover:h-25px transition-all"
            :class="[isOpen ? '!h-25px' : '']"
        >
            <span>开发信息面板</span>
            <UpArrow class="transition-all" :class="[isOpen && 'rotate-z-180 transform']"/>
            <div class="absolute left-0" :title="curPath">当前路由：{{ curPath }}</div>
        </div>
        <div v-if="isOpen">
            
        </div>
    </div>
</template>
<script lang="ts" setup>
import UpArrow from "~icons/ic/baseline-keyboard-double-arrow-up"

const route = useRoute()
const curPath = computed(() => route.fullPath)
const isOpen = ref(false)
const elRef = ref()
onClickOutside(elRef, () => {
    isOpen.value = false
})
</script>
<style lang="less" scoped></style>
