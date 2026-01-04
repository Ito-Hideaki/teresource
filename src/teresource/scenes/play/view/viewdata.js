//@ts-check

/**
 * @typedef {{
 * cellWidth: number
 * }} CellSkinData
 *  */

/** @type {Object<string, CellSkinData>} */
const IMG_SKIN_DATA_INDEX_fromImg = {
    "tikin": {
        cellWidth: 30
    }
}
/** @type {Object<string, CellSkinData>} */
const IMG_SKIN_DATA_INDEX_fromSheet = {
    "nine": {
        cellWidth: 30
    },
    "nine-s": {
        cellWidth: 3
    }
}
/** @type {Object<string, CellSkinData>} */
const IMG_SKIN_DATA_INDEX_target = {};
Object.assign(IMG_SKIN_DATA_INDEX_target, IMG_SKIN_DATA_INDEX_fromImg);
Object.assign(IMG_SKIN_DATA_INDEX_target, IMG_SKIN_DATA_INDEX_fromSheet);
export const IMG_SKIN_DATA_INDEX = IMG_SKIN_DATA_INDEX_target;

export const cellImgSkins_fromImgs = Object.keys(IMG_SKIN_DATA_INDEX_fromImg);
export const cellImgSkins_fromSheet = Object.keys(IMG_SKIN_DATA_INDEX_fromSheet);
export const cellImgSkins = [
    ...cellImgSkins_fromImgs,
    ...cellImgSkins_fromSheet,
]
export const cellGraphicSkins = [
    "rect",
]