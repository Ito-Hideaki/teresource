import { cellColorStr, MAX_MINO_SIZE } from "../core/coredata";
import { Cell } from "../core/mechanics";

export const GOBI = {
    invisible: "u",
    normal: "n",
    active: "a",
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
    rotation: number,
    partRow?: number,
    partColumn?: number
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
        gobi: createStatusGobi(cell),
        partRow: cell.partRow,
        partColumn: cell.partColumn
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

/** @param {string} skin @param {boolean} extend @return {string}*/
export function generateCellSheetTextureKey(skin, extend = false) {
    if (extend) return `cellsheet_${skin}_extend`;
    return `cellsheet_${skin}`;
}

/** @param {string} skin @param {boolean} extend */
export function generateCellSheetTextureUrl(skin, extend = false) {
    if (extend) return `/image/cellsheet/${skin}_extend.png`;
    return `/image/cellsheet/${skin}.png`;
}

/** @param {CellViewParams} cellViewParams @param {boolean} extend @return {string} */
export function generateCellSheetTextureFrameKey(cellViewParams, extend = false) {
    cellViewParams.skin = "skin";
    let key = generateCellTextureKey(cellViewParams);
    if(extend) {
        key += "extend";
        key += `_rot${cellViewParams.rotation}`;
        if(typeof cellViewParams.partRow === "number") key += `_row${cellViewParams.partRow}`;
        if(typeof cellViewParams.partColumn === "number") key += `_col${cellViewParams.partColumn}`;
    }
    return key;
}


/** CellViewParams of a skin for every combination of color and gobi.
 * @param {string} skin
 * @param {Cell} extendCell cell that may contains extend data
 * @return {CellViewParams[]} */
export function calcSkinCellViewParams(skin, extendCell = new Cell(true)) {
    const arr = [];
    const { rotation, partRow, partColumn } = extendCell;

    for (const color of cellColorStr) {
        for (const gobi of visibleGobis) {
            arr.push({ skin, color, gobi, rotation, partRow, partColumn });
        }
    }


    return arr;
}

export function calcExtendSkinCellViewParams(skin) {
    const arr = [];
    const rotations = [0, 90, 180, 270];
    for(const rotation of rotations) {
        for(let partRow = 0; partRow < MAX_MINO_SIZE; partRow++) {
            for(let partColumn = 0; partColumn < MAX_MINO_SIZE; partColumn++) {
                const extendCell = new Cell(true, undefined, { rotation, partRow, partColumn });
                const cellViewParamsList = calcSkinCellViewParams(skin, extendCell);
                arr.push(...cellViewParamsList);
            }
        }
    }
    return arr;
}