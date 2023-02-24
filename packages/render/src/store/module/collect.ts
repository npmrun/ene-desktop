import { getAllData, getCollectTree } from "@/api/collect"
import { addSnip, getSnipCodes, getSnips, removeSnip, removeSnips, updateOneSnip, updateSnip } from "@/api/collect/snip"
import { CollectFolder } from "@/api/db"
import { findNode } from "@common/util/treeHelper"
import { assign } from "lodash"
import { defineStore } from "pinia"
import { convertTreeData, findByKey, INiuTreeData, INiuTreeKey } from "princess-ui"
import { v4 } from "uuid"
import { toast } from "vue3-toastify"

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
            openKey: undefined
        },
    }),
    getters: {
        activeData(state) {
            if (state.dataState.openKey) {
                const node = state.dataList.find(v => v.key === state.dataState.openKey)
                return node
            }
        },
        openTree(state) {
            if (state.treeState.openKey) {
                const node = findByKey(state.treeState.openKey, state.treeList)
                return node
            }
        },
    },
    actions: {
        async exportAllData(){
            const allData = await getAllData()
            return allData
        },
        async modifySnip(snip: any, originFiles: any){
            let files = snip.files
            delete snip.files
            await updateOneSnip(snip, files, originFiles)
            let cur = this.dataList.find(v=>v.key === snip.key)
            if(cur){
                assign(cur, snip)
                cur.files = files
            }
        },
        setActiveSnip(key: string){
            this.dataState.openKey = key
        },
        async afterTree(){
            if (this.treeState.openKey) {
                this.getSnips(this.treeState.openKey)
            }else{
                this.getSnips()
            }
        },
        async createOneSnip() {
            let openTree = this.openTree
            if (openTree) {
                const node = {
                    key: v4(),
                    title: "未命名",
                    desc: "",
                    from: openTree.key,
                    fromText: openTree.title,
                    activeCodeIndex: -1,
                }
                await addSnip(node)
                this.dataState.openKey = node.key
                // this.dataList.push({
                //     ...node,
                //     files: []
                // })
            }else{
                toast.warning("没有激活菜单")
            }
        },
        async removeOneSnip(key: string, index?: number){
            await removeSnip(key)
            if(index != undefined){
                this.dataList.splice(index, 1)
            }
        },
        async removeOneSnips(keys: string[]){
            await removeSnips(keys)
        },
        async getSnips(key?: INiuTreeKey){
            const list = await getSnips(key)
            let snips = []
            for (let i = 0; i < list.length; i++) {
                const node = list[i];
                let codes = await getSnipCodes(node.key)
                snips.push({
                    ...node,
                    files: codes
                })
            }
            this.dataList = snips
        },
        async getSnipsArray(key?: INiuTreeKey){
            const list = await getSnips(key)
            let snips = []
            for (let i = 0; i < list.length; i++) {
                const node = list[i];
                let codes = await getSnipCodes(node.key)
                snips.push({
                    ...node,
                    files: codes
                })
            }
            return snips
        },
        async initCollestTree() {
            const data = await getCollectTree() ?? []
            this.treeList = convertTreeData(data)
            return this.treeList
        }
    },
})
