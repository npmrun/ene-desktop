import { IndexableType, PromiseExtended } from "dexie"
import { CollectUrls, db } from "../db"

export function addUrl(opts: CollectUrls): PromiseExtended<IndexableType> {
    return db.collect_urls.add(opts)
}

export function removeUrl(key: string) {
    return db.collect_urls.delete(key)
}

export function updateUrl(key: string, change: Partial<CollectUrls>) {
    return db.collect_urls.update(key, change)
}

export function searchUrlByKey(key: string) {
    return db.collect_urls.get(key)
}
