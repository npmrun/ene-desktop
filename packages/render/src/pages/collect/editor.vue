<script lang="ts" setup>
import CodeEditor from "@/components/CodeEditor/code-editor.vue"
import { ISnip } from "@/store/module/collect";
import { judgeFile } from "@common/util/file";
import { cloneDeep } from "lodash";

const props = defineProps<{
    data: ISnip
}>()

let curData = ref<ISnip>(cloneDeep(props.data))
const curEditFileTitleIndex = ref()
const curFile = ref()
// curEditTitleKey.value =

const vFocus = {
    beforeUnmount(el: HTMLInputElement, binding: any) {
        let data = binding.value
        data.title = el.value
    },
    mounted(el: HTMLInputElement, binding: any) {
        let data = binding.value
        let curFile = judgeFile(data.title)
        if (curFile) {
            let index = curFile.index
            if (curFile.ext && index != undefined) {
                el.setSelectionRange(0, index)
            }
            if (curFile.pre && index != undefined) {
                el.setSelectionRange(index + 1, data.title.length)
            }
        } else {
            el.select()
        }
        el.focus()
    },
}
</script>
<template>
    <form class="flex flex-col h-1/1">
        <div class="h-45px flex items-center border-b px-12px py-6px">
            <input v-model="curData.title" class="flex-1 w-0 mr-6px input" type="text" placeholder="输入标题">
            <button class="button is-info">新建片段</button>
        </div>
        <div class="px-12px py-6px border-b">
            <textarea v-model="curData.desc" class="textarea has-fixed-size" placeholder="输入描述"></textarea>
        </div>
        <div class="flex-1 h-0 flex flex-col">
            <div class="border-b flex items-center overflow-auto noscrollbar">
                <template v-for="(file, index) in curData.files">
                    <form v-is="curEditFileTitleIndex !== index ? 'div' : 'form'"
                        class="px-8px py-4px h-25px leading-16px flex items-center border-r flex-shrink-0 w-180px"
                        @submit.prevent="curEditFileTitleIndex = undefined">
                        <template v-if="curEditFileTitleIndex === index">
                            <input v-focus="file" v-model="file.title" @blur.prevent="curEditFileTitleIndex = undefined"
                                class="w-1/1" type="text" placeholder="输入标题">
                        </template>
                        <template v-else>
                            <div class="w-1/1 h-1/1" @click="curEditFileTitleIndex = index">
                                {{ file.title }}
                            </div>
                        </template>
                    </form>
                </template>
            </div>
            <div class="flex-1 h-0 overflow-hidden">
                <div class="px-12px py-6px border-b">
                    <input class="input" placeholder="输入内部描述" />
                </div>
                <CodeEditor name="a.ts"></CodeEditor>
            </div>
        </div>
        <div class="border-t flex items-center justify-end px-12px py-6px">
            <button class="button is-danger float-right">保存</button>
        </div>
    </form>
</template>