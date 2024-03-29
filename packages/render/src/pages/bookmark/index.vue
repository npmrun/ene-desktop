<route lang="yaml">
    name: bookmark
    meta:
        cache: true
    </route>
<script lang="ts">
export default defineComponent({
    name: "bookmark",
    components: { Preview }
})
</script>
<script lang="ts" setup>
import Preview from '@/componentsAuto/Preview/Preview.vue';
import RealTree from '@/page-ui/RealTree/RealTree.vue';
import useConfigStore from "@/store/module/config"
import { cloneDeep } from 'lodash';
import CodeEditor from "@/components/CodeEditor/code-editor.vue"
import MdEditor from '@/components/MdEditor/MdEditor.vue'
import AdjustLine from "@/components/adjust-line"
import { INiuTreeData } from 'princess-ui';
import { PopupMenu } from '@/bridge/PopupMenu';

const previewRef = ref()
function setURL(ev: any) {
    let el = ev.target
    let url = el.getAttribute("ahref")
    if (url) {
        _agent.call('func.openExternal', url)
    }
    return false
}
// @ts-ignore
window.setURL = setURL
function onGlobalContextMenu(ev: any) {
    if (ev) {
        let el = ev.target
        if (el.tagName === "A") {
            const menu = new PopupMenu([
                {
                    label: "外部浏览器打开",
                    click() {
                        let url = el.getAttribute("ahref")
                        if (url) {
                            _agent.call('func.openExternal', url)
                        }
                    }
                },
                {
                    label: "内部打开",
                    click() {
                        let url = el.getAttribute("ahref")
                        if (url) {
                            state.showURL = url
                            previewRef.value?.loadURL(url)
                        }
                    }
                }
            ])
            menu.show()
        }
    }
    let selObj = window.getSelection();
    let selText = selObj?.toString()
    if (selText?.startsWith("http")) {
        state.showURL = selText
    }
}
onBeforeUnmount(() => {
    // @ts-ignore
    window.setURL = undefined
    document.removeEventListener("contextmenu", onGlobalContextMenu)
})
document.addEventListener("contextmenu", onGlobalContextMenu)

const configStore = useConfigStore()

const state = reactive<any>({
    activeTab: 0,
    tabs: [],
    showURL: undefined,
    activeNode: undefined,
    content: undefined,
})


function handleReClick(node: any) {
    if (node.activeNode?.key === state.activeNode?.key) {
        handleChange(node, false)
    }
}

let curActiveNode = ref()
let curActiveNodeContent = ref()
function handleEdit({ activeNode }: any) {
    handleChange({ activeNode }, true)
}
async function handleChange({ activeNode }: any, justOpen: boolean) {
    if(!activeNode) return
    if(activeNode.isFolder) return
    if (activeNode.isFile && activeNode.title.endsWith(".web") && !justOpen) {
        curActiveNode.value = activeNode
        curActiveNodeContent.value = await  _agent.file.readLastLineSync(curActiveNode.value.path)
        return
    }
    curActiveNode.value = undefined
    curActiveNodeContent.value = undefined

    state.activeNode = activeNode
    if (state.activeNode) {
        const node = cloneDeep(state.activeNode)
        if (node.isFile) {
            let index = state.tabs.findIndex((v: any) => v.key === node.key)
            if (index === -1) {
                state.activeTab = state.tabs.length
                state.tabs.push(node)
                node.content = _agent.file.readFileSync(state.tabs[state.activeTab].path)
            } else {
                state.activeTab = index
            }
        }
    }
}

const FileTreeRef = ref<InstanceType<typeof RealTree>>()
function handleTabClick(item: any, index: number) {
    state.activeTab = index
    FileTreeRef.value?.setOpenKey(item.key)
}

function handleTabContextMenu(item: any, index: number) {
    const menu = new PopupMenu([
        {
            label: "打开所在文件夹",
            click() {
                _agent.call("func.showItemInFolder", item.path)
            }
        },
        {
            label: "关闭",
            click() {
                handleClose(item, index)
            }
        },
        {
            label: "关闭其他",
            async click() {
                for (let i = state.tabs.length - 1; i >= 0; i--) {
                    if (item.key !== state.tabs[i].key) {
                        await handleClose(state.tabs[i], i)
                    }
                }
            }
        },
        {
            label: "关闭右侧",
            async click() {
                for (let i = state.tabs.length - 1; i >= 0; i--) {
                    console.log(index, i);
                    if (i <= index) {
                        break;
                    }
                    await handleClose(state.tabs[i], i)
                }
            }
        }
    ])
    menu.show()
}


