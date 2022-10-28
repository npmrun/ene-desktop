export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        var img = new Image()
        img.setAttribute("crossOrigin", "Anonymous")
        img.onload = function () {
            resolve(img)
        }
        img.onerror = function () {
            reject(img)
        }
        img.src = src
    })
}
export type ExtendHTMLCanvasElement = HTMLCanvasElement & {
    name?: string
    _url?: string
}
export async function drawCanvas(canvas: ExtendHTMLCanvasElement, image: string, isCircle: boolean) {
    const ctx = !!canvas.getContext && canvas.getContext("2d")
    if (ctx) {
        const img = await loadImage(image)
        const minValue = Math.min(img.width, img.height)
        const offsetX = minValue == img.height ? (img.width - img.height) / 2 : 0
        const offsetY = minValue == img.width ? (img.height - img.width) / 2 : 0
        canvas.width = canvas.dataset.width as unknown as number
        canvas.name = `icon-${canvas.dataset.width}x${canvas.dataset.height}`
        canvas._url = image
        canvas.height = canvas.dataset.height as unknown as number
        if (isCircle) {
            ctx.beginPath()
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2)
            ctx.clip()
        }
        ctx.drawImage(img, offsetX, offsetY, minValue, minValue, 0, 0, canvas.width, canvas.height)
    }
}

export async function clearCanvas(canvas: ExtendHTMLCanvasElement) {
    const ctx = !!canvas.getContext && canvas.getContext("2d")
    if (ctx) {
        delete canvas.name
        delete canvas._url
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
}

export function saveCanvas(canvas: ExtendHTMLCanvasElement) {
    if (!canvas._url) {
        return
    }
    var imgURL = canvas.toDataURL("image/png", 1)
    var dlLink = document.createElement("a")
    dlLink.download = canvas.name as string
    dlLink.href = imgURL
    document.body.appendChild(dlLink)
    dlLink.click()
    document.body.removeChild(dlLink)
}
