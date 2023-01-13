import { CollectData, db } from "../db"

export function addData(opts: CollectData) {
    return db.collect_data.add(opts)
}

export function removeUrl(key: string) {
    return db.collect_data.delete(key)
}

export function updateUrl(key: string, change: Partial<CollectData>) {
    return db.collect_data.update(key, change)
}

export function searchUrlByKey(key: string) {
    return db.collect_data.get(key)
}
