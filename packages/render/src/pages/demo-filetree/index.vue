<script lang="ts" setup>
import { PopupMenu } from "@/bridge/PopupMenu"
import FileTree from "@/page-ui/FileTree/filetree.vue"
import useConfigStore from "@/store/module/config"
import { findNode, findPath, findPathAll } from "@common/util/treeHelper"
import { INiuTreeKey, convert, findByKeyParent } from "princess-ui"
import { INiuTreeData, convertTreeData } from "princess-ui"

const configStore = useConfigStore()
const rootDir = readonly(ref(configStore.storagePath))
const state = reactive<{
    rootDir: string,
    fileData: any[],
    openKey?: INiuTreeKey,
    focusKey?: INiuTreeKey,
    activeKeys: INiuTreeKey[],
    isFocus?: boolean,
}>({
    rootDir: configStore.storagePath,
    fileData: [],
    openKey: undefined,
    focusKey: undefined,
    activeKeys: [],
    isFocus: undefined,
})

onBeforeMount(() => {
    state.fileData = convertTreeData(_agent.file.readFolderToTree(configStore.storagePath).children)
})

function handleClickNode(data: INiuTreeData) {
    state.openKey = data.key
    state.activeKeys = [data.key]
}

function handleContextmenu(data: INiuTreeData) {
    const menuList: IMenuItemOption[] = []
    menuList.push({
        label: "打开所在文件夹",
        click() {
            let array = findPath(state.fileData, (node) => {
                return data.key === node.key
            }) ?? []
            const path = rootDir.value + "/" + array.map((v: any) => v.title).join("/")
            _agent.call("func.showItemInFolder", path)
        },
    })
    const menu = new PopupMenu(menuList)
    menu.show()
}
</script>

<template>
    <div class="flex h-1/1">
        <div class="flex h-1/1">
            <div class="w-300px flex-shrink-0 relative">
                <FileTree @contextmenu="handleContextmenu" sort :list="state.fileData" v-model:activeKeys="state.activeKeys"
                    v-model:openKey="state.openKey" v-model:focusKey="state.focusKey" v-model:isFocus="state.isFocus"
                    @clickNode="handleClickNode">
                </FileTree>
            </div>
            <div class="flex-1">
                <!-- <CodeEditor v-model="content" :key="state.openKey" :name="state.openKey" :logo="(configStore['editor.bg'])">
                </CodeEditor> -->
            </div>
        </div>
    </div>
</template>