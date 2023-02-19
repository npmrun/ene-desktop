<template>
    <browser ref="browserRef" :url="home" :home="home" class="h-1/1"></browser>
</template>

<script lang="ts" setup>
import browser from "./browser.vue"
const home = "我的首页"
// const home = "https://blog.xieyaxin.top"
</script>

<route lang="yaml">
name: browser
meta:
    cache: true
</route>