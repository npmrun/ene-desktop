<template>
    <div class="adjust-line" :class="['adjust-line__' + direction]" ref="adjustLineEL"></div>
</template>

<script lang="ts">
import params from './params'

export default {
    name: params.name
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';

const adjustLineEL = ref<HTMLElement>()

type IProps = {
    /**
     * 所在方向 'left' | 'right' | 'top' | 'bottom'
     */
    direction?: 'left' | 'right' | 'top' | 'bottom'
    /**
     * 需要调整的元素
     */
    target?: HTMLElement
    /**
     * 两个调整线时需要填写
     */
    watch?: HTMLElement
    /**
     * 唯一ID
     */
    mid?: string
}

const props = withDefaults(
    defineProps<IProps>(),
    {
        direction: 'right',
    }
)

let curTarget: HTMLElement | undefined | null

onMounted(async () => {
    await nextTick()
    if (!props.target) {
        curTarget = adjustLineEL.value?.parentElement
    } else {
        curTarget = props.target
    }
    if (curTarget) {
        handle(curTarget)
    }
    watch(
        () => props.target,
        (target) => {
            curTarget = target
            if (curTarget) {
                handle(curTarget)
            }
        }
    )
})

function handle(target: HTMLElement) {
    if (!adjustLineEL.value) return
    const nextContainer = target
    const el = adjustLineEL.value
    const container = el.parentElement
    const parentContainer = container?.parentElement
    const watchContainer = props.watch
    let isThree = false
    if (container !== nextContainer) {
        isThree = true
    }
    if (nextContainer && el && container && parentContainer) {
        if (props.direction === "left" || props.direction === "right") {
            if (props.mid) {
                let w = localStorage.getItem(props.mid)
                if (w != undefined) {
                    container.style.width = w + 'px'
                }
            }
            el.onmousedown = function (e) {
                let width = container.clientWidth
                let nwidth = nextContainer.clientWidth
                // let owidth = nwidth + width
                let owidth = parentContainer.clientWidth
                let wwidth = watchContainer?.clientWidth ?? 0

                if (isThree) {
                    owidth = nwidth + width
                }

                let startX = e.clientX

                let lastPointerEvents = document.body.style.pointerEvents
                let lastUserSelect = document.body.style.userSelect
                let lastOnmousemove = document.onmousemove
                let lastOnmouseup = document.onmouseup
                document.onmousemove = function (e) {
                    let nowX = e.clientX
                    let w = 0
                    let offset = startX - nowX
                    if (props.direction == 'left') {
                        w = width + offset
                    }
                    if (props.direction == 'right') {
                        w = width - offset
                    }
                    if (w >= owidth) {
                        w = owidth
                    }
                    if (w <= 0) {
                        w = 0
                    }
                    // if (Math.abs(w - owidth / 2) <= 10) {
                    //     w = owidth / 2
                    // }
                    // if (Math.abs(w - owidth) < 10) {
                    //     w = owidth
                    // }
                    // if (Math.abs(w) < 10) {
                    //     w = 0
                    // }
                    document.body.style.pointerEvents = 'none'
                    document.body.style.userSelect = 'none'
                    if (!isThree && watchContainer) {
                        let ww = wwidth - offset
                        if (width >= -offset) {
                            watchContainer.style.width = ww + 'px'
                        }
                        nextContainer.style.width = w + 'px'
                    } else {
                        if (!isThree) {
                            nextContainer.style.width = w + 'px'
                            // nextContainer.style.minWidth = w + 'px'
                            // nextContainer.style.flexBasis = w + 'px'
                        } else {
                            nextContainer.style.width = (owidth - w) + 'px'
                            // nextContainer.style.minWidth = (owidth-w) + 'px'
                            // nextContainer.style.flexBasis = (owidth - w) + 'px'
                        }
                    }
                }
                document.onmouseup = function (e) {
                    document.onmousemove = lastOnmousemove
                    document.onmouseup = lastOnmouseup
                    document.body.style.pointerEvents = lastPointerEvents
                    document.body.style.userSelect = lastUserSelect
                    if (props.mid) {
                        let width = container.clientWidth
                        localStorage.setItem(props.mid, String(width))
                    }
                }
            }
        }
        if (props.direction === "top" || props.direction === "bottom") {
            if (props.mid) {
                let w = localStorage.getItem(props.mid)
                if (w != undefined) {
                    container.style.height = w + 'px'
                }
            }
            el.onmousedown = function (e) {
                let height = container.clientHeight
                let nheight = nextContainer.clientHeight
                // let oheight = nheight + height
                let oheight = parentContainer.clientHeight
                let hheight = watchContainer?.clientHeight ?? 0
                if (isThree) {
                    oheight = nheight + height
                }

                let startY = e.clientY

                let lastPointerEvents = document.body.style.pointerEvents
                let lastUserSelect = document.body.style.userSelect
                let lastOnmousemove = document.onmousemove
                let lastOnmouseup = document.onmouseup

                document.onmousemove = function (e) {
                    let nowY = e.clientY
                    let h = 0
                    let offset = startY - nowY
                    if (props.direction == 'top') {
                        h = height + startY - nowY
                    }
                    if (props.direction == 'bottom') {
                        h = height - offset
                    }
                    console.log(oheight);
                    
                    if (h >= oheight) {
                        h = oheight
                    }
                    if (h <= 0) {
                        h = 0
                    }
                    // if (Math.abs(h - oheight / 2) <= 15) {
                    //     h = oheight / 2
                    // }
                    // if (Math.abs(h - oheight) < 50) {
                    //     h = oheight
                    // }
                    // if (Math.abs(h) < 50) {
                    //     h = 0
                    // }
                    document.body.style.pointerEvents = 'none'
                    document.body.style.userSelect = 'none'
                    if (!isThree && watchContainer) {
                        let hh = hheight - offset
                        if (height >= -offset) {
                            watchContainer.style.height = hh + 'px'
                        }
                        nextContainer.style.height = h + 'px'
                    } else {
                        if (!isThree) {
                            nextContainer.style.height = h + 'px'
                            // nextContainer.style.minHeight = h + 'px'
                            // nextContainer.style.flexBasis = h + 'px'
                        } else {
                            nextContainer.style.height = (oheight - h) + 'px'
                            // nextContainer.style.minHeight = (oheight - h) + 'px'
                            // nextContainer.style.flexBasis = (oheight - h) + 'px'
                        }
                    }
                }
                document.onmouseup = function (e) {
                    document.onmousemove = lastOnmousemove
                    document.onmouseup = lastOnmouseup
                    document.body.style.pointerEvents = lastPointerEvents
                    document.body.style.userSelect = lastUserSelect
                    if (props.mid) {
                        let height = container.clientHeight
                        localStorage.setItem(props.mid, String(height))
                    }
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.adjust-line {
    position: absolute;
    z-index: 999;
    transition: background-color 0.5s ease;

    &:hover,
    &:active {
        background: #1976d2;
    }

    &__left {
        left: -2px;
        top: 0;
        bottom: 0;
        width: 4px;
        cursor: ew-resize;
    }

    &__top {
        top: -2px;
        left: 0;
        right: 0;
        height: 4px;
        cursor: n-resize;
    }

    &__bottom {
        bottom: -2px;
        left: 0;
        right: 0;
        height: 4px;
        cursor: n-resize;
    }

    &__right {
        right: -2px;
        top: 0;
        bottom: 0;
        width: 4px;
        cursor: ew-resize;
    }
}
</style>