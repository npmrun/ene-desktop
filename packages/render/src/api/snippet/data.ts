import { IndexableType, PromiseExtended } from "dexie";
import { db, SnippetData, SnippetFolder } from "../db";

function getCurTimestamp() {
    return String(new Date().getTime())
}

export function addOneSnippetFolder(one: SnippetFolder): PromiseExtended<IndexableType> {
    one.createTime = getCurTimestamp()
    return db.snippet_folder.add(one)
}

export function addData(opts: SnippetData) {
    return db.snippet_data.add(opts)
}

export function removeData(key: string) {
    return db.snippet_data.delete(key)
}

export function updateData(key: string, change: Partial<SnippetData>) {
    return db.snippet_data.update(key, change)
}

export function searchDataByKey(key: string) {
    return db.snippet_data.get(key)
}