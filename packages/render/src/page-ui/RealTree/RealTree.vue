<script lang="ts" setup>
import { PopupMenu } from "@/bridge/PopupMenu"
import FileTree from "@/page-ui/FileTree/filetree.vue"
import { findNode, findPath, filter } from "@common/util/treeHelper"
import { ENiuTreeStatus, INiuTreeData, INiuTreeKey, convert, convertTreeData, findByKeyParent } from "princess-ui"
import { toast } from "vue3-toastify"

/**
 * 处理监听器发出的文件变化事件 
 */
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
                    if (state.openKey === node.key) {
                        state.openKey = undefined
                    }
                    let index = state.activeKeys.indexOf(node.key)
                    if (index !== -1) {
                        state.activeKeys.splice(index)
                    }
                }
                break
            }
            case "create": {
                if (!temp.path.endsWith(".md") && !temp.path.endsWith(".mdx")) {
                    toast.error("请新建md文档")
                    return
                }
                let realkey = _agent.file.realpathSync(temp.path, "hex")
                let cur = findNode(state.fileData, (node)=>{
                    return node.key === realkey
                })
                if(cur && cur.justcreate){
                    state.fileData = filter(state.fileData, (node)=>{
                        return node.key !== realkey
                    })
                }
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
                    // state.openKey = key
                    // state.activeKeys = [key]
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
                        // state.openKey = key
                        // state.activeKeys = [key]
                    }
                }
                break
            }
            case "update": {
                console.log(ev);
                break
            }
            default:
                console.warn("未知操作:", ev)
                break
        }
    }
}

const props = withDefaults(defineProps<{
    mid: string
    dir: string
    openKey?: INiuTreeKey
}>(), {})
const emit = defineEmits<{
    (ev: "update:activeNode", node: INiuTreeData): void
    (ev: "updateinfo", node: any): void
    (ev: "delete", node: INiuTreeData): void
    (ev: "change", node: { openKey?: INiuTreeKey, activeNode?: any, activeKeys?: INiuTreeKey[], isFocus?: boolean, focusKey?: INiuTreeKey }): void
}>()

const state = reactive<{
    rootDir?: string
    fileData: any[]
    openKey?: INiuTreeKey
    focusKey?: INiuTreeKey
    activeKeys: INiuTreeKey[]
    isFocus?: boolean
}>({
    rootDir: undefined,
    fileData: [],
    openKey: undefined,
    focusKey: undefined,
    activeKeys: [],
    isFocus: undefined,
})

defineExpose({
    setOpenKey(key?: INiuTreeKey) {
        if (key) {
            state.openKey = key
            state.activeKeys = [key]
            let nodes = findPath(state.fileData, (data) => {
                return data.key == key
            })
            if (nodes) {
                nodes.forEach((node: any) => {
                    node.isFolder && (node.isExpand = true)
                });
            }
        } else {
            state.openKey = undefined
            state.activeKeys = []
        }
    }
})
watch(() => [props, state], () => {
    const node = findNode(state.fileData, n => {
        return n.key === state.openKey
    })
    let result: { openKey?: INiuTreeKey, activeNode?: any, activeKeys?: INiuTreeKey[], isFocus?: boolean, focusKey?: INiuTreeKey } = {
        openKey: state.openKey,
        activeKeys: state.activeKeys,
        isFocus: state.isFocus,
        focusKey: state.focusKey,
    }
    if (node) {
        result["activeNode"] = {
            path: findNodePath(node),
            title: node.title,
            key: node.key,
            isFile: node.isFile,
            isFolder: node.isFolder,
        }
    }
    emit("change", result)
}, {
    deep: true
})
// watchEffect(() => {
//     const node = findNode(state.fileData, n => {
//         return n.key === state.openKey
//     })
//     let result: { openKey?: INiuTreeKey, activeNode?: any, activeKeys?: INiuTreeKey[], isFocus?: boolean, focusKey?: INiuTreeKey } = {
//         openKey: state.openKey,
//         activeKeys: state.activeKeys,
//         isFocus: state.isFocus,
//         focusKey: state.focusKey,
//     }
//     if (node) {
//         result["activeNode"] = {
//             path: findNodePath(node),
//             title: node.title,
//             key: node.key,
//             isFile: node.isFile,
//             isFolder: node.isFolder,
//         }
//     }
//     emit中的响应式也会被监听到
//     emit("change", result)
// })

