<script lang="ts" setup>
import { PopupMenu } from "@/bridge/PopupMenu";
import CodeEditor from "@/components/CodeEditor/code-editor.vue"
import { CollectStore, ISnip, ISnipCode } from "@/store/module/collect";
import { judgeFile } from "@common/util/file";
import { cloneDeep, throttle } from "lodash";
import { v4 } from "uuid";
import { toast } from "vue3-toastify";
import ConfigStore from "@/store/module/config"

const props = defineProps<{
    data: ISnip
}>()

const emit = defineEmits<{
    (ev: "save", data: ISnip, ok: () => void): void
}>()

let curData = ref<ISnip>(cloneDeep(props.data))
const configStore = ConfigStore()

watch(() => props.data, async (value, oldValue) => {
    // if (!isSame.value) {
    //     const answer = await _agent.call("dialog.confrim", { title: "是否保存", message: "取消之后无法找回" })
    //     if (answer) {
    //         collectStore.modifySnip(cloneDeep(toRaw(curData.value)), oldValue.files)
    //     }
    // }
    curData.value = cloneDeep(props.data)
    // curData.value.activeCodeIndex = curData.value.files.length ? 0 : -1
})

const curEditFileTitleIndex = ref()
const curFile = ref<ISnipCode>()

const isSame = ref(true)
watch(() => curData.value, () => {
    isSame.value = JSON.stringify(toRaw(props.data)) === JSON.stringify(toRaw(curData.value))
    save()
}, { deep: true })

const save = throttle(handleSubmit, 200)

watchEffect(() => {
    if (curData.value.activeCodeIndex !== -1) {
        curFile.value = curData.value.files[curData.value.activeCodeIndex]
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
    curData.value.activeCodeIndex = curData.value.files.length - 1
}

function handleClickFile(file: ISnipCode, index: number) {
    curData.value.activeCodeIndex = index
}

async function handleDelFile(file: ISnipCode, index: number) {
    if (file.content) {
        const answer = await _agent.call("dialog.confrim", { title: "是否删除该片段", message: "删除之后无法找回" })
        if (answer) {
            curData.value.files.splice(index, 1)
        }
        return
    } else {
        curData.value.files.splice(index, 1)
    }
    if (curData.value.activeCodeIndex === index) {
        curData.value.activeCodeIndex--
        if (curData.value.activeCodeIndex < 0) curData.value.activeCodeIndex = -1
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
        },{
            label: "删除",
            click() {
                handleDelFile(file, index)
            }
        }
    ])
    menus.show()
}

const { Ctrl_S } = useMagicKeys()

watch(Ctrl_S, (v) => {
    if (v) {
        if (!curData.value.title) {
            toast.error("请输入标题")
            return
        }
        if (isSame.value) {
            toast.success("已保存成功")
            return
        }
        emit("save", cloneDeep(toRaw(curData.value)), () => {
            isSame.value = true
        })
    }
})

function handleSubmit() {
    // if (!curData.value.title) {
    //     toast.error("请输入标题")
    //     return
    // }
    if (isSame.value) {
        // toast.error("一样不需要保存")
        return
    }
    emit("save", cloneDeep(toRaw(curData.value)), () => {
        console.log("save success");
        isSame.value = true
    })
}

async function copyText() {
    if(curFile.value?.content){
        await _agent.call("func.copyText", curFile.value?.content)
        toast.success("复制成功")
    }
}

const cursotPosidian = ref<number[]>([])
function getCursorPosition(pos: [number, number]) {
    cursotPosidian.value = pos
}
</script>
<template>
    <div class="flex flex-col h-1/1">
        <div class="h-45px flex items-center border-b px-12px py-6px">
            <input v-model="curData.title" class="flex-1 w-0 mr-6px input" type="text" placeholder="输入标题">
            <button class="button is-info" @click="handleAddFile">新建片段</button>
        </div>
        <div class="px-12px py-6px text-size-12px text-gray-400">代码修改后直接保存，若保存失败请注意备份</div>
        <div class="px-12px pb-6px border-b">
            <textarea v-model="curData.desc" class="textarea has-fixed-size" placeholder="输入描述"></textarea>
        </div>
        <div class="flex-1 h-0 flex flex-col" v-if="!!curData.files.length">
            <div class="border-b flex items-center overflow-auto noscrollbar h-25px">
                <template v-for="(file, index) in curData.files">
                    <form v-is="curEditFileTitleIndex !== index ? 'div' : 'form'" @click="handleClickFile(file, index)"
                        class="px-8px cursor-pointer border-r border-gray-400 py-4px h-25px leading-16px flex bg-gray-200 items-center border-r flex-shrink-0 w-180px group"
                        @submit.prevent="curEditFileTitleIndex = undefined" :class="curData.activeCodeIndex === index ? 'active' : ''">
                        <template v-if="curEditFileTitleIndex === index">
                            <input v-focus="file" v-model="file.title" @blur.prevent="curEditFileTitleIndex = undefined"
                                class="w-1/1 outline-0 border" type="text" placeholder="输入标题">
                        </template>
                        <template v-else>
                            <div class="w-1/1 h-1/1" @dblclick="curEditFileTitleIndex = index"
                                @contextmenu="handleContextFile(file, index)">
                                {{ file.title }}
                            </div>
                        </template>
                        <div class="p-3px cursor-pointer hidden group-hover:block" @click.stop="handleDelFile(file, index)">
                            X
                        </div>
                    </form>
                </template>
            </div>
            <div class="flex-1 h-0 overflow-hidden" v-if="!!curFile">
                <div class="px-12px py-6px border-b flex">
                    <input v-model="curFile!.desc" class="input flex-1" placeholder="输入内部描述" />
                    <button class="button is-info ml-6px" @click="copyText">复制代码</button>
                </div>
                <CodeEditor :logo="configStore['editor.bg']" logo-type="logo" @cursor:position="getCursorPosition" :key="curFile.key" v-model="curFile!.content" :name="curFile!.title"></CodeEditor>
            </div>
        </div>
        <div class="flex-1 h-0 flex flex-col" v-else>
            <div class="text-size-20px text-gray-400 text-center pt-20px">该文件为空</div>
        </div>
        <div class="border-t flex items-center justify-end px-12px py-6px">
            <div class="flex-1 w-0">{{ curFileType }}</div>
            <div>
                <span>行{{ cursotPosidian[0] }}</span> ,
                <span>列{{ cursotPosidian[1] }}</span>
            </div>
            <!-- <button type="submit" :class="isSame ? '' : 'is-danger'" class="button float-right"
                    @click="handleSubmit">保存</button> -->
        </div>
    </div>
</template>

<style lang="less" scoped>
.active {
    background-color: #fff;
}
</style>