<template>
    <div class="loadview-wrapper relative flex flex-col">
        <transition name="fade">
            <slot name="loading" v-if="loading">
                <div class="absolute inset-0 bg-light-600/50 z-999 flex justify-center">
                    <BubbleLoadingIcon style="font-size: 3em; margin-top: 50px" />
                </div>
            </slot>
        </transition>
        <slot name="error" v-if="error">
            <div style="text-align: center; padding: 8px 0; font-size: 16px; font-weight: bold">
                {{ errorTitle }}
            </div>
            <div style="text-align: center; padding: 8px 0; font-size: 14px; color: #00000073">
                {{ errorSubTitle }}
            </div>
        </slot>
        <div v-if="empty && !error && showIcon">
            <slot name="empty">
                <div style="text-align: center; padding: 8px 0; font-size: 16px; font-weight: bold">
                {{ emptyText }}
                </div>
            </slot>
        </div>
        <div class="flex-1 h-0" v-if="isShow">
            <slot></slot>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed } from "vue"
import BubbleLoadingIcon from "~icons/eos-icons/bubble-loading"
const props = withDefaults(
    defineProps<{
        alwaysShow?: boolean
        loading?: boolean
        error?: boolean
        empty?: boolean
        retry?: (...argu: any) => void
        showIcon?: boolean
        loadingText?: string
        errorTitle?: string
        emptyLayout?: "fixed" | "inline"
        errorBtnText?: string
        errorSubTitle?: string
        emptyText?: string
    }>(),
    {
        alwaysShow: true,
        showIcon: true,
        loading: false,
        empty: false,
        error: false,
        emptyLayout: "inline",
        errorTitle: "获取数据失败",
        errorBtnText: "点击重试",
        errorSubTitle: "请检查您的网络连接后重试.",
        loadingText: "加载中...",
        emptyText: "暂无数据",
    },
)

// const emits = defineEmits<{
//     (ev: "loadData", cb: (fn: (...argu: any[]) => Promise<boolean>) => void): void
// }>()

// onBeforeMount(() => {
//     emits("loadData", async function (fn: (...argu: any[]) => Promise<boolean>) {
//         try {
//             loadViewState.loading = true
//             const isEmpty = await fn()
//             if (isEmpty) {
//                 loadViewState.empty = true
//             } else {
//                 loadViewState.empty = false
//             }
//             loadViewState.loading = false
//             loadViewState.error = false
//         } catch (error) {
//             loadViewState.loading = false
//             loadViewState.error = true
//         }
//     })
// })

const isShow = computed(() => {
    if (props.alwaysShow) {
        return true
    }
    if (props.error) {
        return false
    }
    if (props.empty) {
        return false
    }
    return true
})

function clickRetry() {
    props.retry && props.retry()
}
</script>

<style lang="less" scoped>
.wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    :deep(.ant-spin-container) {
        height: 100%;
    }
}
</style>