watch(() => props.dir, async () => {
    await dispose()
    state.rootDir = props.dir
    await initDir()
    console.log("props.dir changed");
}, {
    immediate: true
})
onBeforeMount(() => {
    console.log("onBeforeMount");
    _agent.offAll("filetree-update-message-" + props.mid)
    _agent.on("filetree-update-message-" + props.mid, listenFileChange)
})
onBeforeUnmount(() => {
    console.log("onBeforeUnmount");
    dispose()
    _agent.offAll("filetree-update-message")
})

async function initDir() {
    if (!state.rootDir) return
    if (!_agent.file.isDirectory(state.rootDir)) throw new Error("将要打开的目录不是文件夹:" + state.rootDir)
    state.fileData = convertTreeData(_agent.file.readFolderToTree(state.rootDir, (name: string) => {
        return name.endsWith('.md') || name.endsWith('.mdx')
    }).children)
    await _agent.call("filetree.init", state.rootDir, props.mid)
    console.log("initDir", state.rootDir)
}

async function dispose() {
    if (!state.rootDir) return
    await _agent.call("filetree.dispose", state.rootDir, props.mid)
    console.log("dispose", state.rootDir)
}

function findNodePath(data: INiuTreeData) {
    let array =
        findPath(state.fileData, node => {
            return data.key === node.key
        }) ?? []
    const path = state.rootDir + "/" + array.map((v: any) => v.base).join("/")
    return path
}

