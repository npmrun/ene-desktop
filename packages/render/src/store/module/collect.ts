import { addCollect, getCollectTree } from "@/api/collect"
import { CollectFolder } from "@/api/db"
import { defineStore } from "pinia"
import { convertTreeData, INiuTreeData } from "princess-ui"

export const CollectStore = defineStore("collect", {
    state: (): { treeList: INiuTreeData[] } => ({
        treeList: [],
    }),
    getters: {

    },
    actions: {
        async initCollestTree() {
            const data = await getCollectTree() ?? []
            this.treeList = convertTreeData(data)
            return this.treeList
        },
        async addCollect(){
            try {
                // await addCollect({})
            } catch (error) {
                console.error(error);
                
            }
        },
    },
})
