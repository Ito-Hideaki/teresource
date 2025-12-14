import Phaser from "phaser";
import { UniqueTextureKeyGenerator } from "#util";
import { calcSkinCellViewParams, cellColorStr, generateCellTextureKey, gobis, parseCellViewParams } from "./viewmechanics";

const utkg = new UniqueTextureKeyGenerator("celltexture");

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

export class CellTextureParent {

    /** @param {import("./viewmechanics").ParsedCellViewParams} parsedCellViewParams @return {string}*/
    static getFrameKey(parsedCellViewParams) {
        parsedCellViewParams.skin = "skin";
        return generateCellTextureKey(parseCellViewParams);
    }

    /** @param {Phaser.Scene} scene @param {string} skin  */
    constructor(scene, skin) {
        const cellWidth = 30;
        const key = utkg.get();
        this.texture = scene.textures.createCanvas(key, getRequiredTextureWidth(cellWidth), getRequiredTextureHeight(cellWidth));
        if(this.texture === null) throw "wtf";
        this.texture.cellTextureParent = this;
        this.skin = skin;
        this.scene = scene;

        this.draw(cellWidth);

        this.texture.refresh();
    }

    draw(cellWidth) {
        const cellViewParamsList = calcSkinCellViewParams(this.skin);
        const parsedCellViewParamsList = cellViewParamsList.map(params => parseCellViewParams(params));
        parsedCellViewParamsList.forEach(parsedCellViewParams => {
            this.createAndDrawFrame(cellWidth, parsedCellViewParams);
        });
    }

    createAndDrawFrame(cellWidth, parsedCellViewParams) {
        const ctx = this.texture.canvas.getContext("2d");
        const framePos = getFrameXY(cellWidth, parsedCellViewParams);
        const textureKey = generateCellTextureKey(parsedCellViewParams);
        const frameImg = this.scene.textures.get(textureKey).getSourceImage();
        ctx.drawImage(frameImg, framePos.x, framePos.y, cellWidth, cellWidth);

        const frameKey = CellTextureParent.getFrameKey(parsedCellViewParams);
        this.texture.add(frameKey, 0, framePos.x, framePos.y, cellWidth, cellWidth);
    }
}