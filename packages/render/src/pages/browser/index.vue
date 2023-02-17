<template>
    <browser ref="browserRef" :home="home" class="h-1/1"></browser>
</template>

<script lang="ts" setup>
import browser from "./browser.vue"
const home = _agent.getStaticHtml("home")
</script>