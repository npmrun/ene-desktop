import { IndexableType, PromiseExtended } from "dexie";
import { db, SnippetFolder } from ".";

function getCurTimestamp() {
    return String(new Date().getTime())
}

export function addOneSnippetFolder(one: SnippetFolder): PromiseExtended<IndexableType> {
    one.createTime = getCurTimestamp()
    return db.snippet_folder.add(one)
}