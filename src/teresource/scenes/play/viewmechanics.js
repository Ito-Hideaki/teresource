import { Cell } from "./mechanics";

export const cellColorStr = [
    "red",
    "orange",
    "yellow",
    "green",
    "sky",
    "blue",
    "purple",
    "grey",
    "black"
]

export const cellImgSkins_fromSheet = [
    "nine",
];

export const cellImgSkins_fromImgs = [
    "default",
    "tikin",
]

export const cellImgSkins = [
    ...cellImgSkins_fromImgs,
    ...cellImgSkins_fromSheet,
]

export const cellGraphicSkins = [
    "rect",
]

export const visibleGobis = [
    "n",
    "a"
]

/**

 * @typedef {{
    skin: string,
    color: string,
    gobi: string,
}} CellViewParams all of params which decide cell image
 * */



/** @param {Cell} cell @param {string} skin @return {CellViewParams} */
export function createCellViewParamsFromCell(cell, skin = "skin") {
    const $ = {};
    $.skin = skin;
    $.color = cellColorStr[cell.color];
    $.gobi = createStatusGobi(cell);
    return $;
}

/** Gobi is an alphabet of the combined cell status, e.g. isActive. Does not include wholy invisible states. @param {Cell} cell @return {string} an alphabet */
function createStatusGobi(cell) {
    let statusGobi = "n";
    if (cell.isActive) statusGobi = "a";
    return statusGobi;
}

/**
 * @param {CellViewParams} p
 * */
export function generateCellTextureKey(p) {
    return `cell_${p.skin}_${p.color}_${p.gobi}`;
}

/**
 * @param {CellViewParams} p
 * */
export function generateCellTextureUrl(p) {
    return `/image/cell/${p.skin}/${p.color}_${p.gobi}.png`;
}

/** @param {string} skin */
export function generateCellSheetTextureUrl(skin) {
    return `/image/cellsheet/${skin}.png`;
}

/** All possible CellViewParams of a skin.
 * @param {string} skin
 * @return {CellViewParams[]} */
export function calcSkinCellViewParams(skin) {
    const arr = [];
    for (let i = 0; i < cellColorStr.length; i++) {
        const color = cellColorStr[i];
        visibleGobis.forEach(gobi => {
            /** @type {CellViewParams} */
            const params = { skin, color, gobi };
            arr.push(params);
        });
    }
    return arr;
}


/** @param {CellViewParams} cellViewParams @return {string} */
export function generateCellSheetTextureFrameKey(cellViewParams) {
    cellViewParams.skin = "skin";
    return generateCellTextureKey(cellViewParams);
}

/** @param {string} skin @return {string}*/
export function generateCellSheetTextureKey(skin) {
    return `cellsheet_${skin}`;
}