import * as builder from "electron-builder"
import setting from "@rush/share/setting"
import { rootPath } from "@rush/share"
import path from "path"
import fs from "fs-extra"
import { homedir } from "os"
import { execSync } from "child_process"

const electronLanguages = ["en", "fr", "zh_CN", "de"]

const TARGET_PLATFORMS_configs = {
    mac: {
        mac: ["default"],
    },
    macs: {
        mac: ["dmg:x64", "dmg:arm64"],
    },
    win: {
        win: ["nsis:ia32", "nsis:x64", "portable:ia32"],
    },
    linux: {
        linux: ["AppImage:x64"],
    },
    all: {
        mac: ["dmg:x64", "dmg:arm64", "dmg:universal"],
        linux: ["AppImage:x64", "deb:x64"],
        win: ["nsis:ia32", "nsis:x64", "portable:ia32"],
    },
}
let targets: Record<string, string[]> = TARGET_PLATFORMS_configs.win
if (process.platform == "linux") {
    targets = TARGET_PLATFORMS_configs.linux
}
if (process.platform == "darwin") {
    targets = TARGET_PLATFORMS_configs.mac
}
if (process.env.MAKE_FOR === "dev") {
    targets = TARGET_PLATFORMS_configs.macs
} else if (process.env.MAKE_FOR === "mac") {
    targets = TARGET_PLATFORMS_configs.mac
} else if (process.env.MAKE_FOR === "win") {
    targets = TARGET_PLATFORMS_configs.win
} else if (process.env.MAKE_FOR === "all") {
    targets = TARGET_PLATFORMS_configs.all
}

console.log(`开始安装依赖`);

execSync("npm i", {
    cwd: "../dist",
    stdio: 'inherit'
});

console.log(`安装依赖END`);

builder.build({
    ...targets,
    config: {
        releaseInfo: {
            releaseNotesFile: `../changelog/${setting.app_version}.md`
        },
        npmRebuild: true, // 是否在打包应用程序之前rebuild本地依赖
        nodeGypRebuild: false, // 是否在开始打包应用程序之前执行,用electron-builder node-gyp-rebuild 来代替
        buildDependenciesFromSource: true, // 是否从源构建应用程序本机依赖项。
        productName: setting.app_title,
        appId: "com.dash." + setting.app_title,
        copyright: `Copyright © ${new Date().getFullYear()} Dash.All Rights Reserved.`,
        // asarUnpack: ["**/node_modules/live-server/**/*"],
        asarUnpack: ["**/*.node"],
        directories: {
            buildResources: "../build-assets",
            output: "../out",
            app: "../dist",
        },
        extraFiles: [
            {
                "from": "../build-assets",
                "to": ""
            },
        ],
        electronDownload: {
            cache: path.join(homedir(), ".electron"),
            mirror: "https://npm.taobao.org/mirrors/electron/",
        },
        publish: [
            {
                provider: 'github',
                repo: 'electron-template',
                owner: 'npmrun'
            }
        ],
        // mac: {
        //     type: "distribution",
        //     category: "public.app-category.productivity",
        //     icon: "assets/app.icns",
        //     gatekeeperAssess: false,
        //     electronLanguages,
        //     identity: IDENTITY,
        //     hardenedRuntime: true,
        //     entitlements: "scripts/entitlements.mac.plist",
        //     entitlementsInherit: "scripts/entitlements.mac.plist",
        //     provisioningProfile: "scripts/app.provisionprofile",
        //     extendInfo: {
        //         ITSAppUsesNonExemptEncryption: false,
        //         CFBundleLocalizations: electronLanguages,
        //         CFBundleDevelopmentRegion: "en",
        //     },
        // },
        nsis: {
            oneClick: false,
            allowElevation: true,
            createDesktopShortcut: true,
            createStartMenuShortcut: true,
            allowToChangeInstallationDirectory: true,
            perMachine: true,
            artifactName: "${productName}_installer_${arch}_${version}.${ext}",
        },
        portable: {
            artifactName: "${productName}_portable_${arch}_${version}.${ext}",
        },
        dmg: {
            contents: [
                {
                    x: 410,
                    y: 150,
                    type: "link",
                    path: "/Applications",
                },
                {
                    x: 130,
                    y: 150,
                    type: "file",
                },
            ],
            sign: false,
            artifactName: "${productName}_mac_${arch}_${version}.${ext}",
        },
        extraResources: {
            from: "../extra",
            to: "",
        },
        mac: {
            icon: "../build-assets/icons/512x512.png",
        },
        win: {
            icon: "../build-assets/icons/1024x1024.png",
        },
        linux: {
            icon: "../build-assets/icons/1024x1024.png",
            artifactName: "${productName}_linux_${arch}_${version}.${ext}",
            category: "Utility",
            synopsis: "效率工具，懒人必备",
            desktop: {
                Name: setting.app_title,
                Icon: "com.dash." + setting.app_title,
                Type: "Application",
                GenericName: "效率工具，懒人必备",
            },
        },
        protocols: {
            name: setting.app_title,
            schemes: [setting.app_scheme]
        }
    },
})
