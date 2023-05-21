<script lang="ts" setup>
import { PopupMenu } from "@/bridge/PopupMenu"
import FileTree from "@/page-ui/FileTree/filetree.vue"
import useConfigStore from "@/store/module/config"
import { findNode } from "@common/util/treeHelper"
import { convert, findByKeyParent } from "princess-ui"
import { INiuTreeData, convertTreeData } from "princess-ui"
import { v4 } from "uuid"

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
                    pNode.children?.push(
                        convert({
                            key: v4(),
                            // @ts-ignore
                            base: encodeURIComponent(temp.path),
                            title: temp.path.split("/").slice(-1).join('')
                        })
                    )
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
                    key: v4(),
                    title: "",
                    order: 0,
                    isNew: true,
                    isEdit: true,
                }),
            )
        },
    })
    menuList.push({
        label: "新建文件夹",
        click() {
            data.isFolder && (data.isExpand = true)
            data.children?.push(
                convert({
                    key: v4(),
                    title: "",
                    order: 0,
                    isNew: true,
                    isEdit: true,
                    children: [],
                }),
            )
        },
    })
    const menu = new PopupMenu(menuList)
    menu.show()
}

async function handleRename(data: INiuTreeData, done: (status?: boolean) => void) {
    // @ts-ignore
    const pPath = decodeURIComponent(data.base).split("/").slice(0, -1).join('/')
    // @ts-ignore
    let oldP = (decodeURIComponent(data.base)).split("/").slice(-1).join('')
    try {
        await _agent.file.renameFile(pPath+"/"+oldP, pPath+"/"+data.title)
        done(true)
    } catch (error) {
        console.error(error);
        done(false)
    }
}
</script>

<template>
    <div>
        <FileTree @contextmenu="handleContextmenu" sort :list="rrr" v-model:activeKeys="state.activeKeys" v-model:openKey="state.openKey"
            v-model:focusKey="state.focusKey" v-model:isFocus="state.isFocus" @clickNode="handleClickNode" @rename="handleRename"></FileTree>
        {{ rrr }}
    </div>
</template>