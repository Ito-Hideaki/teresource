/** @typedef {{ name: string, displayText: string }} ConfigItemConfig */
/** @typedef {Object.<string, any>} ConfigUIExportMap value is string or another ConfigUIExportMap*/

/** @type {Object.<string, ConfigItemConfig[]>} */
export const CONFIGUI_CONFIG_DATA = {
    gamePersonalization: [
        { name: "skin", displayText: "skin (次のうちどれか: pika, nine, nine-s, tikin)" }
    ]
}

/** @type {Object.<string, ConfigUIExportMap>} */
export const CONFIGUI_EXPORT_MAP = {
    gamePersonalization : {
        "gameSkin": "skin"
    }
}

export const CONFIG_DATA_TYPE = {
    STRING: "string",
}