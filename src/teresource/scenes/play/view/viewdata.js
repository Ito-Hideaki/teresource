//@ts-check

/**
 * @typedef {{
 * cellWidth: number
 * }} CellSkinData
 *  */

/** @type {Object<string, CellSkinData>} */
const CELL_SKIN_DATA_INDEX_fromImg = {
    "tikin": {
        cellWidth: 30
    }
}
/** @type {Object<string, CellSkinData>} */
const CELL_SKIN_DATA_INDEX_fromSheet = {
    "nine": {
        cellWidth: 30
    }
}
/** @type {Object<string, CellSkinData>} */
const CELL_SKIN_DATA_INDEX_target = {};
Object.assign(CELL_SKIN_DATA_INDEX_target, CELL_SKIN_DATA_INDEX_fromImg);
Object.assign(CELL_SKIN_DATA_INDEX_target, CELL_SKIN_DATA_INDEX_fromSheet);
export const CELL_SKIN_DATA_INDEX = CELL_SKIN_DATA_INDEX_target;

export const cellImgSkins_fromImgs = Object.keys(CELL_SKIN_DATA_INDEX_fromImg);
export const cellImgSkins_fromSheet = Object.keys(CELL_SKIN_DATA_INDEX_fromSheet);
export const cellImgSkins = [
    ...cellImgSkins_fromImgs,
    ...cellImgSkins_fromSheet,
]
export const cellGraphicSkins = [
    "rect",
]