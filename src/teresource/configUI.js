class ConfigUIItemFactory {

    /** @param {string } name */
    static createNameElm(name) {
        const nameElm = document.createElement("div");
        nameElm.textContent = name;
        return nameElm;
    }

    static createStringInputBox() {
        const elm = document.createElement("div");
        const box = document.createElement("input");
        box.type = "text";
        elm.appendChild(box);
        return elm;
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
        elm.appendChild(Factory.createStringInputBox());
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
    /** @typedef {{ name: string }} ConfigItemConfig */
    /** @type {ConfigItemConfig[]} */
    const configItemConfigList = [
        { name: "skin"}
    ];

    const element = document.createElement("div");
    configItemConfigList.forEach(configItemConfig => {
        const item = ConfigUIItemFactory.create(configItemConfig).element;
        element.appendChild(item);
    });
    const configUIDataHandler = new ConfigUIDataHandler(element);
    return { element, configUIDataHandler };
}