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
    },
    loadURL(url: string){
        borwserRef.value?.loadURL(url)
    }
})
</script>
<template>
    <browser ref="borwserRef" v-if="type === 'browser'" home="我的首页" :url="src" :hide="['collect', 'menu']"></browser>
</template>