function handleChangeCode(code: string) {
    if (!state.tabs[state.activeTab]) return
    state.tabs[state.activeTab].content = code
    state.tabs[state.activeTab].isModify = true
}
async function handleClose(item: any, index: number) {
    if (item.isModify) {
        let chioce = await _agent.callLong("dialog.confrim", {
            title: "是否放弃保存",
            message: "该文件尚未保存"
        })
        if (chioce == 1) {
            state.tabs.splice(index, 1)
            state.activeTab = state.activeTab - 1
            if (state.activeTab < 0) state.activeTab = 0
            if (state.tabs[state.activeTab]) {
                FileTreeRef.value?.setOpenKey(state.tabs[state.activeTab].key)
            }
        }
    } else if (item.isDelete) {
        let chioce = await _agent.callLong("dialog.confrim", {
            title: "是否放弃保存",
            message: "该文件已删除，是否关闭"
        })
        if (chioce == 1) {
            state.tabs.splice(index, 1)
            state.activeTab = state.activeTab - 1
            if (state.activeTab < 0) state.activeTab = 0
            if (state.tabs[state.activeTab]) {
                FileTreeRef.value?.setOpenKey(state.tabs[state.activeTab].key)
            }
        }
    } else {
        state.tabs.splice(index, 1)
        state.activeTab = state.activeTab - 1
        if (state.activeTab < 0) state.activeTab = 0
        if (state.tabs[state.activeTab]) {
            FileTreeRef.value?.setOpenKey(state.tabs[state.activeTab].key)
        }
    }
}

function handleUpdateinfo(node: any) {
    for (let i = 0; i < state.tabs.length; i++) {
        const tab = state.tabs[i];
        if (node.oldKey === tab.key) {
            delete node.oldKey
            Object.assign(tab, node)
            break
        }
    }
}
function handleCreate(data: INiuTreeData) {
    for (let i = 0; i < state.tabs.length; i++) {
        const tab = state.tabs[i];
        if (data.key === tab.key && tab.isDelete) {
            Reflect.deleteProperty(tab, "isDelete")
            break
        }
    }
}
function handleDelete(data: INiuTreeData) {
    let del = -1;
    for (let i = 0; i < state.tabs.length; i++) {
        const tab = state.tabs[i];
        if (data.key === tab.key) {
            tab.isDelete = true
            if(!tab.content && !tab.isModify && state.activeTab !== i){
                del = i
            }
            break
        }
    }
    if(del != -1){
        state.tabs.splice(del, 1)
    }
}

function handleRename(data: INiuTreeData) {
    console.log(data);
    for (let i = 0; i < state.tabs.length; i++) {
        const tab = state.tabs[i];
        if (data.key === tab.key) {
            tab.title = data.title
            break
        }
    }
}

const keys = useMagicKeys()
const CtrlS = keys['Ctrl+S']
watch(CtrlS, async (v) => {
    if (v) {
        if (state.tabs[state.activeTab]) {
            if (!state.tabs[state.activeTab].isModify && !state.tabs[state.activeTab].isDelete) {
                return
            }
            if (state.tabs[state.activeTab].isDelete) {
                let chioce = await _agent.callLong("dialog.confrim", {
                    title: "该文件已删除，是否创建并保存"
                })
                if (chioce == 1) {
                    _agent.file.writeFileSync(state.tabs[state.activeTab].path, state.tabs[state.activeTab].content)
                    Reflect.deleteProperty(state.tabs[state.activeTab], "isModify")
                    Reflect.deleteProperty(state.tabs[state.activeTab], "isDelete")
                    if (state.showURL && state.showURL.endsWith(".html") && state.showURL === _agent.file.pathToFileURL(state.tabs[state.activeTab].path)) {
                        previewRef.value?.update()
                    }
                }
                return
            }
            _agent.file.writeFileSync(state.tabs[state.activeTab].path, state.tabs[state.activeTab].content)
            Reflect.deleteProperty(state.tabs[state.activeTab], "isModify")
            Reflect.deleteProperty(state.tabs[state.activeTab], "isDelete")
            if (state.showURL && state.showURL.endsWith(".html") && state.showURL === _agent.file.pathToFileURL(state.tabs[state.activeTab].path)) {
                previewRef.value?.update()
            }
        }
    }
})

function handlePreview(node: INiuTreeData, p: string) {
    state.showURL = _agent.file.pathToFileURL(p)
}

const previewLayout = ref("bottom")

const isWebFile = computed(()=>{
    return state.tabs[state.activeTab] && state.tabs[state.activeTab].isFile && state.tabs[state.activeTab].title.endsWith('.web')
})
const isMdFile = computed(()=>{
    return state.tabs[state.activeTab] && state.tabs[state.activeTab].isFile && (state.tabs[state.activeTab].title.endsWith('.md') || state.tabs[state.activeTab].title.endsWith('.mdx') || state.tabs[state.activeTab].title.endsWith('.web'))
})
const isCodeFile = computed(()=>{
    return state.tabs[state.activeTab] && state.tabs[state.activeTab].isFile && !state.tabs[state.activeTab].title.endsWith('.md') && !state.tabs[state.activeTab].title.endsWith('.mdx') && !state.tabs[state.activeTab].title.endsWith('.web')
})
</script>
    
