class ItemElementFactory {

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
        const Factory = ItemElementFactory;
        elm.appendChild(Factory.createNameElm(config.name));
        elm.appendChild(Factory.createStringInputBox());
        return { element: elm };
    }
}

export class ConfigUIDataHandler {
    #boardElement;
    /** @type {Object.<string, import("./configUIData").ConfigItemConfig>} */ #configMap;
    #exportMap;

    /** @param {HTMLElement} element @param {import("./configUIData").ConfigItemConfig>[]} configItemConfigList @param {import("./configUIData").ConfigUIExportMap} configUIExportMap*/
    constructor(element, configItemConfigList, configUIExportMap) {
        this.#boardElement = element;
        this.#configMap = {};
        configItemConfigList.forEach(configItemConfig => {
            this.#configMap[configItemConfig.name] = configItemConfig;
        })
        this.#exportMap = configUIExportMap;
    }

    /** @param {import("./configUIData").ConfigUIExportMap} exportMap */
    #getConfigForExportMap(exportMap) {
        const exportObj = {};
        for (const key in exportMap) {
            const value = exportMap[key];
            if (typeof value === "string") {
                const configItemConfig = this.#configMap[value];
                exportObj[key] = "pika";
            } else {
                exportObj[key] = this.#getConfigForExportMap(value);
            }
        }
        return exportObj;
    }

    getConfig() {
        const config = this.#getConfigForExportMap(this.#exportMap);
        console.log(config);
        return config;
    }
}

import { CONFIGUI_CONFIG_DATA, CONFIGUI_EXPORT_MAP } from "./configUIData";

export function createConfigUIBoard() {

    const boardElement = document.createElement("div");

    /** @type {Object.<string, ConfigUIDataHandler>} */ const configUIDataHandlerMap = {};

    for (let key in CONFIGUI_CONFIG_DATA) {
        const configList = CONFIGUI_CONFIG_DATA[key];
        configList.forEach(configItemConfig => {
            const itemElement = ItemElementFactory.create(configItemConfig).element;
            boardElement.appendChild(itemElement);
        });
        const configUIDataHandler = new ConfigUIDataHandler(boardElement, configList, CONFIGUI_EXPORT_MAP[key]);
        configUIDataHandlerMap[key] = configUIDataHandler;
    }

    return { element: boardElement, configUIDataHandlerMap };
}