import { findNextNode, findPreNode, listToTree, treeMap } from "@common/util/treeHelper";
import { IndexableType, PromiseExtended } from "dexie";
import { INiuTreeKey } from "princess-ui";
import { db, SnippetData, SnippetFolder } from "../db";

function getCurTimestamp() {
    return String(new Date().getTime())
}

/**
 * 更新单个文件夹信息
 */
export function updateOneSnippetFolder(key: string | INiuTreeKey, change: { [propsName: string]: any }): PromiseExtended<IndexableType> {
    change.updateTime = getCurTimestamp()
    return db.snippet_folder.update(key, change)
}

/**
 * 添加单个文件夹
 */
export function addOneSnippetFolder(one: SnippetFolder): PromiseExtended<IndexableType> {
    one.createTime = getCurTimestamp()
    return db.snippet_folder.add(one)
}

/**
 * 删除单个文件夹
 */
export function removeOneSnippetFolder(key: string | INiuTreeKey) {
    return db.snippet_folder.delete(key)
}

/**
 * 获取文件夹列表
 */
export async function getSnippetFolder() {
    let array = (await db.snippet_folder.toArray()) as SnippetFolder[]
    if (array) {
        const tree = listToTree(array, { id: "key", pid: "parentKey" })
        tree.sort((a: any, b: any) => a.order - b.order);
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
