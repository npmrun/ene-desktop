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
import gfm from '@bytemd/plugin-gfm'
import frontmatter from '@bytemd/plugin-frontmatter'
import btybreaks from '@bytemd/plugin-breaks'
import { Editor as MdEditor, Viewer } from '@bytemd/vue-next'
import AdjustLine from "@/components/adjust-line"

function setURL(ev: any) {
    let el = ev.target
    state.showURL = el.getAttribute("ahref")
    return false
}
// @ts-ignore
window.setURL = setURL
onBeforeUnmount(() => {
    // @ts-ignore
    window.setURL = undefined
})
document.addEventListener("contextmenu",(ev)=>{
    console.log(ev);
    let selObj = window.getSelection();
    let selText = selObj?.toString()
    if(selText?.startsWith("http")){
        state.showURL = selText
    }
})

const ppp: any = {
    viewerEffect({ markdownBody }: any) {

        const links = markdownBody.querySelectorAll("a")
        links.forEach((link: any) => {
            link.setAttribute('target', '_blank');
            // @ts-ignore
            link.onclick = window.setURL
            link.oncontextmenu = function () {
                console.log('22');

            }
            link.setAttribute('ahref', link.getAttribute("href"));
            link.removeAttribute("href")
        });
    }
}

const configStore = useConfigStore()

const state = reactive<any>({
    activeTab: 0,
    tabs: [],
    showURL: undefined,
    activeNode: undefined,
    content: undefined,
})

function handleChange({ activeNode }: any) {
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
    } else {
        state.tabs.splice(index, 1)
        state.activeTab = state.activeTab - 1
        if (state.activeTab < 0) state.activeTab = 0
        if (state.tabs[state.activeTab]) {
            FileTreeRef.value?.setOpenKey(state.tabs[state.activeTab].key)
        }
    }
}

const keys = useMagicKeys()
const CtrlS = keys['Ctrl+S']
watch(CtrlS, (v) => {
    if (v) {
        if (state.tabs[state.activeTab]) {
            _agent.file.writeFileSync(state.tabs[state.activeTab].path, state.tabs[state.activeTab].content)
            Reflect.deleteProperty(state.tabs[state.activeTab], "isModify")
        }
    }
})
</script>

<template>
    <div class="h-1/1 flex">
        <div class="h-1/1 w-300px border-r">
            <RealTree ref="FileTreeRef" mid="bookmark" :dir="configStore['bookmark.storagePath']" @change="handleChange">
            </RealTree>
        </div>
        <div class="flex-1 w-0 h-1/1 flex flex-col">
            <div class="tabs is-boxed pt-5px !mb-2px" v-if="state.tabs.length">
                <ul>
                    <li v-for="(item, index) in state.tabs" class="group"
                        :class="[state.activeTab === index ? 'is-active' : '', index == 0 ? 'ml-6px' : '']"
                        @click.stop="handleTabClick(item, index)">
                        <a>
                            <span class="icon">
                                <svg-icon name="micons-document"></svg-icon>
                            </span>
                            <span>{{ item.title }}</span>
                            <svg-icon v-if="item.isModify" name="code-active" class="ml-5px"
                                style="width: 8px; height: 8px"></svg-icon>
                            <button class="delete ml-6px group-hover:!inline-block !hidden"
                                style="width: 16px !important; height: 16px !important;min-width: 16px !important;min-height: 16px !important;"
                                @click.stop="handleClose(item, index)"></button>
                        </a>
                    </li>
                </ul>
            </div>
            <div class="flex-1 h-0">
                <div class="h-1/1 filetree">
                    <MdEditor :plugins="[gfm(), frontmatter(), btybreaks(), ppp]" style="height:100%"
                        :value="state.tabs[state.activeTab].content" @change="(v: string) => handleChangeCode(v)"
                        v-if="state.tabs[state.activeTab] && state.tabs[state.activeTab].isFile && state.tabs[state.activeTab].title.endsWith('.md')">
                    </MdEditor>
                    <CodeEditor v-else-if="state.tabs[state.activeTab] && state.tabs[state.activeTab].isFile"
                        v-model="state.tabs[state.activeTab].content" :key="state.tabs[state.activeTab].key"
                        :name="state.tabs[state.activeTab].title as any" :logo="configStore['editor.bg']"
                        @change="handleChangeCode">
                    </CodeEditor>
                </div>
            </div>
            <div v-if="state.showURL" class="px-6px py-6px bg-white">
                <button class="button" @click="state.showURL=undefined">关闭网页</button>
            </div>
            <div class="relative border-t bg-white" v-if="state.showURL">
                <Preview ref="previewRef" class="h-1/1" type="browser" :src="state.showURL" :key="state.showURL"></Preview>
                <AdjustLine mid="filetree-demo-right" direction="top"></AdjustLine>
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