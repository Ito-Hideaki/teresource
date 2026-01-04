import Phaser from "phaser";
import { cellColorStr } from "../core/coredata";
import {  cellImgSkins_fromImgs, cellImgSkins_fromSheet } from "./viewdata";
import { calcSkinCellViewParams, generateCellTextureKey, visibleGobis, generateCellSheetTextureKey, generateCellSheetTextureFrameKey } from "./viewmechanics";

/**  @param {import("./viewmechanics").CellViewParams} cellViewParams */
function getFramePosition(cellViewParams) {
    let column = 0;
    column += cellColorStr.indexOf(cellViewParams.color);
    let row = visibleGobis.indexOf(cellViewParams.gobi);
    return { column, row };
}

/** @param {number} cellWidth @param {import("./viewmechanics").CellViewParams} cellViewParams @return {{ x: number, y: number }} */
function getFrameXY(cellWidth, cellViewParams) {
    const pos = getFramePosition(cellViewParams);
    return { x: pos.column * cellWidth, y: pos.row * cellWidth };
}

function getRequiredTextureWidth(cellWidth) {
    return cellWidth * cellColorStr.length;
}

function getRequiredTextureHeight(cellWidth) {
    return cellWidth * visibleGobis.length;
}

/** if the given skin is fromImgs skins, draws out new texture using preloaded textures.
 *  if the given skin is fromSheet skins, just use it as its texture.
 */
export class CellSheetParent {

    /** @param {Phaser.Scene} scene @param {string} skin @param {number} textureCellWidth */
    constructor(scene, skin, textureCellWidth) {
        this.skin = skin;
        this.scene = scene;
        this.textureCellWidth = textureCellWidth;
        this.#init();
    }

    #init() {
        const skin = this.skin;
        const scene = this.scene;
        const cellWidth = this.textureCellWidth;
        const key = generateCellSheetTextureKey(skin);
        const cellViewParamsList = calcSkinCellViewParams(this.skin);

        if (cellImgSkins_fromImgs.includes(skin)) {
            this.texture = scene.textures.createCanvas(key, getRequiredTextureWidth(cellWidth), getRequiredTextureHeight(cellWidth));
            if (this.texture === null) throw "wtf";
            cellViewParamsList.forEach(cellViewParams => {
                this.drawFrame(cellWidth, cellViewParams);
                this.createFrame(cellWidth, cellViewParams);
            });
            this.texture.refresh();
        }
        else if (cellImgSkins_fromSheet.includes(skin)) {
            this.texture = scene.textures.get(generateCellSheetTextureKey(skin));
            cellViewParamsList.forEach(cellViewParams => {
                this.createFrame(cellWidth, cellViewParams);
            });
        }
        else {
            throw "no such skin";
        }
    }

    drawFrame(cellWidth, cellViewParams) {
        const ctx = this.texture.canvas.getContext("2d");
        const framePos = getFrameXY(cellWidth, cellViewParams);
        const textureKey = generateCellTextureKey(cellViewParams);
        const frameImg = this.scene.textures.get(textureKey).getSourceImage();
        ctx.drawImage(frameImg, framePos.x, framePos.y, cellWidth, cellWidth);
    }

    createFrame(cellWidth, cellViewParams) {
        const framePos = getFrameXY(cellWidth, cellViewParams);
        const frameKey = generateCellSheetTextureFrameKey(cellViewParams);
        this.texture.add(frameKey, 0, framePos.x, framePos.y, cellWidth, cellWidth);
    }
}