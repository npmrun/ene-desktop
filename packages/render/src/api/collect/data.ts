import { CollectData, db } from "../db"

export function addData(opts: CollectData) {
    return db.collect_data.add(opts)
}

export function removeData(key: string) {
    return db.collect_data.delete(key)
}

export function updateData(key: string, change: Partial<CollectData>) {
    return db.collect_data.update(key, change)
}

export function searchDataByKey(key: string) {
    return db.collect_data.get(key)
}
