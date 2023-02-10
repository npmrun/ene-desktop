import { getCollectTree } from "@/api/collect"
import { CollectFolder } from "@/api/db"
import { findNode } from "@common/util/treeHelper"
import { defineStore } from "pinia"
import { convertTreeData, INiuTreeData, INiuTreeKey } from "princess-ui"

export interface ISnip {
    key: string
    title: string
    desc?: string
    from: INiuTreeKey
    fromText: string
    files: ISnipCode[]
}

export interface ISnipCode {
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
    },
    dataList: ISnip[],
    dataState: {
        openKey?: string
    }
}

export const CollectStore = defineStore("collect", {
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

        },
    }),
    getters: {
        activeData(state) {
            if (state.dataState.openKey) {
                const node = state.dataList.find(v => v.key === state.dataState.openKey)
                return node
            }
        }
    },
    actions: {
        async initCollestTree() {
            const data = await getCollectTree() ?? []
            this.treeList = convertTreeData(data)
            return this.treeList
        }
    },
})
