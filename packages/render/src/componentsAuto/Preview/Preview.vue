<script setup lang="ts">
import browser from "@/components/Browser/browser.vue";
import { debounce } from "lodash";

const borwserRef = ref()

const props = defineProps<{
    type: "browser"
    src: string
}>()

const debounceUpdate = debounce(()=>{
    borwserRef.value?.update()
}, 600)

defineExpose({
    update(){
        debounceUpdate()
    }
})
</script>
<template>
    <browser ref="borwserRef" v-if="type === 'browser'" :url="src" :hide="['collect', 'menu']"></browser>
</template>