import { CONFIGUI_CONFIG_DATA, CONFIGUI_EXPORT_MAP, CONFIG_DATA_TYPE } from "./configUIData";

class ItemDataHandler {
    /** @param {HTMLElement} element item element that must contain needed things @param {string} type data type */
    constructor(element, type) {
        this.element = element;
        this.type = type;
        this.getValue();
    }

    getValue() {
        switch(this.type) {
            case CONFIG_DATA_TYPE.STRING:
                const inputElement = this.element.getElementsByTagName("input")[0];
                if(!inputElement) throw "invalid item element";
                switch(this.type) {
                    case CONFIG_DATA_TYPE.STRING:
                        return inputElement.value;
                }
        }
        throw "couldn't get data";
    }

    setValue(value) {
        switch(this.type) {
            case CONFIG_DATA_TYPE.STRING:
                const inputElement = this.element.getElementsByTagName("input")[0];
                if(!inputElement) throw "invalid item element";
                switch(this.type) {
                    case CONFIG_DATA_TYPE.STRING:
                        inputElement.value = value;
                }
        }
    }
}

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
        box.value = "pika";
        box.classList.add("configui_item_inputbox");
        elm.appendChild(box);
        return elm;
    }

    /**
     *  @param {import("./configUIData").ConfigItemConfig} config
     *  @param {any} initialValue
     * */
    static create(config, initialValue) {
        const elm = document.createElement("div");
        elm.classList.add("configui_item");
        const Factory = ItemElementFactory;
        elm.appendChild(Factory.createNameElm(config.displayText));
        elm.appendChild(Factory.createStringInputBox());
        const itemDataHandler = new ItemDataHandler(elm, CONFIG_DATA_TYPE.STRING);
        itemDataHandler.setValue(initialValue);
        return { element: elm, itemDataHandler };
    }
}

export class ConfigUIDataHandler {
    #boardElement;
    /** @type {Object.<string, import("./configUIData").ConfigItemConfig>} */ #configMap;
    #exportMap;
    /** @type {Object.<string, ItemDataHandler>} */ #itemDataHandlerMap;

    /**
     *  @param {HTMLElement} element
     *  @param {import("./configUIData").ConfigItemConfig[]} configItemConfigList
     *  @param {ItemDataHandler[]} itemDataHandlerList
     *  @param {import("./configUIData").ConfigUIExportMap} configUIExportMap
     * */
    constructor(element, configItemConfigList, itemDataHandlerList, configUIExportMap) {
        this.#boardElement = element;

        this.#itemDataHandlerMap = {};
        this.#configMap = {};
        configItemConfigList.forEach((configItemConfig, i) => {
            this.#configMap[configItemConfig.name] = configItemConfig;
            this.#itemDataHandlerMap[configItemConfig.name] = itemDataHandlerList[i];
        })
        this.#exportMap = configUIExportMap;
    }

    /** @param {import("./configUIData").ConfigUIExportMap} exportMap */
    #getConfigForExportMap(exportMap) {
        const exportObj = {};
        for (const key in exportMap) {
            const value = exportMap[key];
            if (typeof value === "string") {
                const itemDataHandler = this.#itemDataHandlerMap[value];
                exportObj[key] = itemDataHandler.getValue();
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

export function createConfigUIBoard() {

    const boardElement = document.createElement("div");

    /** @type {Object.<string, Object.<string, any>>} */
    const initialConfigStateMap = {
        gamePersonalization: {
            "skin" : "nine",
        }
    }

    /** @type {Object.<string, ConfigUIDataHandler>} */ const configUIDataHandlerMap = {};

    for (let key in CONFIGUI_CONFIG_DATA) {
        const configList = CONFIGUI_CONFIG_DATA[key];
        const itemDataHandlerList = [];
        const initialConfigState = initialConfigStateMap[key];
        configList.forEach(configItemConfig => {
            const { element, itemDataHandler } = ItemElementFactory.create(configItemConfig, initialConfigState[configItemConfig.name]);
            boardElement.appendChild(element);
            itemDataHandlerList.push(itemDataHandler);
        });
        const configUIDataHandler = new ConfigUIDataHandler(boardElement, configList, itemDataHandlerList, CONFIGUI_EXPORT_MAP[key]);
        configUIDataHandlerMap[key] = configUIDataHandler;
    }

    return { element: boardElement, configUIDataHandlerMap };
}