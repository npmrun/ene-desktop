<template>
    <div class="flex-1 w-0 h-1/1 flex">
        <div class="w-300px flex border-r flex-col h-1/1">
            <LoadView class="flex-1 h-0" v-bind="loadViewState">
                <div
                    class="bg-light-700 cursor-pointer border-t border-r-width-2px border-r border-r-red-400 last:border-b"
                >
                    <div class="h-14px box-content leading-14px px-6px py-4px font-bold text-size-1.33em">title</div>
                    <div class="h-28px leading-14px box-content px-6px pb-4px">
                        阿萨大阿萨大阿萨大阿萨大阿萨大阿萨大阿萨大阿萨大阿萨大
                    </div>
                </div>
                <div class="cursor-pointer border-r-width-2px border-t border-r border-r-green-400 last:border-b">
                    <div class="h-14px box-content leading-14px px-6px py-4px font-bold text-size-1.33em">title</div>
                    <div class="h-28px leading-14px box-content px-6px pb-4px">
                        阿萨大阿萨大阿萨大阿萨大阿萨大阿萨大阿萨大阿萨大阿萨大
                    </div>
                </div>
            </LoadView>
        </div>
        <main class="flex-1 w-0">
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
        </main>
    </div>
</template>

<script lang="ts" setup>
import LoadView from "@/page-ui/LoadView/LoadView.vue"
import { useSnippetStore } from "@/store/module/snippet"

const SnippetStore = useSnippetStore()

const loadViewState = reactive({
    loading: false,
    error: false,
    empty: false,
    retry: undefined,
})
</script>
<style lang="less" scoped></style>
