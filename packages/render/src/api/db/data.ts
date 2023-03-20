
import { db, SnippetData } from ".";

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