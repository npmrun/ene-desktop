<template>
    <div class="pt-60px flex flex-col relative h-full">
        <div v-if="activeKey != -1" :class="{ 'transition-transform': activeKey != -1}"
            class="mx-10px my-8px h-48px cursor-pointer duration-300 rounded-8px flex items-center justify-center absolute top-0 inset-x-0"
            style="background-color: #F4F8FD;color: #2F66FF;" :style="{
                transform: `translateY(${top}px)`
            }"></div>
        <div class="flex-1 h-0 relative">
            <template v-for="(item, index) in topList" :key="item.key">
                <div :ref="(el)=>bingEL(el, item.key)" @click="clickTab($event, item.key)"
                    class="mx-10px my-8px h-48px cursor-pointer rounded-8px flex items-center justify-center"
                    :style="{color: activeKey === item.key?'#2F66FF':'#BBBBBB'}">{{item.title}}</div>
            </template>
        </div>
        <div class="pb-50px relative">
            <template v-for="(item, index) in bottomList" :key="item.key">
                <div :ref="(el)=>bingEL(el, item.key)" @click="clickTab($event, item.key)"
                    class="mx-10px my-8px h-48px cursor-pointer rounded-8px flex items-center justify-center"
                    :style="{color: activeKey === item.key?'#2F66FF':'#BBBBBB'}">{{item.title}}</div>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>

const topList = reactive([
    { key: 0, title: "个人" },
    { key: 1, title: "导航" },
    { key: 2, title: "电视" },
    { key: 3, title: "笔记" },
    { key: 4, title: "博客" },
])
const activeKey = ref(topList[0].key)
const bottomList = reactive([
    { key: 5, title: "设置" },
])


const tabsEl: Record<number, Element> = {}
function bingEL(e: any, index: number) {
    tabsEl[index] = e
}
const top = ref(0)
onMounted(() => {
    if (activeKey.value != -1) {
        top.value = tabsEl[activeKey.value].getBoundingClientRect().y - 8
    }
})
function clickTab(ev: MouseEvent, num: number) {
    const el = ev.target as HTMLDivElement
    top.value = el.getBoundingClientRect().y - 8
    activeKey.value = num
}

</script>
