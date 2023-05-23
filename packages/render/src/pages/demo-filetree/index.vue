<script lang="ts" setup>
import { PopupMenu } from "@/bridge/PopupMenu"
import FileTree from "@/page-ui/FileTree/filetree.vue"
import useConfigStore from "@/store/module/config"
import { findNode, findPath, findPathAll } from "@common/util/treeHelper"
import { INiuTreeKey, convert, findByKeyParent } from "princess-ui"
import { INiuTreeData, convertTreeData } from "princess-ui"
import CodeEditor from "@/components/CodeEditor/code-editor.vue"

const configStore = useConfigStore()
const state = reactive<{
    rootDir: string
    content: string
    fileData: any[]
    openKey?: INiuTreeKey
    focusKey?: INiuTreeKey
    activeKeys: INiuTreeKey[]
    isFocus?: boolean
}>({
    rootDir: _agent.file.replacePath(configStore.storagePath),
    content: "",
    fileData: [],
    openKey: undefined,
    focusKey: undefined,
    activeKeys: [],
    isFocus: undefined,
})

const activeNode = computed(()=>{
    return findNode(state.fileData, (n)=>{
        return n.key === state.openKey
    })
})

function listenFileChange(_: any, ev: any) {
    console.log(ev)
    const array = ev as { path: string; type: string }[]
    for (let i = 0; i < array.length; i++) {
        const temp = array[i]
        temp.path = _agent.file.replacePath(temp.path)
        switch (temp.type) {
            case "delete": {
                let node = findNode(state.fileData, node => {
                    return findNodePath(node) == temp.path
                })
                if (node) {
                    let parentNode = findByKeyParent(node.key, state.fileData)
                    if (parentNode) {
                        parentNode.children = parentNode.children?.filter(t => {
                            return t.key !== node.key
                        })
                    } else if (state.fileData.find(t => t.key === node.key)) {
                        state.fileData = state.fileData?.filter(t => {
                            return t.key !== node.key
                        })
                    }
                }
                break
            }
            case "create": {
                let pPath = temp.path.split("/").slice(0, -1).join("/")
                let childFiles =
                    (_agent.file.isDirectory(temp.path)
                        ? _agent.file.readFolderToTree(temp.path).children
                        : undefined) ?? []
                if (state.rootDir === pPath) {
                    let key = _agent.file.realpathSync(temp.path, "hex")
                    state.fileData.push(
                        convert({
                            key: key,
                            title: temp.path.split("/").slice(-1).join(""),
                            // @ts-ignore
                            base: temp.path.split("/").slice(-1).join(""),
                            // @ts-ignore
                            type: _agent.file.isDirectory(temp.path) ? "folder" : "file",
                            children: _agent.file.isDirectory(temp.path) ? childFiles : undefined,
                        }),
                    )
                    state.openKey = key
                    state.activeKeys = [key]
                } else {
                    let pNode = findNode(state.fileData, node => {
                        return findNodePath(node) == pPath
                    })
                    if (pNode) {
                        let key = _agent.file.realpathSync(temp.path, "hex")
                        pNode.children?.push(
                            convert({
                                key: key,
                                title: temp.path.split("/").slice(-1).join(""),
                                // @ts-ignore
                                base: temp.path.split("/").slice(-1).join(""),
                                // @ts-ignore
                                type: _agent.file.isDirectory(temp.path) ? "folder" : "file",
                                children: _agent.file.isDirectory(temp.path) ? childFiles : undefined,
                            }),
                        )
                        state.openKey = key
                        state.activeKeys = [key]
                    }
                }
                break
            }
            case "update": {
                let node = findNode(state.fileData, node => {
                    return findNodePath(node) == temp.path
                })
                
                if (node && node.key === state.openKey) {
                    console.log(temp.path);
                    state.content = _agent.file.readFileSync(temp.path)
                }
                break
            }
            default:
                console.warn("未知操作:", ev)
                break
        }
    }
}

