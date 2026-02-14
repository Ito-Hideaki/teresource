import { cellColorStr } from "../core/coredata";
import { Cell } from "../core/mechanics";

export const GOBI = {
    invisible: "u",
    normal:    "n",
    active:    "a",
}
export const visibleGobis = [
    GOBI.normal,
    GOBI.active
]

/**

 * @typedef {{
    skin: string,
    color: string,
    gobi: string,
    rotation: number
}} CellViewParams all of params which decide cell image
 * */

/** Gobi is a string of the combined cell status, e.g. isActive. Does not include wholy invisible states. @param {Cell} cell @return {string} gobi  */
function createStatusGobi(cell) {
    if (!cell.isBlock) return GOBI.invisible;
    if (cell.isActive) return GOBI.active;
    return GOBI.normal;
}

/** @param {Cell} cell @param {string} skin @return {CellViewParams} */
export function createCellViewParamsFromCell(cell, skin = "skin") {
    return {
        skin,
        color: cell.color,
        rotation: cell.rotation,
        gobi: createStatusGobi(cell)
    }
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