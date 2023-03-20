import { findNextNode, findPreNode, listToTree, treeMap } from "@common/util/treeHelper";
import { IndexableType, PromiseExtended } from "dexie";
import { db, SnippetData, SnippetFolder } from "../db";

function getCurTimestamp() {
    return String(new Date().getTime())
}

export function addOneSnippetFolder(one: SnippetFolder): PromiseExtended<IndexableType> {
    one.createTime = getCurTimestamp()
    return db.snippet_folder.add(one)
}


export async function getSnippetFolder() {
    let array = (await db.snippet_folder.toArray()) as SnippetFolder[]
    if (array) {
        const tree = listToTree(array, { id: "key", pid: "parentKey" })
        for (const node of tree) {
            sortNode(node);
        }
        return tree
        function sortNode(node: any) {
            node.children.sort((a: any, b: any) => a.order - b.order);
            for (const child of node.children) {
                sortNode(child);
            }
        }
    }
    return array
}