watch(
    () => state.openKey,
    () => {
        try {
            if (state.openKey) {
                let node = findNode(state.fileData, node => {
                    return node.key === state.openKey
                })
                if (node && node.isFile) {
                    console.log(JSON.stringify(node, null, 2))

                    state.content = _agent.file.readFileSync(findNodePath(node))
                }
            }
        } catch (error) {
            console.error(error)
        }
    },
    { immediate: true },
)

onBeforeMount(async () => {
    state.fileData = convertTreeData(_agent.file.readFolderToTree(state.rootDir).children)
    console.log(state.rootDir)
    console.log(state.fileData)
    _agent.on("filetree-update-message", listenFileChange)
    await _agent.callLong("filetree.init", state.rootDir)
})
onBeforeUnmount(async () => {
    _agent.off("filetree-update-message", listenFileChange)
    await _agent.callLong("filetree.dispose", state.rootDir)
})

function handleClickNode(data: INiuTreeData) {
    if (data.isFolder) {
        data.isExpand = !data.isExpand
    }
    state.openKey = data.key
    state.activeKeys = [data.key]
}

function findNodePath(data: INiuTreeData) {
    let array =
        findPath(state.fileData, node => {
            return data.key === node.key
        }) ?? []
    const path = state.rootDir + "/" + array.map((v: any) => v.base).join("/")
    return path
}

function handleContextmenu(data: INiuTreeData) {
    const menuList: IMenuItemOption[] = []
    menuList.push({
        label: "打开所在文件夹",
        click() {
            const path = findNodePath(data)
            _agent.call("func.showItemInFolder", path)
        },
    })
    menuList.push({
        label: "重命名",
        click() {
            data.isEdit = true
        },
    })
    if (data.isFolder) {
        menuList.push({
            label: "新建文件",
            click() {
                data.isFolder && (data.isExpand = true)
                data.children?.push(
                    convert({
                        key: "",
                        base: "",
                        title: "",
                        type: "file",
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
                        base: "",
                        title: "",
                        type: "folder",
                        order: 0,
                        isNew: true,
                        isEdit: true,
                        children: [],
                    } as any),
                )
            },
        })
    }
    const menu = new PopupMenu(menuList)
    menu.show()
}
async function handleCreateOne(data: INiuTreeData, parent: INiuTreeData, done: (status?: boolean) => void) {
    try {
        let p = findNodePath(data)
        const pPath = p.split("/").slice(0, -1).join("/")
        let newPath = pPath + "/" + data.title
        // @ts-ignore
        if (data.type === "file") {
            _agent.file.createFileSync(newPath)
        }
        // @ts-ignore
        if (data.type === "folder") {
            _agent.file.mkdirSync(newPath)
        }
        done(false)
    } catch (error) {
        console.error(error)
        done(false)
    }
}
async function handleRename(data: INiuTreeData, done: (status?: boolean) => void) {
    let p = findNodePath(data)
    const pPath = p.split("/").slice(0, -1).join("/")
    // @ts-ignore
    let oldPath = pPath + "/" + data.base
    let newPath = pPath + "/" + data.title
    try {
        await _agent.file.renameFile(oldPath, newPath)
        done(_agent.file.existsSync(newPath))
    } catch (error) {
        console.error(error)
        done(false)
    }
}
</script>

<template>
    <div class="flex h-1/1">
        <div class="w-300px flex-shrink-0 relative">
            <FileTree
                @contextmenu="handleContextmenu"
                sort
                :list="state.fileData"
                v-model:activeKeys="state.activeKeys"
                v-model:openKey="state.openKey"
                v-model:focusKey="state.focusKey"
                v-model:isFocus="state.isFocus"
                @clickNode="handleClickNode"
                @rename="handleRename"
                @createOne="handleCreateOne"
            ></FileTree>
        </div>
        <div class="flex-1">
            <CodeEditor
                v-if="activeNode"
                v-model="state.content"
                :key="activeNode.key"
                :name="activeNode.title as any"
                :logo="configStore['editor.bg']"
            ></CodeEditor>
        </div>
    </div>
</template>
