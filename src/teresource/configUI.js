class ConfigUIDataHandler {
    getPlaySceneConfig() {
        return { skin: "pika" };
    }
}

export function createConfigUIElement() {
    const configUIDataHandler = new ConfigUIDataHandler();
    const element = document.createElement("div");
    return { element, configUIDataHandler };
}