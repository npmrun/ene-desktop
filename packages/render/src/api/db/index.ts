// db.ts
import Dexie, { Table } from "dexie"
import { INiuTreeKey } from "princess-ui"

export interface CollectData {
    key?: string
    value?: string
    desc?: string
}

export interface CollectFolder {
    key: INiuTreeKey
    parentKey: INiuTreeKey | void
    title: string
    isDel?: boolean
    isCollect?: boolean
}

export interface CollectUrls {
    key: string
    fromId: INiuTreeKey
    fromTitle: string
    title: string
    urls: string[]
    desc?: string
    isDel?: boolean
    isCollect?: boolean
}

export class MySubClassedDexie extends Dexie {
    collect_folder!: Table<CollectFolder>
    collect_urls!: Table<CollectUrls>
    collect_data!: Table<CollectData>

    constructor() {
        super("ene-desktop")
        this.version(1).stores({
            collect_folder: "key, parentKey, title, isDel, isCollect",
            collect_urls: "key, fromId, fromTitle, title, urls, desc, isDel, isCollect",
            collect_data: "key, value, desc",
        })
    }
}

export const db = new MySubClassedDexie()
