import { protocol, session } from "electron";


export function initCacheHttp() {
    protocol.interceptHttpProtocol(
        'https',
        (request, callback) => {
            console.log(request.url);
            
            if (request.url.endsWith('png')) {
                // blablabla...
            }
            callback({
                url: request.url,
                method: request.method,
                session: null,
            })

            // const url = `https://${request.url.substr(14)}`
            // const cachedPath = path.normalize(`${__dirname}/oval-cached.png`)
            // if (fs.existsSync(cachedPath)) {
            //     callback({ path: cachedPath })
            //     return
            // }
            // fetch(url).then(res => {
            //     const dest = fs.createWriteStream(cachedPath)
            //     dest.on('finish', () => {
            //         callback({ path: cachedPath })
            //     })
            //     res.body.pipe(dest)
            // })
        }
    )
}