<script lang="ts" setup>
import { PopupMenu } from "@/bridge/PopupMenu";
import CodeEditor from "@/components/CodeEditor/code-editor.vue"
import { ISnip, ISnipCode } from "@/store/module/collect";
import { judgeFile } from "@common/util/file";
import { cloneDeep } from "lodash";
import { v4 } from "uuid";
import { toast } from "vue3-toastify";

const props = defineProps<{
    data: ISnip
}>()

const emit = defineEmits<{
    (ev: "save", data: ISnip): void
}>()

let curData = ref<ISnip>(cloneDeep(props.data))

watch(()=>props.data, ()=>{
    curData.value = cloneDeep(props.data)
})

const curEditFileTitleIndex = ref()
const curFileIndex = ref(curData.value.files.length ? 0 : -1)
const curFile = ref<ISnipCode>()

const isSame = ref(true)
watch(() => [curData.value, props.data], () => {
    isSame.value = JSON.stringify(toRaw(props.data)) === JSON.stringify(toRaw(curData.value))
}, { deep: true })

watchEffect(() => {
    if (curFileIndex.value !== -1) {
        curFile.value = curData.value.files[curFileIndex.value]
    } else {
        curFile.value = undefined
    }
})

function handleAddFile() {
    curData.value.files.push({
        key: v4(),
        from: curData.value.key,
        title: "片段" + curData.value.files.length,
        desc: "",
        content: ""
    })
    curFileIndex.value = curData.value.files.length - 1
}

function handleClickFile(file: ISnipCode, index: number) {
    curFileIndex.value = index
}

async function handleDelFile(file: ISnipCode, index: number) {
    if (file.content) {
        const answer = await _agent.call("dialog.confrim", { title: "是否删除该片段", message: "删除之后无法找回" })
        if (answer) {
            curData.value.files.splice(index, 1)
        }
    } else {
        curData.value.files.splice(index, 1)
    }
    if (curFileIndex.value === index) {
        curFileIndex.value--
        if (curFileIndex.value < 0) curFileIndex.value = -1
    }
}

const curFileType = computed(() => {
    if (!curFile.value) return
    const obj = judgeFile(curFile.value.title)
    return obj?.language
})

const vFocus = {
    beforeUnmount(el: HTMLInputElement, binding: any) {
        let data = binding.value
        data.title = el.value
    },
    mounted(el: HTMLInputElement, binding: any) {
        let data = binding.value
        let curFile = judgeFile(data.title)
        el.focus()
        setTimeout(() => {
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
        }, 0);
    },
}

function handleContextFile(file: ISnipCode, index: number) {
    const menus = new PopupMenu([
        {
            label: "编辑",
            click() {
                curEditFileTitleIndex.value = index
            }
        }
    ])
    menus.show()
}

function handleSave() {
    if(!curData.value.title){
        toast.error("请输入标题")
        return
    }
    emit("save", cloneDeep(toRaw(curData.value)))
}
</script>
<template>
    <form class="flex flex-col h-1/1">
        <div class="h-45px flex items-center border-b px-12px py-6px">
            <input v-model="curData.title" class="flex-1 w-0 mr-6px input" type="text" placeholder="输入标题">
            <button class="button is-info" @click="handleAddFile">新建片段</button>
        </div>
        <div class="px-12px py-6px border-b">
            <textarea v-model="curData.desc" class="textarea has-fixed-size" placeholder="输入描述"></textarea>
        </div>
        <div class="flex-1 h-0 flex flex-col" v-if="!!curData.files.length">
            <div class="border-b flex items-center overflow-auto noscrollbar h-25px">
                <template v-for="(file, index) in curData.files">
                    <form v-is="curEditFileTitleIndex !== index ? 'div' : 'form'"
                        class="px-8px py-4px h-25px leading-16px flex items-center border-r flex-shrink-0 w-180px group"
                        @submit.prevent="curEditFileTitleIndex = undefined">
                        <template v-if="curEditFileTitleIndex === index">
                            <input v-focus="file" v-model="file.title" @blur.prevent="curEditFileTitleIndex = undefined"
                                class="w-1/1 outline-0 border" type="text" placeholder="输入标题">
                        </template>
                        <template v-else>
                            <div @click="handleClickFile(file, index)" class="w-1/1 h-1/1"
                                @dblclick="curEditFileTitleIndex = index" @contextmenu="handleContextFile(file, index)">
                                {{ file.title }}
                            </div>
                        </template>
                        <div class="p-3px cursor-pointer hidden group-hover:block" @click="handleDelFile(file, index)">X
                        </div>
                    </form>
                </template>
            </div>
            <div class="flex-1 h-0 overflow-hidden" v-if="!!curFile">
                <div class="px-12px py-6px border-b">
                    <input v-model="curFile!.desc" class="input" placeholder="输入内部描述" />
                </div>
                <CodeEditor v-model="curFile!.content" :name="curFile!.title"></CodeEditor>
            </div>
        </div>
        <div class="flex-1 h-0 flex flex-col" v-else>
            <div class="text-size-20px text-gray-400 text-center pt-20px">该文件为空</div>
        </div>
        <div class="border-t flex items-center justify-end px-12px py-6px">
            <div class="flex-1 w-0">{{ curFileType }}</div>
            <button :class="isSame?'':'is-danger'" class="button float-right" @click="handleSave">保存</button>
        </div>
    </form>
</template>