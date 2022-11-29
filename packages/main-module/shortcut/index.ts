import { Mitt } from "@rush/main-tool/mitt"
import { globalShortcut } from "electron"

export function init() {
    globalShortcut.unregisterAll()
    globalShortcut.register("Alt+CommandOrControl+I", () => {
        console.log("Electron loves global shortcuts!")
    })
}
