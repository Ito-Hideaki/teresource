/** @typedef {{ displayText: string, value: string }} ConfigChoice */
/** @typedef {{ name: string, displayText: string, type: string, choiceList: undefined | ConfigChoice[] }} ConfigItemConfig */
/** @typedef {Object.<string, any>} ConfigUIExportMap value is string or another ConfigUIExportMap*/

/** @type {Object.<string, ConfigItemConfig[]>} */
export const CONFIGUI_CONFIG_DATA = {
    gamePersonalization: [
        { name: "skin", type: "select", displayText: "skin (次のうちどれか: pika, nine, nine-s, tikin)", choiceList: [
            { displayText: "pika", value: "pika" },
            { displayText: "nine", value: "nine" },
            { displayText: "nine-s", value: "nine-s" },
            { displayText: "tikin", value: "tikin" }
        ] }
    ],
    handling: [
        { name: "DAS", type: "number", displayText: "DAS, 連射が発動するまでの時間" },
        { name: "ARR", type: "number", displayText: "ARR, 連射間隔"  },
    ]
}

/** @type {Object.<string, ConfigUIExportMap>} */
export const CONFIGUI_EXPORT_MAP = {
    gamePersonalization : {
        "gameSkin": "skin"
    },
    handling : {
        "DAS" : "DAS",
        "ARR" : "ARR",
    }
}

export const CONFIG_DATA_TYPE = {
    STRING: "string",
    NUMBER: "number",
    SELECT: "select" 
}