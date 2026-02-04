import { CONFIGUI_CONFIG_DATA, CONFIGUI_EXPORT_MAP_INDEX, CONFIG_DATA_TYPE } from "./configUIData";

class ItemDataHandler {
    /** @param {HTMLElement} element item element that must contain needed things @param {string} type data type @param {() => any} getter @param {(value: any) => void} setter*/
    constructor(element, type, getter, setter) {
        this.element = element;
        this.type = type;
        this.getValue = getter;
        this.setValue = setter;
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
        const box = document.createElement("div");
        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("configui_item_input");
        box.appendChild(input);
        const getter = () => {
            return input.value;
        }
        const setter = (value) => {
            input.value = value;
        }
        return { box, getter, setter };
    }

    static createNumberInputBox() {
        const box = document.createElement("div");
        const input = document.createElement("input");
        input.type = "number";
        input.classList.add("configui_item_input");
        box.appendChild(input);
        const getter = () => {
            return input.value;
        }
        const setter = (value) => {
            input.value = value;
        }
        return { box, getter, setter };
    }

    /** @param {import("./configUIData").ConfigChoice[]} choiceList */
    static createSelectBox(choiceList = []) {
        const box = document.createElement("div");
        box.classList.add("configui_item_selectbox");
        /** @type {HTMLElement[]} */ const itemList = [];
        const setter = (value) => {
            console.log(value);
            for (let i = 0; i < itemList.length; i++) {
                const choice = choiceList[i];
                const item = itemList[i];
                if (choice.value === value) {
                    item.classList.add("configui_selected");
                } else {
                    item.classList.remove("configui_selected");
                }
            }
        };
        const getter = () => {
            for (let i = 0; i < itemList.length; i++) {
                const choice = choiceList[i];
                const item = itemList[i];
                if (item.classList.contains("configui_selected")) return choice.value;
            }
            throw "no element has selected";
        };
        choiceList.forEach(choice => {
            const item = document.createElement("div");
            item.classList.add("configui_item_selectable")
            item.innerHTML = choice.name;
            item.onclick = () => {
                setter(choice.value);
            }
            box.appendChild(item);
            itemList.push(item);
        });
        return { box, getter, setter };
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
        let result;
        switch (config.type) {
            case CONFIG_DATA_TYPE.STRING:
                result = Factory.createNumberInputBox();
                break;
            case CONFIG_DATA_TYPE.NUMBER:
                result = Factory.createNumberInputBox();
                break;
            case CONFIG_DATA_TYPE.SELECT:
                result = Factory.createSelectBox(config.choiceList);
                break;
        }
        elm.appendChild(result.box);
        const itemDataHandler = new ItemDataHandler(elm, config.type, result.getter, result.setter);
        itemDataHandler.setValue(initialValue);
        return { element: elm, itemDataHandler };
    }
}

/** @param {string} text */
function createItemHeading(text) {
    const elm = document.createElement("div");
    elm.classList.add("configui_itemheading");
    elm.textContent = text;
    return elm;
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

/** @param {import("./configUIData").ConfigItemConfig[]} configList @param {Object.<string, any>} initialConfigValueList @param {import("./configUIData").ConfigUIExportMap} exportMap */
function createConfigUIBoard(configList, initialConfigValueList, exportMap) {
    const boardElement = document.createElement("div");
    boardElement.classList.add("configui_board");

    const itemDataHandlerList = [];

    //add items
    configList.forEach(configItemConfig => {
        const { element, itemDataHandler } = ItemElementFactory.create(configItemConfig, initialConfigValueList[configItemConfig.name]);
        boardElement.appendChild(element);
        itemDataHandlerList.push(itemDataHandler);
    });
    const configUIDataHandler = new ConfigUIDataHandler(boardElement, configList, itemDataHandlerList, exportMap);

    return { board: boardElement, configUIDataHandler };
}

export function createConfigUIElement() {

    /** @type {Object.<string, Object.<string, any>>} */
    const initialConfigStateMap = {
        gamePersonalization: {
            "skin": "pika",
        },
        handling: {
            "DAS": 10,
            "ARR": 2,
        }
    }

    /** @type {Object.<string, string>} */
    const configUIHeadingDisplayText = {
        gamePersonalization: "ゲームのみため",
        handling: "ハンドリング",
    }

    const configUIElement = document.createElement("div");

    const categoryBox = document.createElement("div");
    configUIElement.appendChild(categoryBox);

    const boardBox = document.createElement("div");
    configUIElement.appendChild(boardBox);

    /** @type {Object.<string, ConfigUIDataHandler>} */ const configUIDataHandlerMap = {};

    for (let key in CONFIGUI_CONFIG_DATA) {
        //add heading
        {
            const headingDisplayText = configUIHeadingDisplayText[key];
            categoryBox.appendChild(createItemHeading(headingDisplayText));
        }

        //create board
        const configList = CONFIGUI_CONFIG_DATA[key];
        const itemDataHandlerList = [];
        const initialConfigState = initialConfigStateMap[key];
        const { board, configUIDataHandler } = createConfigUIBoard(configList, initialConfigState, CONFIGUI_EXPORT_MAP_INDEX[key]);
        boardBox.appendChild(board);
        configUIDataHandlerMap[key] = configUIDataHandler;
    }

    return { element: configUIElement, configUIDataHandlerMap };
}