/** @typedef {{ name: string, displayText: string, type: string }} ConfigItemConfig */
/** @typedef {Object.<string, any>} ConfigUIExportMap value is string or another ConfigUIExportMap*/

/** @type {Object.<string, ConfigItemConfig[]>} */
export const CONFIGUI_CONFIG_DATA = {
    gamePersonalization: [
        { name: "skin", type: "string", displayText: "skin (次のうちどれか: pika, nine, nine-s, tikin)" }
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
}