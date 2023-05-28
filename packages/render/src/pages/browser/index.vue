<template>
    <browser ref="browserRef" :url="home" :home="home" class="h-1/1" :hide="['collect']"></browser>
</template>

<script lang="ts" setup>
import browser from "@/components/Browser/browser.vue"
const home = "我的首页"
// const home = "https://blog.xieyaxin.top"
</script>
<script lang="ts">
export default defineComponent({
    name: "browser"
})
</script>
<route lang="yaml">
name: browser
meta:
    cache: false
</route>