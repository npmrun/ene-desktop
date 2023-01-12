import { v4 } from "uuid"
import { db } from "../db"

/**
 * 增
 * @param title 标题
 * @returns 增加的id
 */
function addCollect(title: string) {
    return db.collect_folder.add({
        key: v4(),
        title: title,
    })
}

