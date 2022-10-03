<template>
    <div class="pt-60px flex flex-col relative h-full">
        <div v-if="modelValue != -1" :class="{ 'transition-transform': modelValue != -1}"
            class="mx-10px my-8px h-48px cursor-pointer duration-200 rounded-8px flex items-center justify-center absolute top-0 inset-x-0"
            style="background-color: #F4F8FD;color: #2F66FF;" :style="{
                transform: `translateY(${_top}px)`
            }"></div>
        <div class="flex-1 h-0 relative">
            <router-link :to="item.url" v-for="(item, index) in topList" :key="item.key">
                <div :ref="(el)=>bingEL(el, item.key)" @click="clickTab($event, item.key)"
                    class="mx-10px my-8px h-48px cursor-pointer rounded-8px flex items-center justify-center"
                    :style="{color: modelValue === item.key?'#2F66FF':'#BBBBBB'}">
                    <span>{{item.title}}</span>
                </div>
            </router-link>
        </div>
        <div class="pb-50px relative">
            <router-link :to="item.url" v-for="(item, index) in sysList" :key="item.key">
                <div :ref="(el)=>bingEL(el, item.key)" @click="clickTab($event, item.key)"
                    class="mx-10px my-8px h-48px cursor-pointer rounded-8px flex items-center justify-center"
                    :style="{color: modelValue === item.key?'#2F66FF':'#BBBBBB'}">
                    <span>{{item.title}}</span>
                </div>
            </router-link>
        </div>
    </div>
</template>

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

const _top = ref(0)
watch(() => props.modelValue, async () => {
    await nextTick()
    if (props.modelValue != -1) {
        // @ts-ignore
        const outElOffsetTop = tabsEl[props.modelValue].parentElement.parentElement.offsetTop
        const distance = tabsEl[props.modelValue].offsetTop + outElOffsetTop - 8
        _top.value = distance
    } else {
        _top.value = 0
    }
}, { immediate: true })

function clickTab(ev: MouseEvent, num: number) {
    emit("update:modelValue", num)
}

</script>
