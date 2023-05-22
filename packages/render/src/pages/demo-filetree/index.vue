<script lang="ts" setup>
import { PopupMenu } from "@/bridge/PopupMenu"
import FileTree from "@/page-ui/FileTree/filetree.vue"
import useConfigStore from "@/store/module/config"
import { findNode } from "@common/util/treeHelper"
import { convert, findByKeyParent } from "princess-ui"
import { INiuTreeData, convertTreeData } from "princess-ui"
import { v4 } from "uuid"
import CodeEditor from '@/components/CodeEditor/code-editor.vue';

const configStore = useConfigStore()

onBeforeMount(async () => {
    const allDir = []
    _agent.file.walkDir(configStore.storagePath, (file: string, isDirectory: boolean) => {
        console.log(file, isDirectory);
        allDir.push(file)
    })
    await _agent.callLong("filetree.init", configStore.storagePath)
})

onUnmounted(async () => {
    await _agent.callLong("filetree.dispose", configStore.storagePath)
})

function listenFileChange(_:any, ev:any) {
    console.log(ev);
    const array = ev as { path: string, type: string }[]
    for (let i = 0; i < array.length; i++) {
        const temp = array[i];
        switch (temp.type) {
            case "delete":
                let node = findNode(rrr.value, (node) => {
                    return node.base == encodeURIComponent(temp.path)
                })
                let parentNode = findByKeyParent(node.key, rrr.value)
                if (parentNode && node) {
                    parentNode.children = parentNode.children?.filter(t => {
                        return t.key !== node.key
                    })
                }
                break;
            case "create":
                let pNode = findNode(rrr.value, (node) => {
                    return node.base == encodeURIComponent(temp.path.split("/").slice(0, -1).join('/'))
                })
                if (pNode) {
                    let key = v4()
                    pNode.children?.push(
                        convert({
                            key: key,
                            // @ts-ignore
                            base: encodeURIComponent(temp.path),
                            title: temp.path.split("/").slice(-1).join('')
                        })
                    )
                    state.openKey = key
                }
                break;
            case "update":
                let nodee = findNode(rrr.value, (node) => {
                    return node.base == encodeURIComponent(temp.path)
                })
                if (nodee && nodee.key === state.openKey) {
                    let p = decodeURIComponent(nodee.base)
                    content.value = _agent.file.readFileSync(p)
                }
                break;
            default:
                console.warn("未知操作:", ev)
                break;
        }
    }
}

_agent.on("filetree-update-message", listenFileChange)

const rrr = ref(convertTreeData([
    _agent.file.readFolderToTree(configStore.storagePath, () => {
        return v4()
    })
]))
console.log(_agent.file.readFolderToTree(configStore.storagePath, () => {
    return v4()
}));
const state = reactive<any>({
    openKey: undefined,
    focusKey: undefined,
    activeKeys: [],
    isFocus: undefined,
})
function handleClickNode(data: INiuTreeData) {
    state.openKey = data.key
    state.activeKeys = [data.key]
}
function handleContextmenu(data: INiuTreeData) {
    const menuList: IMenuItemOption[] = []
    menuList.push({
        label: "重命名",
        click() {
            data.isEdit = true
        },
    })
    menuList.push({
        label: "新建文件",
        click() {
            data.isFolder && (data.isExpand = true)
            data.children?.push(
                convert({
                    key: "",
                    base: (data as any).base,
                    title: "",
                    order: 0,
                    isNew: true,
                    isEdit: true,
                } as any),
            )
        },
    })
    menuList.push({
        label: "新建文件夹",
        click() {
            data.isFolder && (data.isExpand = true)
            data.children?.push(
                convert({
                    key: "",
                    base: (data as any).base,
                    title: "",
                    order: 0,
                    isNew: true,
                    isEdit: true,
                    children: [],
                } as any),
            )
        },
    })
    const menu = new PopupMenu(menuList)
    menu.show()
}

async function handleCreateOne(data: INiuTreeData, parent: INiuTreeData, done: (status?: boolean) => void) {
    try {
        // @ts-ignore
        data.key = encodeURIComponent(data.base+"/"+data.title)
        // @ts-ignore
        data.base = data.base+"/"+data.title
        done(true)
    } catch (error) {
        console.error(error);
        done(false)
    }
}


async function handleRename(data: INiuTreeData, done: (status?: boolean) => void) {
    // @ts-ignore
    const pPath = data.base.split("/").slice(0, -1).join('/')
    // @ts-ignore
    let oldP = (data.base).split("/").slice(-1).join('')
    try {
        await _agent.file.renameFile(pPath+"/"+oldP, pPath+"/"+data.title)
        done(true)
    } catch (error) {
        console.error(error);
        done(false)
    }
}

let content = ref("")
watchEffect(()=>{
    try {
        if(state.openKey){
            console.log(state.openKey);
            let node = findNode(rrr.value, (node)=>{
                return node.key === state.openKey
            })
            if(node){
                let p = node.base
                content.value = _agent.file.readFileSync(p)
            }
        }
    } catch (error) {
        console.error(error);
    }
})
</script>

<template>
    <div class="flex h-1/1">
        <div class="w-300px flex-shrink-0 relative">
            <FileTree @contextmenu="handleContextmenu" sort :list="rrr" v-model:activeKeys="state.activeKeys" v-model:openKey="state.openKey"
            v-model:focusKey="state.focusKey" v-model:isFocus="state.isFocus" @createOne="handleCreateOne" @clickNode="handleClickNode" @rename="handleRename"></FileTree>
        </div>
        <div class="flex-1">
            <CodeEditor v-model="content" :key="state.openKey" :name="state.openKey" :logo="(configStore['editor.bg'])"></CodeEditor>
        </div>
            
    </div>
</template>