import { ConfigEnv, defineConfig, loadEnv, UserConfigExport } from "vite"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import Components from "unplugin-vue-components/vite"
import { NaiveUiResolver } from "unplugin-vue-components/resolvers"
import AutoImport from "unplugin-auto-import/vite"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"
import vueI18n from "@intlify/unplugin-vue-i18n/vite"
import { createHtmlPlugin } from "vite-plugin-html"
import Pages from "vite-plugin-pages"
import Layouts from "vite-plugin-vue-layouts"
import Inspector from "vite-plugin-vue-inspector"
import ViteRestart from "vite-plugin-restart"
import WindiCSS from "vite-plugin-windicss"
import monacoEditorPlugin from "vite-plugin-monaco-editor"
import Icons from "unplugin-icons/vite"

import PrincessResolver from "princess-ui/PrincessResolver"
// @ts-ignore
import setting from "../setting" //https://github.com/vitejs/vite/issues/5370

import _ from "lodash-es"
import path from "path"

// https://vitejs.dev/config/
export default ({ command, mode }: ConfigEnv): UserConfigExport => {
    const env = <ImportMetaEnv>loadEnv(mode, __dirname)
    let isProd = mode === "production"
    let isDev = mode === "development"
    return defineConfig({
        root: __dirname,
        base: "./",
        server: {
            port: <number>(process.env.PORT ?? 3000),
        },
        resolve: {
            alias: {
                "@": path.join(__dirname, "src"),
                "@common": path.join(__dirname, "../common"),
                $Event: path.join(__dirname, "src/event"),
            },
        },
        css: {
            preprocessorOptions: {
                less: {
                    additionalData: `@import (reference) "@/assets/style/global.less";`,
                    javascriptEnabled: true,
                },
                scss: {
                    additionalData: ` @import "@/assets/style/_global.scss"; `,
                },
            },
        },
        build: {
            outDir: path.resolve(__dirname, "../../dist/electron"),
            sourcemap: false, // 为true时会导致v8内存溢出
            chunkSizeWarningLimit: 1024,
            minify: "terser",
            terserOptions: {
                compress: {
                    drop_console: isProd,
                    drop_debugger: isProd,
                },
            },
        },
        plugins: [
            Icons({
                compiler: "vue3",
            }),
            isDev &&
                ViteRestart({
                    reload: ["../common/languages/**/*.json", "vite.config.[jt]s", "windi.config.[jt]s"],
                }),
            monacoEditorPlugin({
                publicPath: "monacoeditorwork",
                customDistPath() {
                    return path.resolve(__dirname, "../../dist/electron/monacoeditorwork")
                },
            }),
            vue({
                template: {
                    compilerOptions: {
                        isCustomElement: tag => ["webview"].includes(tag),
                    },
                },
            }),
            vueJsx(),
            // Inspector(),
            WindiCSS({
                scan: {
                    dirs: ["."],
                    fileExtensions: ["vue", "js", "jsx", "ts", "tsx"],
                },
            }),
            vueI18n({
                compositionOnly: false,
                include: path.resolve(__dirname, "../common/languages/**"),
            }),
            Pages({
                dirs: [{ dir: path.resolve(__dirname, "src/pages"), baseRoute: "" }],
                exclude: ["**/_components/*.vue", "**/_ui/*.vue", "**/*copy.vue"],
                onRoutesGenerated(routes) {
                    routes.push({
                        path: "",
                        redirect: "/bookmark",
                    })
                    return routes
                },
            }),
            Layouts({
                layoutsDirs: path.resolve(__dirname, "src/layouts"),
                defaultLayout: "base",
            }),
            Components({
                dirs: [path.resolve(__dirname, "src/componentsAuto"), path.resolve(__dirname, "src/pagesUIAuto")],
                extensions: ["vue"],
                dts: "components.d.ts",
                resolvers: [NaiveUiResolver(), PrincessResolver()],
            }),
            AutoImport({
                include: [/\.[tj]sx?$/, /\.vue\??/],
                exclude: [/^_/],
                imports: ["vue", "vue-router", "pinia", "@vueuse/core", "vue-i18n"],
                dts: "auto-import.d.ts",
                dirs: ["src/hooksAuto"],
            }),
            createSvgIconsPlugin({
                // 指定需要缓存的图标文件夹
                iconDirs: [path.resolve(__dirname, "src/assets/icons")],
                // 指定symbolId格式
                symbolId: "icon-[dir]-[name]",
            }),
            createHtmlPlugin({
                minify: isProd,
                pages: [
                    {
                        entry: "src/main.ts",
                        filename: "index.html",
                        template: "index.html",
                        injectOptions: {
                            data: {
                                title: setting.app_title,
                                scheme_file: setting.app_scheme + "-file",
                            },
                        },
                    },
                    {
                        filename: "about.html",
                        template: "about.html",
                        injectOptions: {
                            data: {
                                title: setting.app_title,
                                scheme_file: setting.app_scheme + "-file",
                            },
                        },
                    },
                    {
                        filename: "iframe.html",
                        template: "iframe.html",
                        injectOptions: {
                            data: {
                                title: setting.app_title,
                                scheme_file: setting.app_scheme + "-file",
                            },
                        },
                    },
                ],
            }),
        ],
    })
}
