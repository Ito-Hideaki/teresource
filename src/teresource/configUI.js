class ConfigUIItemFactory {

    /** @param {string } name */
    static createNameElm(name) {
        const nameElm = document.createElement("div");
        nameElm.textContent = name;
        nameElm.classList.add("configui_item_name");
        return nameElm;
    }

    static createStringInputBox() {
        const elm = document.createElement("div");
        const box = document.createElement("input");
        box.type = "text";
        box.classList.add("configui_item_inputbox");
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
        elm.classList.add("configui_item");
        const Factory = ConfigUIItemFactory;
        elm.appendChild(Factory.createNameElm(config.name));
        elm.appendChild(Factory.createStringInputBox());
        return { element: elm };
    }
}

class ConfigUIDataHandler {
    #elm;
    #configItemConfigList;
    /** @param {HTMLElement} element @param {ConfigItemConfig[]} configItemConfigList */
    constructor(element, configItemConfigList) {
        this.#elm = element;
        this.#configItemConfigList = configItemConfigList;
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
    const configUIDataHandler = new ConfigUIDataHandler(element, configItemConfigList);
    return { element, configUIDataHandler };
}