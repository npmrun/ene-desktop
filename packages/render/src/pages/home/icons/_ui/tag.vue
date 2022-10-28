<template>
    <span class="tag group cursor-pointer is-warning is-medium relative">
        {{ width }}x{{ height }}
        <button v-if="showDel" @click="emit('del')" class="delete is-small"></button>
        <div v-show="src"
            class="absolute hidden group-hover:block top-1/1 left-0 shadow z-10 bg-white overflow-auto max-w-300px max-h-300px">
            <canvas ref="canvasRef" :data-width="width" :data-height="height"></canvas>
        </div>
    </span>
</template>

<script lang="ts" setup>
import { drawCanvas, clearCanvas } from '../util';

const props = withDefaults(defineProps<{
    width: number,
    height: number,
    src?: string,
    showDel?: boolean,
    isCircle?: boolean
}>(), {
    showDel: false,
    isCircle: false
})

const emit = defineEmits<{
    (ev: "del"): void
}>()

const canvasRef = ref()
watch(()=>[props.src, props.isCircle], async ()=>{
    if (props.src) {
        await nextTick()
        await clearCanvas(canvasRef.value)
        await drawCanvas(canvasRef.value, props.src, props.isCircle)
    }
}, {immediate: true})
</script>