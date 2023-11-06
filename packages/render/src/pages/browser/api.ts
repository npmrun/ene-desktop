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
    const data = await _agent.call("db.getData", "collect")
    if (data) {
        return data.items
    }
    return []
}

export async function saveData(data: any) {
    await _agent.call("db.saveData", "collect", data)
}