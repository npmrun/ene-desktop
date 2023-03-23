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
    isExpand?: boolean
    isDel?: boolean
    isCollect?: boolean
}

export interface CollectSnip {
    key: string
    title: string
    desc?: string
    from: INiuTreeKey
    fromText: string
    activeCodeIndex: number
}

export interface CollectSnipCode {
    key: string
    from: string
    title: string
    desc?: string
    content: string
    order: number
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

export interface SnippetData {
    key?: string
    value?: string
    desc?: string
}

export interface SnippetFolder {
    key: INiuTreeKey
    parentKey: INiuTreeKey | void
    title: string
    order: number
    isExpand?: boolean
    isDel?: boolean
    isCollect?: boolean
    createTime?: string
    updateTime?: string
    deleteTime?: string
}

export interface SnippetSnip {
    key: string
    title: string
    desc?: string
    order: number
    from: INiuTreeKey
    fromText: string
}

export interface SnippetSnipCode {
    key: string
    from: string
    title: string
    desc?: string
    content: string
    order: number
}

export class MySubClassedDexie extends Dexie {
    collect_folder!: Table<CollectFolder>
    collect_snip!: Table<CollectSnip>
    collect_snipcode!: Table<CollectSnipCode>
    collect_urls!: Table<CollectUrls>
    collect_data!: Table<CollectData>

    snippet_folder!: Table<SnippetFolder>
    snippet_snip!: Table<SnippetSnip>
    snippet_snipcode!: Table<SnippetSnipCode>
    snippet_data!: Table<SnippetData>

    constructor() {
        super("ene-desktop")
        this.version(1.8).stores({
            collect_folder: "key, parentKey, title, sort, isExpand, isDel, isCollect",
            collect_snip: "key, title, desc, from, fromText, activeCodeIndex",
            collect_snipcode: "key, from, title, desc, content, order",
            collect_urls: "key, fromId, fromTitle, title, urls, desc, isDel, isCollect",
            collect_data: "key, value, desc",

            snippet_folder: "key, parentKey, title, order, isExpand, isDel, isCollect, createTime, updateTime",
            snippet_snip: "key, title, desc, order, from, fromText",
            snippet_snipcode: "key, from, title, desc, content, order",
            snippet_data: "key, value, desc, createTime, updateTime",
        })
    }
}

export const db = new MySubClassedDexie()
