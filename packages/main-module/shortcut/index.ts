import { Mitt } from "@rush/main-module/mitt"
import { globalShortcut } from "electron"

export function initShortcut() {
    globalShortcut.unregisterAll()
    globalShortcut.register("Alt+CommandOrControl+I", () => {
        console.log("Electron loves global shortcuts!")
    })
}
