import Phaser from "phaser";
import { calcSkinCellViewParams, cellColorStr, cellImgSkins_fromImgs, cellImgSkins_fromSheet, generateCellTextureKey, gobis, parseCellViewParams, generateCellSheetTextureKey, generateCellSheetTextureFrameKey } from "./viewmechanics";

/**  @param {import("./viewmechanics").ParsedCellViewParams} parsedCellViewParams */
function getFramePosition(parsedCellViewParams) {
    let column = 0;
    column += cellColorStr.indexOf(parsedCellViewParams.color);
    let row = 0;
    if (parsedCellViewParams.isActive) row += 1;
    return { column, row };
}

/** @param {number} cellWidth @param {import("./viewmechanics").ParsedCellViewParams} parsedCellViewParams @return { x: number, y: number } */
function getFrameXY(cellWidth, parsedCellViewParams) {
    const pos = getFramePosition(parsedCellViewParams);
    return { x: pos.column * cellWidth, y: pos.row * cellWidth };
}

function getRequiredTextureWidth(cellWidth) {
    return cellWidth * cellColorStr.length;
}

function getRequiredTextureHeight(cellWidth) {
    return cellWidth * gobis.length;
}

/** if the given skin is fromImgs skins, draws out new texture using preloaded textures.
 *  if the given skin is fromSheet skins, just use it as its texture.
 */
export class CellSheetParent {

    /** @param {Phaser.Scene} scene @param {string} skin  */
    constructor(scene, skin) {
        this.skin = skin;
        this.scene = scene;
        this.#init();
    }

    #init() {
        const skin = this.skin;
        const scene = this.scene;
        const cellWidth = 30;
        const key = generateCellSheetTextureKey(skin);
        const cellViewParamsList = calcSkinCellViewParams(this.skin);
        const parsedCellViewParamsList = cellViewParamsList.map(params => parseCellViewParams(params));

        if (cellImgSkins_fromImgs.includes(skin)) {
            this.texture = scene.textures.createCanvas(key, getRequiredTextureWidth(cellWidth), getRequiredTextureHeight(cellWidth));
            if (this.texture === null) throw "wtf";
            this.texture.cellTextureParent = this;
            parsedCellViewParamsList.forEach(parsedCellViewParams => {
                this.drawFrame(cellWidth, parsedCellViewParams);
                this.createFrame(cellWidth, parsedCellViewParams);
            });
            this.texture.refresh();
        }
        else if (cellImgSkins_fromSheet.includes(skin)) {
            this.texture = scene.textures.get(generateCellSheetTextureKey(skin));
            parsedCellViewParamsList.forEach(parsedCellViewParams => {
                this.createFrame(cellWidth, parsedCellViewParams);
            });
        }
        else {
            throw "no such skin";
        }
    }

    drawFrame(cellWidth, parsedCellViewParams) {
        const ctx = this.texture.canvas.getContext("2d");
        const framePos = getFrameXY(cellWidth, parsedCellViewParams);
        const textureKey = generateCellTextureKey(parsedCellViewParams);
        const frameImg = this.scene.textures.get(textureKey).getSourceImage();
        ctx.drawImage(frameImg, framePos.x, framePos.y, cellWidth, cellWidth);
    }

    createFrame(cellWidth, parsedCellViewParams) {
        const framePos = getFrameXY(cellWidth, parsedCellViewParams);
        const frameKey = generateCellSheetTextureFrameKey(parsedCellViewParams);
        this.texture.add(frameKey, 0, framePos.x, framePos.y, cellWidth, cellWidth);
    }
}