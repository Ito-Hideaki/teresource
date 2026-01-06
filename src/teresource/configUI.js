class ConfigUIItemFactory {

    /** @param {string } name */
    static createNameElm(name) {
        const nameElm = document.createElement("div");
        nameElm.textContent = name;
        return nameElm;
    }

    /**
     *  @param {{
     *     name: string
     * }} config
     * */
    static create(config) {
        const elm = document.createElement("div");
        const Factory = ConfigUIItemFactory;
        elm.appendChild(Factory.createNameElm(config.name));
        return { element: elm };
    }
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
    const item = ConfigUIItemFactory.create({ name: "skin" }).element;
    element.appendChild(item);
    const configUIDataHandler = new ConfigUIDataHandler(element);
    return { element, configUIDataHandler };
}