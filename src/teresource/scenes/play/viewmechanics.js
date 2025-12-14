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

export const gobis = [
    "n",
    "a"
]

/**
 * @typedef {{
 * skin: string | undefined,
 * color: number | string | undefined,
 * isActive: boolean | undefined,
 * gobi: string | undefined,
 * }} CellViewParams uncertain params about cell image

 * @typedef {{
    skin: string,
    color: string,
    isActive: boolean
}} ParsedCellViewParams parsed certain params about cell image
 * */


/**
 * @param {CellViewParams} $
 * @return {ParsedCellViewParams}
 * */
export function parseCellViewParams($) {
    $.skin ??= "default";
    if (typeof $.color === "number") {
        $.color = Math.floor($.color) % cellColorStr.length;
        $.color = cellColorStr[$.color];
    }
    $.color ??= "red";
    $.gobi ??= "n";
    $.isActive ??= false;
    if ($.gobi === "a") {
        $.isActive = true;
    }
    return $;
}

/** @param {ParsedCellViewParams} p @return string an alphabet */
function createStatusGobi(p) {
    let statusGobi = "n";
    if (p.isActive) statusGobi = "a";
    return statusGobi;
}

/**
 * @param {ParsedCellViewParams} $
 * */
export function generateCellTextureKey($) {
    const p = parseCellViewParams($);
    return `cell_${p.skin}_${p.color}_${createStatusGobi(p)}`;
}

/**
 * @param {ParsedCellViewParams} $
 * */
export function generateCellTextureUrl($) {
    const p = parseCellViewParams($);
    return `/image/cell/${p.skin}/${p.color}_${createStatusGobi(p)}.png`;
}

/** All possible CellViewParams of a skin.
 * @param {string} skin
 * @return {CellViewParams[]} */
export function calcSkinCellViewParams(skin) {
    const arr = [];
    for (let i = 0; i < 7; i++) {
        const color = cellColorStr[i];
        gobis.forEach(gobi => {
            /** @type {CellViewParams} */
            const params = { skin, color, gobi };
            arr.push(params);
        });
    }
    return arr;
}


/** @param {ParsedCellViewParams} parsedCellViewParams @return {string}*/
export function generateCellSheetTextureFrameKey(parsedCellViewParams) {
    parsedCellViewParams.skin = "skin";
    return generateCellSheetTextureKey(parseCellViewParams);
}

/** @param {string} skin @return {string}*/
export function generateCellSheetTextureKey(skin) {
    return `cellsheet_${skin}`;
}