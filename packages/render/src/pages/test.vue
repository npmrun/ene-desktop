<script lang="ts" setup>
import { Splitpanes, Pane } from 'splitpanes'
import { ref, onMounted } from 'vue'
import { useResizeObserver } from '@vueuse/core'

const DEFAULT_WIDTH = 320
const leftPaneSize = ref(30)
const splitpanesRef = ref()

const setLeftPaneSize = () => {
    const width = splitpanesRef.value.$el.clientWidth
    leftPaneSize.value = (DEFAULT_WIDTH / width) * 100
}
onMounted(() => {
    setLeftPaneSize()

    useResizeObserver(splitpanesRef, (entries) => {
        const entry = entries[0]
        const { width } = entry.contentRect
        leftPaneSize.value = (DEFAULT_WIDTH / width) * 100
    })
})
</script>

<template>
    <splitpanes style="height: 100%" ref="splitpanesRef" class="default-theme" :dbl-click-splitter="false">
        <Pane class="left" :size="leftPaneSize">
            <div style="background-color: white;height: 100%;">
                <slot name="left"></slot>
            </div>
        </Pane>
        <Pane class="right" :size="100 - leftPaneSize">
            <div style="background-color: white;height: 100%;">
                <slot name="right"></slot>
            </div>
        </Pane>
    </splitpanes>
</template>

<style lang="scss" scoped>
.default-theme {
    :deep(.splitpanes__splitter) {
        border-right: 1px solid #eee;

        &::before {
            opacity: 0;
            transform: opacity .8s ease;
        }

        &:hover::before {
            opacity: 1;
        }

        &::after {
            opacity: 0;
            transform: opacity .8s ease;
        }

        &:hover::after {
            opacity: 1;
        }
    }
}</style>