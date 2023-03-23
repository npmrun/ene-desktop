
import { getSnippetFolder } from "@/api/snippet/data"
import { defineStore } from "pinia"
import { convertTreeData, findByKey, INiuTreeData, INiuTreeKey } from "princess-ui"

export interface ISnip {
    key: string
    title: string
    desc?: string
    from: INiuTreeKey
    fromText: string
    activeCodeIndex: number
    files: ISnipCode[]
}

export interface ISnipCode {
    key: string
    from: string
    title: string
    desc?: string
    content: string
}

interface IState {
    treeList: INiuTreeData[] // 文件夹
    treeState: {
        openKey?: INiuTreeKey
        activeKeys?: INiuTreeKey[]
        focusKey?: INiuTreeKey
        isFocus?: boolean
    }
    dataList: ISnip[],
    dataState: {
        openKey?: string
    }
}

export const useSnippetStore = defineStore("snippet", {
    state: (): IState => ({
        treeList: [],
        treeState: {
            openKey: undefined,
            focusKey: undefined,
            activeKeys: [],
            isFocus: undefined,
        },
        dataList: [],
        dataState: {
            openKey: undefined
        },
    }),
    getters: {
        openTree(state) {
            if (state.treeState.openKey) {
                const node = findByKey(state.treeState.openKey, state.treeList)
                return node
            }
        },
        activeData(state) {
            if (state.dataState.openKey) {
                const node = state.dataList.find(v => v.key === state.dataState.openKey)
                return node
            }
        },
    },
    actions: {
        /**
         * 获取文件夹列表
         */
        async getSnippetFolder() {
            const data = await getSnippetFolder() ?? []
            this.treeList = convertTreeData(data)
            return this.treeList
        },
        /**
         * 获取片段列表
         */
        async getSnippetList() {
            this.dataList = []
        },
        /**
         * 获取片段中代码列表
         */
        async getSnippetCodeList() {

        },
        /**
         * 删除文件夹
         */
        /**
         * 删除片段
         */
        /**
         * 删除片段代码
         */
        
    },
})
