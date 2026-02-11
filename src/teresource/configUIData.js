/** @typedef {{ name: string, value: string }} ConfigChoice */
/** @typedef {{ name: string, displayText: string, type: string, choiceList: undefined | ConfigChoice[], prefix: string | undefined, }} ConfigItemConfig */
/** @typedef {Object.<string, any>} ConfigUIExportMap value is string or another ConfigUIExportMap*/

/** @type {Object.<string, ConfigItemConfig[]>} */
export const CONFIGUI_CONFIG_DATA = {
    game: [
        { name: "boardWidth", type: "number", displayText: "ボードの幅" },
        { name: "boardHeight", type: "number", displayText: "ボードの高さ" },
        { name: "garbageType", type: "select", displayText: "お邪魔の種類", choiceList: [
            {name : "Straight", value: "straight"},
            {name : "Nice", value: "nice"},
            {name : "Messy", value: "messy" }
        ]}
    ],
    autoDamage: [
        { name: "attackPerMino", type: "number", displayText: "ミノ当たりお邪魔回数", prefix: "times/piece" },
        { name: "attackDamage", type: "number", displayText: "一回あたりのお邪魔量", prefix: "lines" }
    ],
    objective: [
        { name: "type", type: "select", displayText: "目標の種類", choiceList: [
            { name: "なし", value: "None" },
            { name: "Line", value: "Line" },
            { name: "Timed", value: "Timed" }
        ]},
        { name: "targetLines", type: "number", displayText: "(Line)目標ライン数", prefix: "lines" },
        { name: "timeLimit", type: "number", displayText: "(Timed)制限時間", prefix: "sec" }
    ],
    personalization: [
        { name: "skin", type: "select", displayText: "ゲームスキン", choiceList: [
            { name: "pika", value: "pika" },
            { name: "nine", value: "nine" },
            { name: "nine-s", value: "nine-s" },
            { name: "tikin", value: "tikin" }
        ] }
    ],
    handling: [
        { name: "DAS", type: "number", displayText: "DAS, 連射が発動するまでの時間", prefix: "f" },
        { name: "ARR", type: "number", displayText: "ARR, 連射間隔", prefix: "f"  },
    ]
}

/** @type {Object.<string, ConfigUIExportMap>} */
export const CONFIGUI_EXPORT_MAP_INDEX = {
    personalization : {
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
    },
    game : {
        "boardWidth" : "boardWidth",
        "boardHeight" : "boardHeight",
        garbage: {
            "type" : "garbageType"
        }
    },
    autoDamage : {
        "attackPerMino" : "attackPerMino",
        "attackDamage" : "attackDamage"
    }
}

export const CONFIG_DATA_TYPE = {
    STRING: "string",
    NUMBER: "number",
    SELECT: "select"
}