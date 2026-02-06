/** @typedef {{ name: string, value: string }} ConfigChoice */
/** @typedef {{ name: string, displayText: string, type: string, choiceList: undefined | ConfigChoice[] }} ConfigItemConfig */
/** @typedef {Object.<string, any>} ConfigUIExportMap value is string or another ConfigUIExportMap*/

/** @type {Object.<string, ConfigItemConfig[]>} */
export const CONFIGUI_CONFIG_DATA = {
    gamePersonalization: [
        { name: "skin", type: "select", displayText: "ゲームスキン", choiceList: [
            { name: "pika", value: "pika" },
            { name: "nine", value: "nine" },
            { name: "nine-s", value: "nine-s" },
            { name: "tikin", value: "tikin" }
        ] }
    ],
    handling: [
        { name: "DAS", type: "number", displayText: "DAS, 連射が発動するまでの時間" },
        { name: "ARR", type: "number", displayText: "ARR, 連射間隔"  },
    ],
    objective: [
        { name: "type", type: "select", displayText: "目標の種類", choiceList: [
            { name: "なし", value: "None" },
            { name: "Line", value: "Line" },
            { name: "Timed", value: "Timed" }
        ]},
        { name: "targetLines", type: "number", displayText: "(Line)目標ライン数" },
        { name: "timeLimit", type: "number", displayText: "(Timed)制限時間" }
    ]
}

/** @type {Object.<string, ConfigUIExportMap>} */
export const CONFIGUI_EXPORT_MAP_INDEX = {
    gamePersonalization : {
        "skin": "skin"
    },
    handling : {
        "DAS" : "DAS",
        "ARR" : "ARR",
    },
    objective : {
        session: {
            "type" : "type",
            "targetLines" : "targetLines",
            "timeLimit" : "timeLimit"
        }
    }
}

export const CONFIG_DATA_TYPE = {
    STRING: "string",
    NUMBER: "number",
    SELECT: "select"
}