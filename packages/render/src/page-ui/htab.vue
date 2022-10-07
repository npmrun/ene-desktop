<template>
    <div class="flex flex-col relative h-full">
        <div v-if="modelValue != -1" :class="{ 'transition-transform': modelValue != -1}"
            class="mx-10px my-8px h-48px cursor-pointer duration-200 rounded-8px flex items-center justify-center absolute top-0 inset-x-0"
            style="background-color: #F4F8FD;color: #2F66FF;" :style="{
                transform: `translateY(${_top}px)`
            }"></div>
        <div class="flex-1 h-0 relative">
            <div v-for="(item, index) in list"  @click="clickTab($event, item.key, item)" :key="item.key">
                <div :ref="(el)=>bingEL(el, item.key)"
                    class="mx-10px my-8px h-48px cursor-pointer rounded-8px flex items-center justify-center"
                    :style="{color: modelValue === item.key?'#2F66FF':'#BBBBBB'}">
                    <span>{{item.title}}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
interface Item {
    key: any
    title: string
    url: string
}
const props = withDefaults(defineProps<{
    modelValue: any,
    list?: Item[]
}>(), {
    list: () => []
})

const emit = defineEmits<{
    (ev: "update:modelValue", value: any): void
    (ev: "click", value: Item): void
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

function clickTab(ev: MouseEvent, num: number, item: Item) {
    emit("update:modelValue", num)
    emit("click", item)
}

</script>
