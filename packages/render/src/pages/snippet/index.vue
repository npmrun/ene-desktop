<template>
    <div class="h-1/1 relative flex">
        <div class="h-1/1 flex flex-col">
            <div class="border-b border-r px-12px py-8px flex items-center">
                <div class="mr-6px flex-1 w-0">代码片段工具</div>
            </div>
            <div class="relative flex h-0 flex-1">
                <aside class="w-300px border-r flex flex-col">
                    <Left></Left>
                </aside>
            </div>
        </div>
        <aside class="w-300px border-r flex flex-col">
            <!-- <Docs></Docs> -->
        </aside>
        <main class="flex-1 w-0">
            <!-- <Editor v-model:is-same="isSame" v-if="!!activeData" :data="activeData" @save="handleSave"></Editor> -->
        </main>
    </div>
</template>
<script lang="ts" setup>
import Left from "./left.vue"
</script>
<style lang="less" scoped></style>
