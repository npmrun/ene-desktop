/// <reference types="electron" />

interface IMenuItemOption extends Electron.MenuItemConstructorOptions {
    // 参见：https://www.electronjs.org/docs/api/menu-item
    _click_evt?: string
}

interface IPopupMenuOption {
    menu_id: string
    items: IMenuItemOption[]
}

interface IConfig {
    language: "zh" | "en" // i18n
    "common.theme": "light" | "dark" | "auto" // 主题
    "update.repo"?: string // 更新地址
    "update.owner"?: string // 更新通道
    "editor.bg": string // 更新通道
    "snippet.storagePath": string // 代码片段保存位置
    "bookmark.storagePath": string // 书签保存位置
    backup_rule: string // 备份规则
    storagePath: string // 存储地址
}

type TAgent<T = (event: Electron.IpcRendererEvent, ...args: any[]) => void> = {
    info: {
        version: string,
        chrome: string,
        node: string,
        electron: string,
    },
    getStaticHtml(type: any):string
    getStaticHtmlSource(type: any):string
    webviewPreloadPath: string;
    preloadPath: string;
    iframePath: string;
    extraPath: string;
    file: any,
    crash: () => void;
    call: (command: string, ...args: any[]) => Promise<any>;
    callLong: (command: string, ...args: any[]) => Promise<any>;
    callSync: (command: string, ...args: any[]) => any;
    send: (command: string, ...argu: any[]) => void;
    sendSync: (command: string, ...argu: any[]) => void;
    on: (command: string, cb: T) => () => Electron.IpcRenderer;
    once: (command: string, cb: T) => () => Electron.IpcRenderer;
    off: (command: string, cb: T) => Electron.IpcRenderer;
    offAll: (command: string) => Electron.IpcRenderer;
    popupMenu: (options: IPopupMenuOption) => void;
}

declare const _agent: TAgent

type WebviewTag = Electron.WebviewTag
