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

export const cellImgSkins = [
    "default",
    "tikin",
]

export const cellGraphicSkins = [
    "rect",
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
function parseCellViewParams($) {
    $.skin ??= "default";
    if (typeof $.color === "number") {
        $.color = Math.floor($.color) % cellColorStr.length;
        $.color = cellColorStr[$.color];
    }
    $.color ??= "red";
    $.gobi ??= "n";
    $.isActive ??= false;
    if($.gobi === "a") {
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
 * @param {CellViewParams} $
 * */
export function generateCellTextureKey($) {
    const p = parseCellViewParams($);
    return `cell_${p.skin}_${p.color}_${createStatusGobi(p)}`;
}

/**
 * @param {CellViewParams} $
 * */
export function generateCellTextureUrl($) {
    const p = parseCellViewParams($);
    return `/image/cell/${p.skin}/${p.color}_${createStatusGobi(p)}.png`;
}

/** All possible CellViewParams but without graphic rendering skin.
 *  Can be used to load cell images.
 * @return {CellViewParams[]} */
export function calcAllImgCellViewParams() {
    const arr = [];
    cellImgSkins.forEach(skin => {
        for(let i = 0; i < 7; i++) {
            const color = cellColorStr[i];
            ["n", "a"].forEach(gobi => {
                /** @type {CellViewParams} */
                const params = { skin, color, gobi };
                arr.push(params);
            });
        }
    });
    return arr;
}