import { broadcast, platform } from "@rush/main-tool"
import { showAboutWindow } from "@rush/main-func/window/about"
import { setupTray } from "@rush/main-func/window/tray"
import { Shared } from "@rush/main-share"
import { BrowserWindow, Menu, app, ipcMain, MenuItemConstructorOptions } from "electron"
import { cloneDeep } from "lodash-es"
import {windowsMenu} from "./windowsMenu"
import {macMenu} from "./macMenu"
import "./popup"
import { Settings } from "@rush/main-config/config"

export function initMenu() {
    const language = Settings.n.values("language")
    console.log(`考虑i18n,当前语言为: ${language})`);
    let menuList:MenuItemConstructorOptions[]  = windowsMenu
    if(platform === "MacOS"){
        menuList = macMenu
    }
    const menu = Menu.buildFromTemplate(<any>menuList)
    Menu.setApplicationMenu(menu)
}
