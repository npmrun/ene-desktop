<template>
    <div class="img-wrapper">
        <img :src="_src" :style="computedImgStyle" :alt="alt">
    </div>
</template>
<style lang="less" scoped>
.img-wrapper {
    position: relative;
    width: 50%;

    &::before {
        content: "";
        display: block;
        padding-top: 100%;
    }

    img {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background-color: #f0f0f0;
    }
}
</style>

<script lang="ts" setup>

const props = withDefaults(defineProps<{
    src: string
    placeholder?: string
    lazyload?: boolean
    alt?: string
    mode?: string
    draggable?: boolean
}>(), {
    placeholder: ''
})

const _src = ref()

if (props.lazyload) {
    _src.value = props.placeholder
    const time = 200
    const image = new Image()
    image.src = props.src
    image.style.display = "none"
    const lastTime = new Date().getTime()
    image.onload = () => {
        const curTime = new Date().getTime()
        if (curTime - lastTime >= time) {
            _src.value = image.src
        } else {
            setTimeout(() => {
                _src.value = image.src
            }, time - (curTime - lastTime));
        }
    }
} else {
    _src.value = props.src
}

const computedImgStyle = computed(() => {
    const style: Record<string, any> = {}
    if (props.mode != undefined) {
        style['object-fit'] = props.mode
    }
    if (props.draggable != undefined) {
        style['draggable'] = props.draggable
    }

    return style
})
</script>