// 处理全局右键事件
function handleGlobalContextmenu() {
    // if (!state.rootDir) return
    const menuList: IMenuItemOption[] = []
    menuList.push({
        label: "打开所在的文件夹",
        click() {
            _agent.call("func.openDir", _agent.file.normalizePath(state.rootDir))
        },
    })
    menuList.push({
        label: "新建文件",
        click() {
            state.fileData?.push(
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
            state.fileData?.push(
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

    const menu = new PopupMenu(menuList)
    menu.show()
}

function handleContextmenu(data: INiuTreeData) {
    const menuList: IMenuItemOption[] = []
    if (data.isFile) {
        menuList.push({
            label: "默认程序打开",
            click() {
                const path = findNodePath(data)
                _agent.call("func.openDir", path)
            },
        })
    }
    menuList.push({
        label: "打开所在文件夹",
        click() {
            const path = findNodePath(data)
            _agent.call("func.showItemInFolder", path)
        },
    })
    menuList.push({
        type: "separator",
    })
    if (data.isFile) {
        menuList.push({
            label: "复制",
            click() {
                const path = findNodePath(data)
                _agent.call("copyFile", path)
            },
        })
    }
    menuList.push({
        label: "重命名",
        click() {
            data.isEdit = true
        },
    })
    menuList.push({
        label: "删除",
        async click() {
            const answer = await _agent.callLong("dialog.confrim", { title: "是否删除", message: "是否删除？" })
            if (answer) {
                let path = findNodePath(data)
                if (_agent.file.existsSync(path)) {
                    _agent.file.rm(path)
                    emit("delete", data)
                }
            }
        },
    })
    if (state.activeKeys.length > 1) {
        menuList.push({
            label: "删除所有",
            async click() {
                const answer = await _agent.callLong("dialog.confrim", { title: "是否删除所有", message: "是否删除所有？" })
                if (answer) {
                    for (let i = 0; i < state.activeKeys.length; i++) {
                        const key = state.activeKeys[i]
                        let node = findNode(state.fileData, node => {
                            return node.key === key
                        })
                        if (node) {
                            let path = findNodePath(node)
                            if (path && _agent.file.existsSync(path)) {
                                _agent.file.rm(path)
                                emit("delete", data)
                            }
                        }
                    }
                }
            },
        })
    }
    if (data.isFolder) {
        menuList.push({
            type: "separator",
        })
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

const control = useKeyModifier("Control")
function handleClickNode(data: INiuTreeData) {
    if (control.value) {
        if (!state.activeKeys.includes(data.key)) {
            state.activeKeys.push(data.key)
        } else {
            state.activeKeys = state.activeKeys.filter(v => v !== data.key)
        }
        return
    }
    if (data.isFolder) {
        data.isExpand = !data.isExpand
    }
    state.openKey = data.key
    state.activeKeys = [data.key]
}

async function handleRename(data: INiuTreeData, done: (status?: boolean) => void) {
    let p = findNodePath(data)
    const pPath = p.split("/").slice(0, -1).join("/")
    // @ts-ignore
    let oldPath = pPath + "/" + data.base
    let newPath = pPath + "/" + data.title
    try {
        await _agent.file.renameFile(oldPath, newPath)
        let isSuccess = _agent.file.existsSync(newPath)
        console.log(isSuccess);
        emit("updateinfo", {
            path: newPath,
            title: data.title,
            oldKey: data.key,
            key: _agent.file.realpathSync(newPath, "hex"),
            isFile: data.isFile,
            isFolder: data.isFolder,
        })
        done(isSuccess)
    } catch (error) {
        console.error(error)
        toast.error("重命名失败")
        done(false)
    }
}

function handleCreateOne(data: INiuTreeData, parent: INiuTreeData, done: (status?: boolean) => void) {
    try {
        let p = findNodePath(data)
        // @ts-ignore
        // if(!data.base.endsWith(".md")) data.base += ".md"
        // if(!data.title.endsWith(".md")) data.title += ".md"
        if (!data.title.endsWith(".md") && !data.title.endsWith(".mdx") && data.isFile) {
            toast.error("请新建md文档")
            done(false)
            return
        }
        const pPath = p.split("/").slice(0, -1).join("/")
        let newPath = pPath + "/" + data.title
        if (_agent.file.existsSync(newPath)) throw new Error("已存在该路径")
        // @ts-ignore
        if (data.type === "file") {
            _agent.file.createFileSync(newPath)
        }
        // @ts-ignore
        if (data.type === "folder") {
            _agent.file.mkdirSync(newPath)
        }
        let isSuccess = _agent.file.existsSync(newPath)
        if(isSuccess){
            data.key = _agent.file.realpathSync(newPath, "hex")
            // @ts-ignore
            data.justcreate = true
        }
        done(isSuccess)
    } catch (error) {
        console.error(error)
        toast.error("新建失败")
        done(false)
    }
}

async function handleDropFn(type: ENiuTreeStatus, data: INiuTreeData, targetData: INiuTreeData) {
    if (type !== ENiuTreeStatus.DragInner && type !== ENiuTreeStatus.DragIn) return false
    if (targetData?.children?.find(node => node.key === data.key)) {
        toast.warn("一样的地方拖着干啥？")
        return false
    }
    if (targetData === undefined && state.fileData.find(node => node.key === data.key)) {
        toast.warn("一样的地方拖着干啥？")
        return false
    }
    // TODO 拖动多个文件
    if (data.key && targetData && targetData.key) {
        let srcPath = findNodePath(data)
        let destPath = findNodePath(targetData) + "/" + data.title
        try {
            _agent.file.moveSync(srcPath, destPath)
        } catch (error) {
            console.error(error)
            toast.error("移动失败")
            return false
        }
        emit("updateinfo", {
            path: destPath,
            title: data.title,
            oldKey: data.key,
            key: _agent.file.realpathSync(destPath, "hex"),
            isFile: data.isFile,
            isFolder: data.isFolder,
        })
        targetData.isExpand = true
        return false
    } else if (data.key && targetData === undefined) {
        let srcPath = findNodePath(data)
        let destPath = state.rootDir + "/" + data.title
        try {
            _agent.file.moveSync(srcPath, destPath)
        } catch (error) {
            console.error(error)
            toast.error("移动失败")
            return false
        }
        emit("updateinfo", {
            path: destPath,
            title: data.title,
            oldKey: data.key,
            key: _agent.file.realpathSync(destPath, "hex"),
            isFile: data.isFile,
            isFolder: data.isFolder,
        })
        return false
    }
    return false
}
</script>

<template>
    <div class="h-1/1" @contextmenu="handleGlobalContextmenu">
        <FileTree v-if="state.rootDir && !!state.fileData.length" ref="filetreeRef" @contextmenu="handleContextmenu" sort :list="state.fileData"
            v-model:activeKeys="state.activeKeys" v-model:openKey="state.openKey" v-model:focusKey="state.focusKey"
            v-model:isFocus="state.isFocus" @clickNode="handleClickNode" @rename="handleRename" @createOne="handleCreateOne"
            :dropFn="handleDropFn">
            <template #default="{ data: { data } }">
                <!-- 未保存 -->
            </template>
        </FileTree>
        <div class="text-center text-red-300 pt-20px" style="font-size: 20px;white-space: nowrap;overflow: hidden;" v-if="!state.fileData.length">
            空空如也
        </div>
    </div>
</template>
