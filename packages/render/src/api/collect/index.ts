import { IndexableType, PromiseExtended } from "dexie"
import { v4 } from "uuid"
import { CollectFolder, db } from "../db"

/**
 * 增
 */
export function addCollect(opts: { key?: string, parentKey?: string, title: string }): PromiseExtended<IndexableType> {
    let { key, parentKey, title } = opts
    if (key == undefined) key = v4()
    return db.collect_folder.add({
        key: key,
        parentKey: parentKey,
        title: title,
    })
}

/**
 * 删
 */
export function removeCollect(key: string) {
    return db.collect_folder.delete(key)
}

/**
 * 改
 */
export function updateCollect(key: string, change: { [propsName: string]: any }) {
    return db.collect_folder.update(key, change)
}

/**
 * 查
 */
export function searchCollectByKey(key: string) {
    return db.collect_folder.get(key)
}

interface CollectTree extends CollectFolder {
    children: CollectTree[]
}

function transTree(data: CollectTree[]) {
    let result: CollectTree[] = []
    let map: any = {}
    if (!Array.isArray(data)) {//验证data是不是数组类型
        return []
    }
    data.forEach(item => {//建立每个数组元素id和该对象的关系
        map[item.key] = item //这里可以理解为浅拷贝，共享引用
    })
    data.forEach(item => {
        let parent = !!item.parentKey && map[item.parentKey] //找到data中每一项item的爸爸
        if (parent) {//说明元素有爸爸，把元素放在爸爸的children下面
            (parent.children || (parent.children = [])).push(item)
        } else {//说明元素没有爸爸，是根节点，把节点push到最终结果中
            result.push(item) //item是对象的引用
        }
    })
    return result //数组里的对象和data是共享的
}

export async function getCollectTree() {
    const array = await db.collect_folder.toArray() as CollectTree[]
    return transTree(array)
}