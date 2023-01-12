// db.ts
import Dexie, { Table } from "dexie"
import { INiuTreeKey } from "princess-ui"

export interface CollectFolder {
    key: INiuTreeKey
    title: string
    isDel?: boolean
    isCollect?: boolean
}

export class MySubClassedDexie extends Dexie {
    collect_folder!: Table<CollectFolder>

    constructor() {
        super("ene-desktop")
        this.version(1.1).stores({
            collect_folder: "key, title, isDel, isCollect",
        })
    }
}

export const db = new MySubClassedDexie()
