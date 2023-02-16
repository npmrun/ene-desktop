import { IndexableType, PromiseExtended } from "dexie"
import { INiuTreeKey } from "princess-ui"
import { v4 } from "uuid"
import { treeMap } from "@common/util/treeHelper"
import { CollectSnip, CollectSnipCode, db } from "../db"
import { ISnip, ISnipCode } from "@/store/module/collect"

export function addSnip(one: CollectSnip): PromiseExtended<IndexableType> {
    return db.collect_snip.add(one)
}

export async function removeSnip(key: string) {
    return await db.transaction('rw', db.collect_snip, db.collect_snipcode, async () => {
        db.collect_snip.delete(key)
        // 删除code
        let allCodeKey: string[] = []
        let r = (await db.collect_snipcode.where("from").equals(key).toArray()) as CollectSnipCode[]
        allCodeKey = allCodeKey.concat(r.map(v=>v.key))
        allCodeKey.length && await db.collect_snipcode.bulkDelete(allCodeKey)
    })
}

export async function getSnips(key?: any) {
    if (key) {
        const array = (await db.collect_snip.where("from").equals(key).toArray()) as CollectSnip[] ?? []
        return array
    }
    const array = (await db.collect_snip.toArray()) as CollectSnip[]
    return array
}

export function updateSnip(key: string, change: { [propsName: string]: any }) {
    return db.collect_snip.update(key, change)
}

// 片段代码
export function addSnipCode(one: CollectSnipCode): PromiseExtended<IndexableType> {
    return db.collect_snipcode.add(one)
}

export function removeSnipCode(key: string) {
    return db.collect_snipcode.delete(key)
}

export async function getSnipCodes(key?: string) {
    if (key) {
        const array = (await db.collect_snipcode.where("from").equals(key).toArray()) as CollectSnipCode[] ?? []
        return array
    }
    const array = (await db.collect_snipcode.toArray()) as CollectSnipCode[]
    return array
}

export function updateSnipCode(key: string, change: { [propsName: string]: any }) {
    return db.collect_snipcode.update(key, change)
}

export async function removeSnipCodes(keys: string[]) {
    return await db.transaction('rw', db.collect_folder, async () => {
        await db.collect_folder.bulkDelete(keys)
    }).then(() => {
        console.log("Delete Transaction committed");
    })
}

export async function updateOneSnip(snip: ISnip, files: ISnipCode[], originFiles: ISnipCode[]) {
    return await db.transaction('rw', db.collect_snip, db.collect_snipcode, async () => {
        await db.collect_snip.update(snip.key, {
            title: snip.title,
            desc: snip.desc,
            from: snip.from,
            fromText: snip.fromText
        })
        let addArray: CollectSnipCode[] = []
        let updateArray: CollectSnipCode[] = []
        let keys: string[] = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            keys.push(file.key)
            const node = originFiles.find(v => v.key === file.key)
            if (!node) {
                addArray.push(file)
            } else if (node && JSON.stringify(file) != JSON.stringify(node)) {
                updateArray.push(file)
            }
        }
        let delArry = originFiles.filter(v => !keys.includes(v.key))
        delArry.length && await db.collect_snipcode.bulkDelete(delArry.map(v => v.key)) // 删除
        addArray.length && await db.collect_snipcode.bulkAdd(addArray)
        updateArray.length && await db.collect_snipcode.bulkPut(updateArray)
    }).then(() => {
        console.log("Delete Transaction committed");
    })
}
