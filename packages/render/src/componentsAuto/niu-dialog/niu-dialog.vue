<template>
    <teleport :to="to" :disabled="disabled">
        <transition name="fade" @after-leave="close()">
            <niu-mask v-model:show="isShow"></niu-mask>
        </transition>
        <div class="niu-dialog__wrapper" v-show="isShowWraper" @click.stop>
            <transition name="slide-fade" @after-leave="close()">
                <div class="niu-dialog__content" v-show="isShow" @click.stop>
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

const isShow = ref(false)
const isShowWraper = ref(false)

function show() {
    isShowWraper.value = true
    nextTick(()=>{
        isShow.value = true
    })
}

function hide() {
    isShow.value = false
}

function close() {
    isShowWraper.value = false
    emits("update:show", false)
}
</script>

<style lang="less" scoped>
.niu-dialog__wrapper {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;
    .niu-dialog__content {

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
