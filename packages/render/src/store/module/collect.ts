import { getCollectTree } from "@/api/collect"
import { CollectFolder } from "@/api/db"
import { defineStore } from "pinia"
import { convertTreeData, INiuTreeData, INiuTreeKey } from "princess-ui"

interface IState {
    treeList: INiuTreeData[] // 文件夹
    treeState: {
        openKey?: INiuTreeKey
        activeKeys?: INiuTreeKey[]
        focusKey?: INiuTreeKey
        isFocus?: boolean
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
        }
    }),
    getters: {

    },
    actions: {
        async initCollestTree() {
            const data = await getCollectTree() ?? []
            this.treeList = convertTreeData(data)
            return this.treeList
        }
    },
})
