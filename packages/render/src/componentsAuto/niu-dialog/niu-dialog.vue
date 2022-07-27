<template>
    <teleport :to="to" :disabled="disabled">
        <transition name="fade" @after-leave="close(2)">
            <niu-mask v-model:show="isShowMask"></niu-mask>
        </transition>
        <div class="niu-dialog__wrapper" v-if="isShow" @click="hide">
            <transition name="slide-fade" @after-leave="close(1)">
                <div class="niu-dialog__content" v-if="isShowContent" @click.stop>
                    <slot></slot>
                </div>
            </transition>
        </div>
    </teleport>
</template>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
    to?: string
    disabled?: boolean
    show?: boolean
}>(), {
    to: 'body',
    disabled: false,
    show: false,
})
const emits = defineEmits<{
    (e: "update:show", isShow: boolean): void
}>()

onMounted(() => {
    watch(() => props.show, (isShow) => {
        if (isShow) {
            show()
        } else {
            hide()
        }
    }, {
        immediate: true
    })
})

const isShowMask = ref(false)
const isShowContent = ref(false)

function show() {
    isShow.value = true
    nextTick(() => {
        isShowMask.value = true
        isShowContent.value = true
    })
}

function hide() {
    isShowMask.value = false
    isShowContent.value = false
}

const isShow = ref(false)
let action: number[] = []
function close(type: number) {
    action.push(type)
    if (action.length == 2) {
         isShow.value = false
        emits("update:show", false)
        action = []
    }
}
</script>

<style lang="less" scoped>
.niu-dialog__wrapper {
    position: absolute;
    z-index: 999;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    display: flex;
    overflow: hidden;
    .niu-dialog__content {
        margin: auto;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* 可以为进入和离开动画设置不同的持续时间和动画函数 */
.slide-fade-enter-active {
    transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}

.slide-fade-leave-active {
    transition: opacity 0.2s cubic-bezier(1, 0.5, 0.8, 1), transform 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}
</style>