import zhJSON from "@rush/common/languages/zh.json"
import enJSON from "@rush/common/languages/en.json"
import { Settings } from "@rush/main-config/config"

function Localiza(key: string) {
    const language = Settings.n.values("language")
    const temp = key.split(".")
    function readValue(curObj) {
        let index = 0
        while (index < temp.length) {
            curObj = curObj[temp[index]]
            index++
        }
        return curObj
    }
    let result
    switch (language) {
        case "en":
            result = readValue(enJSON)
            break
        case "zh":
        default:
            result = readValue(zhJSON) 
            break
    }
    return result
}

declare global {
    var localiza: typeof Localiza
}

global.localiza = Localiza