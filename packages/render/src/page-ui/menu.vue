<template>
    <div class="pt-60px flex flex-col relative h-full">
        <div v-if="modelValue != -1" :class="{ 'transition-transform': canAnim, 'duration-200': canAnim}"
            class="mx-10px my-8px h-48px cursor-pointer rounded-8px flex items-center justify-center absolute top-0 inset-x-0"
            style="background-color: #F4F8FD;color: #2F66FF;" :style="{
                transform: `translateY(${_top}px)`
            }"></div>
        <div class="flex-1 h-0 relative">
            <router-link custom v-slot="{ navigate }" :to="item.url" v-for="(item, index) in topList">
                <div @click="clickTab($event, item.key, navigate)" :key="item.key" :ref="(el)=>bingEL(el, item.key)"
                    class="mx-10px my-8px h-48px cursor-pointer rounded-8px flex items-center justify-center"
                    :style="{color: modelValue === item.key?'#2F66FF':'#BBBBBB'}">
                    <span>{{item.title}}</span>
                </div>
            </router-link>
        </div>
        <div class="pb-50px relative">
            <router-link custom v-slot="{ navigate }" :to="item.url" v-for="(item, index) in sysList">
                <div @click="clickTab($event, item.key, navigate)" :key="item.key" :ref="(el)=>bingEL(el, item.key)"
                    class="mx-10px my-8px h-48px cursor-pointer rounded-8px flex items-center justify-center"
                    :style="{color: modelValue === item.key?'#2F66FF':'#BBBBBB'}">
                    <span>{{item.title}}</span>
                </div>
            </router-link>
        </div>
    </div>
</template>

<style lang="less" scoped>
    a{
        outline: none;
    }
</style>

<script lang="ts" setup>
import { RouterLink } from 'vue-router';

interface Item {
    key: any
    title: string
    url: string
}
const props = withDefaults(defineProps<{
    modelValue: any,
    topList?: Item[]
    sysList?: Item[]
}>(), {
    topList: () => [],
    sysList: () => []
})

const emit = defineEmits<{
    (ev: "update:modelValue", value: any): void
}>()

const tabsEl: Record<number, HTMLDivElement> = {}
function bingEL(e: any, index: number) {
    tabsEl[index] = e
}

const canAnim = ref(false)
const _top = ref(0)
function layout() {
    if (props.modelValue != -1) {
        // @ts-ignore
        const outElOffsetTop = tabsEl[props.modelValue].parentElement.offsetTop
        const distance = tabsEl[props.modelValue].offsetTop + outElOffsetTop - 8
        _top.value = distance
        setTimeout(() => {
            canAnim.value = true
        }, 0);
    } else {
        canAnim.value = false
        _top.value = 0
    }
}
watch(() => props.modelValue, async () => {
    await nextTick()
    layout()
}, {immediate: true})

async function onResize() {
    layout()
}
onMounted(()=>{
    window.addEventListener("resize", onResize)
})
onBeforeUnmount(()=>{
    window.removeEventListener("resize", onResize)
})

function clickTab(ev: MouseEvent, num: number, navigate: any) {
    navigate()
    emit("update:modelValue", num)
}

</script>
