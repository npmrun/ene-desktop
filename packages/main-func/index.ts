import * as db from "@rush/main-module/db"

export { db }

/**
 * 测试进程崩溃
 */
export function crash() {
    process.crash()
}