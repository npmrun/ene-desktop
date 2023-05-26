import * as fs from "fs-extra"
import * as path from "path"
var liveServer = require("live-server")

const exePath = process.cwd()
const appPath = path.resolve(exePath, "all-pid")
fs.ensureDir(appPath)
fs.createFileSync(path.resolve(appPath, String(process.pid)))
function exit() {
    let pidPath = path.resolve(appPath, String(process.pid))
    if (fs.existsSync(pidPath)) {
        fs.rmSync(pidPath)
    }
}
process.on("exit", exit)
process.on("SIGINT", exit)

let allargv = process.argv.slice(2)

if (allargv.length == 1 && fs.statSync(allargv[0]).isFile) {
    let f = allargv[0]
    var params = {
        port: 8181, // Set the server port. Defaults to 8080.
        host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
        root: path.parse(f).dir,
        file: path.parse(f).base, // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
        wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    }
    liveServer.start(params)
}

// var params = {
// 	port: 8181, // Set the server port. Defaults to 8080.
// 	host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
// 	root: "/public", // Set root directory that's being served. Defaults to cwd.
// 	open: false, // When false, it won't load your browser by default.
// 	ignore: 'scss,my/templates', // comma-separated string for paths to ignore
// 	file: "index.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
// 	wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
// 	mount: [['/components', './node_modules']], // Mount a directory to a route.
// 	logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
// 	middleware: [function(req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
// };
// liveServer.start(params);

// console.log(fs.readFileSync("/home/topuser/下载/最新激活码.txt", "utf-8"));
// console.log(liveServer);
