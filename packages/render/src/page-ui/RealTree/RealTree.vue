<script lang="ts" setup>
import { PopupMenu } from "@/bridge/PopupMenu"
import FileTree from "@/page-ui/FileTree/filetree.vue"
import { findPath } from "@common/util/treeHelper"
import { INiuTreeData, INiuTreeKey } from "princess-ui"

const state = reactive<{
    showURL?: string
    rootDir?: string
    curFile?: string
    content: string
    fileData: any[]
    openKey?: INiuTreeKey
    focusKey?: INiuTreeKey
    activeKeys: INiuTreeKey[]
    isFocus?: boolean
}>({
    showURL: undefined,
    rootDir: undefined, //_agent.file.replacePath(configStore.storagePath),
    curFile: undefined,
    content: "",
    fileData: [],
    openKey: undefined,
    focusKey: undefined,
    activeKeys: [],
    isFocus: undefined,
})

const action = {
    /**
     * 默认程序打开
     */
    open(filePath: string) {
        _agent.call("func.openDir", filePath)
    },
}

function findNodePath(data: INiuTreeData) {
    let array =
        findPath(state.fileData, node => {
            return data.key === node.key
        }) ?? []
    const path = state.rootDir + "/" + array.map((v: any) => v.base).join("/")
    return path
}

function handleContextmenu(data: INiuTreeData) {}

function handleClickNode(data: INiuTreeData) {}

function handleRename() {}

function handleCreateOne() {}

function handleDropFn() {}
</script>

<template>
    <FileTree
        v-if="state.rootDir"
        ref="filetreeRef"
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
        :dropFn="handleDropFn"
    >
        <template #default="{ data: { data } }">
            <!-- 未保存 -->
        </template>
    </FileTree>
</template>
