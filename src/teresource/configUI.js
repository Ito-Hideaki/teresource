function createConfigUIItem() {
    const elm = document.createElement("div");
    elm.innerHTML = "This is config";
    return { element: elm };
}

class ConfigUIDataHandler {
    #elm;
    /** @param {HTMLElement} element */
    constructor(element) {
        this.#elm = element;
    }

    getPlaySceneConfig() {
        return { skin: "pika" };
    }
}

export function createConfigUIElement() {
    const element = document.createElement("div");
    const item = createConfigUIItem().element;
    element.appendChild(item);
    const configUIDataHandler = new ConfigUIDataHandler(element);
    return { element, configUIDataHandler };
}