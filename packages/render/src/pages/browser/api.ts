/**
{
    items: [
        {
            name: "",
            url: "",
            checkIsAlive: false
        }
    ]
}
 */

export async function getData() {
    const data = await _agent.call("getDB", "collect")
    if (data) {
        return data.items
    }
    return []
}

export async function saveData(data: any) {
    await _agent.call("saveDB", "collect", data)
}