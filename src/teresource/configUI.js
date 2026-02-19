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
            return Number(input.value);
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

    static createKeyListBox() {
        const box = document.createElement("div");

        const clearButton = document.createElement("button");
        clearButton.classList.add("configui_item_keyclear");
        clearButton.textContent = "Clear";
        box.appendChild(clearButton);

        const keyDisplay = document.createElement("div");
        keyDisplay.classList.add("configui_item_keydisplay");
        keyDisplay.tabIndex = 0; //make able to be focused
        box.appendChild(keyDisplay);

        const splitter = ",";

        clearButton.addEventListener("click", () => {
            setter([]);
            keyDisplay.focus();
        });

        const getter = () => {
            if(keyDisplay.textContent === "") return [];
            return keyDisplay.textContent.split(splitter);
        }

        const setter = /** @param {string[]} value */ value => {
            if(value.length) {
                keyDisplay.textContent = value.join(splitter);
                keyDisplay.classList.remove("configui_novalue");
            } else {
                keyDisplay.textContent = "";
                keyDisplay.classList.add("configui_novalue");

            }
        }

        box.addEventListener("keydown", e => {
            e.preventDefault();
            const value = getter();
            if(!value.includes(e.code)) setter([...value, e.code]);
        });

        return { box, getter, setter };
    }

    static createPrefixBox(str) {
        const box = document.createElement("div");
        box.innerHTML = str;
        box.classList.add("configui_item_prefix");
        return box;
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
            case CONFIG_DATA_TYPE.KEYLIST:
                result = Factory.createKeyListBox();
                break;
        }
        elm.appendChild(result.box);
        if(config.prefix) {
            elm.appendChild(Factory.createPrefixBox(config.prefix));
        }

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
        game: {
            "boardWidth": 10,
            "boardHeight": 20,
            "garbageType" : "nice",
            "gravityPowerBase" : 1.3,
            "startLevel" : 5
        },
        autoDamage: {
            "attackPerMino": 0,
            "attackDamage": 1
        },
        personalization: {
            "skin": "pika",
        },
        handling: {
            "DAS": 10,
            "ARR": 2,
        },
        objective: {
            "type":"None",
            "targetLines":40,
            "timeLimit": 180,
        },
        keyBinding: {
            moveLeft: [ "ArrowLeft" ],
            moveRight: [ "ArrowRight" ],
            softDrop: [ "ArrowDown" ],
            rotateClockWise: [ "KeyX" ],
            rotateCounterClock: [ "KeyZ" ],
            hold: [ "KeyC", "ShiftLeft" ],
            hardDrop: [ "Space" ],
            reload: [ "KeyR" ]
        }
    }

    /** @type {Object.<string, string>} */
    const configUIHeadingDisplayText = {
        game: "ゲームシステム",
        autoDamage: "自動お邪魔",
        personalization: "お好み",
        handling: "ハンドリング",
        objective: "ゲーム目標",
        keyBinding: "キーボード操作"
    }

    //create boxes
    const configUIElement = document.createElement("div");
    configUIElement.classList.add("configui");

    const categoryBox = document.createElement("div");
    categoryBox.classList.add("configui_category");
    configUIElement.appendChild(categoryBox);

    const boardBox = document.createElement("div");
    boardBox.classList.add("configui_boardbox");
    configUIElement.appendChild(boardBox);

    /** @type {Object.<string, ConfigUIDataHandler>} */ const configUIDataHandlerMap = {};

    //create config elements
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

    //add config display selection system
    const selectCategory = (index) => {
        const classStr = "configui_selected";
        for(let i = 0; i < categoryBox.children.length; i++) {
            const headingElement = categoryBox.children[i];
            const boardElement = boardBox.children[i];
            if(i === index) {
                headingElement.classList.add(classStr);
                boardElement.classList.add(classStr);
            } else {
                headingElement.classList.remove(classStr);
                boardElement.classList.remove(classStr);
            }
        }
    }

    const selectDefault = () => {
        const classStr = "configui_selected";
        for(let i = 0; i < categoryBox.children.length; i++) {
            const headingElement = categoryBox.children[i];
            const boardElement = boardBox.children[i];
            headingElement.classList.remove(classStr);
            boardElement.classList.add(classStr);
        }
    }

    for(let i = 0; i < categoryBox.children.length; i++) {
        const headingElement = categoryBox.children[i];
        headingElement.addEventListener("click", () => {
            if(categoryBox.children[i].classList.contains("configui_selected")) {
                selectDefault();
            } else {
                selectCategory(i);
            }
        });
    }

    selectDefault();

    return { element: configUIElement, configUIDataHandlerMap };
}