import { IndexableType, PromiseExtended } from "dexie"
import { INiuTreeKey } from "princess-ui"
import { v4 } from "uuid"
import { CollectFolder, db } from "../db"

export function addCollect(one: CollectFolder): PromiseExtended<IndexableType> {
    return db.collect_folder.add(one)
}

export function removeCollect(key: string | INiuTreeKey) {
    return db.collect_folder.delete(key)
}

/**
 * 删除子树
 */
export async function removeColletTree(key: string | INiuTreeKey) {
    const array = (await getCollectTree()) as CollectTree[]
    const result: INiuTreeKey[] = []
    function readTree(list: CollectTree[], cb?: (data: any) => void) {
        list.forEach((v) => {
            if (v.key === key) {
                result.push(key)
                if (v.children && v.children.length) {
                    readTree(v.children, (data: CollectTree) => {
                        result.push(data.key)
                    })
                }
                return
            }
            cb && cb(v)
            if (v.children && v.children.length) {
                readTree(v.children, cb)
            }
        })
    }
    readTree(array)
    await db.transaction('rw', db.collect_folder, async () => {
        await db.collect_folder.bulkDelete(result as string[])
    }).then(() => {
        console.log("Delete Transaction committed");
    })
    return result
}

export function updateCollect(key: string | INiuTreeKey, change: { [propsName: string]: any }) {
    return db.collect_folder.update(key, change)
}

export function searchCollectByKey(key: string | INiuTreeKey) {
    return db.collect_folder.get(key)
}

interface CollectTree extends CollectFolder {
    children: CollectTree[]
}

function transTree(data: CollectTree[]) {
    let result: CollectTree[] = []
    let map: any = {}
    if (!Array.isArray(data)) {
        //验证data是不是数组类型
        return []
    }
    data.forEach(item => {
        //建立每个数组元素id和该对象的关系
        map[item.key] = item //这里可以理解为浅拷贝，共享引用
    })
    data.forEach(item => {
        if(!item.children){
            item.children = []
        }
        let parent = !!item.parentKey && map[item.parentKey] //找到data中每一项item的爸爸
        if (parent) {
            //说明元素有爸爸，把元素放在爸爸的children下面
            if(!parent.children){
                parent.children = []
            }
            parent.children.push(item)
        } else {
            //说明元素没有爸爸，是根节点，把节点push到最终结果中
            result.push(item) //item是对象的引用
        }
    })
    return result //数组里的对象和data是共享的
}

export async function getCollectTree() {
    const array = (await db.collect_folder.toArray()) as CollectTree[]
    return transTree(array)
}
