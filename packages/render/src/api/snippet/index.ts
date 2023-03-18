import Dexie, { Table } from "dexie"
import { INiuTreeKey } from "princess-ui"



export interface SnippetFolder {
    key: INiuTreeKey
    parentKey: INiuTreeKey | void
    title: string
    sort: number
    isExpand?: boolean
    isDel?: boolean
    isCollect?: boolean
    createTime?: string
    updateTime?: string
    deleteTime?: string
}


export class MyDexie extends Dexie {
    snippet_folder!: Table<SnippetFolder>

    constructor() {
        super("ene-desktop")
        this.version(0.1).stores({
            snippet_folder: "key, parentKey, title, sort, isExpand, isDel, isCollect, createTime, updateTime",
        })
    }
}
/**
 一种可行的方法是在本地数据库中标记需要删除的记录，等到网络连接恢复后，同步操作会将这些标记的记录删除，并更新远程数据库。这可以通过增加一个标记字段来实现，在本地数据库中设置一个特定的值（如true或1）来标记需要删除的记录。在同步操作时，只同步标记字段值为true或1的记录，并将它们从远程数据库中删除。同时，本地数据库也将这些记录彻底删除，以确保数据一致性。
 */
export const db = new MyDexie()