<template>
    <div class="flex h-1/1">
        <div class="w-280px relative border-r h-1/1 overflow-y-auto overflow-x-hidden">
            <RealTree @re-click="handleReClick" ref="FileTreeRef" mid="bookmark" @updateinfo="handleUpdateinfo" @create="handleCreate"
                @delete="handleDelete" @rename="handleRename" :dir="configStore['bookmark.storagePath']"
                @change="handleChange($event, false)" @edit="handleEdit" @preview="handlePreview">
            </RealTree>
            <adjust-line></adjust-line>
        </div>
        <div class="flex-1 w-0">
            <div class="h-1/1 flex flex-col" v-if="curActiveNode && curActiveNodeContent">
                <Preview ref="previewRef" class="h-1/1" type="browser" :src="curActiveNodeContent" :key="curActiveNodeContent">
                </Preview>
            </div>
            <div class="h-1/1 flex flex-col" v-else>
                <div class="tabs is-boxed pt-5px !mb-0" v-if="state.tabs.length">
                    <ul>
                        <li v-for="(item, index) in state.tabs" class="group"
                            :class="[state.activeTab === index ? 'is-active' : '', index == 0 ? 'pl-6px' : '']"
                            @click.stop="handleTabClick(item, index)" @contextmenu.stop="handleTabContextMenu(item, index)">
                            <a>
                                <span class="icon">
                                    <svg-icon name="micons-document"></svg-icon>
                                </span>
                                <span :style="{ textDecoration: item.isDelete ? 'line-through' : '' }">{{ item.title
                                }}</span>
                                <svg-icon v-if="item.isModify" name="code-active" class="ml-5px"
                                    style="width: 8px; height: 8px"></svg-icon>
                                <div @click.stop="handleClose(item, index)" class="ml-6px group-hover:opacity-100 opacity-0"
                                    style="width: 16px !important; height: 16px !important;min-width: 16px !important;min-height: 16px !important;">
                                    X
                                </div>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="flex-1 h-0 flex">
                    <div class="h-1/1 filetree flex-1 w-0">
                        <MdEditor style="height:100%" :value="state.tabs[state.activeTab].content"
                            @change="(v: string) => handleChangeCode(v)" :key="state.tabs[state.activeTab].key"
                            v-if="isMdFile">
                        </MdEditor>
                        <CodeEditor
                            v-if="isCodeFile"
                            v-model="state.tabs[state.activeTab].content" :key="state.tabs[state.activeTab].key"
                            :name="state.tabs[state.activeTab].title as any" :logo="configStore['editor.bg']"
                            @change="handleChangeCode">
                        </CodeEditor>
                    </div>
                    <div class="relative h-1/1 border-l bg-white flex flex-col"
                        v-if="state.showURL && previewLayout == 'right'">
                        <div class="px-6px py-6px bg-white border-b">
                            <button class="button" @click="state.showURL = undefined">关闭网页</button>
                            <button class="button ml-6px" @click="previewLayout = 'bottom'">切换到底部</button>
                        </div>
                        <div class="flex-1 h-0">
                            <Preview ref="previewRef" class="h-1/1" type="browser" :src="state.showURL"
                                :key="state.showURL">
                            </Preview>
                        </div>
                        <AdjustLine mid="filetree-demo-right" direction="left"></AdjustLine>
                    </div>
                </div>
                <!-- <div class="absolute right-0 top-0 b-0 h-1/1 border-l bg-white flex flex-col" v-if="state.showURL && previewLayout == 'right'">
                    <div class="px-6px py-6px bg-white border-b">
                        <button class="button" @click="state.showURL = undefined">关闭网页</button>
                        <button class="button ml-6px" @click="previewLayout = 'bottom'">切换到底部</button>
                    </div>
                    <div class="flex-1 h-0">
                        <Preview ref="previewRef" class="h-1/1" type="browser" :src="state.showURL" :key="state.showURL"></Preview>
                    </div>
                    <AdjustLine mid="filetree-demo-right" direction="left"></AdjustLine>
                </div> -->
                <!-- <div class="relative h-1/1 border-l bg-white flex flex-col" v-if="state.showURL && previewLayout == 'bottom'">
                    <div class="px-6px py-6px bg-white border-b">
                        <button class="button" @click="state.showURL = undefined">关闭网页</button>
                        <button class="button ml-6px" @click="previewLayout = 'right'">切换到右边</button>
                    </div>
                    <div class="flex-1 h-0">
                        <Preview ref="previewRef" class="h-1/1" type="browser" :src="state.showURL" :key="state.showURL"></Preview>
                    </div>
                    <AdjustLine mid="filetree-demo-right" direction="left"></AdjustLine>
                </div> -->
                <div v-if="state.showURL && previewLayout == 'bottom'" class="px-6px py-6px bg-white" style="width: 60%">
                    <button class="button" @click="state.showURL = undefined">关闭网页</button>
                    <button class="button ml-6px" @click="previewLayout = 'right'">切换到右边</button>
                </div>
                <div class="relative border-t bg-white" v-if="state.showURL && previewLayout == 'bottom'">
                    <Preview ref="previewRef" class="h-1/1" type="browser" :src="state.showURL" :key="state.showURL">
                    </Preview>
                    <AdjustLine mid="filetree-demo-right" direction="top"></AdjustLine>
                </div>
            </div>
        </div>
    </div>
</template>
    
<style scoped lang="scss">
.filetree {
    :deep(.bytemd) {
        height: 100%;
        user-select: text;
    }
}
</style>