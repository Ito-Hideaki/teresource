/**
 *  @param {{
 *     name: string
 * }} config
 * */
function createConfigUIItem(config) {
    const elm = document.createElement("div");
    {
        const nameElm = document.createElement("div");
        nameElm.textContent = config.name;
        elm.appendChild(nameElm);
    }
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
    const item = createConfigUIItem({ name: "skin" }).element;
    element.appendChild(item);
    const configUIDataHandler = new ConfigUIDataHandler(element);
    return { element, configUIDataHandler };
}