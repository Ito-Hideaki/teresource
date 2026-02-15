import Phaser from "phaser";
import { cellColorStr } from "../core/coredata";
import { cellImgSkins, cellImgSkins_fromImgs, cellImgSkins_fromSheet, IMG_SKIN_DATA_INDEX } from "./viewdata";
import { calcSkinCellViewParams, generateCellTextureKey, visibleGobis, generateCellTextureUrl, generateCellSheetTextureKey, generateCellSheetTextureUrl, generateCellSheetTextureFrameKey, calcExtendSkinCellViewParams } from "./celltexturecore";
import { viteURLify } from "#util";

/**  @param {import("./celltexturecore").CellViewParams} cellViewParams */
function getFramePosition(cellViewParams) {
    let column = 0;
    column += cellColorStr.indexOf(cellViewParams.color);
    let row = visibleGobis.indexOf(cellViewParams.gobi);
    return { column, row };
}

/** @param {number} cellWidth @param {import("./celltexturecore").CellViewParams} cellViewParams @return {{ x: number, y: number }} */
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

    extend;
    textureCellWidth;

    /** @param {Phaser.Scene} scene @param {string} skin */
    constructor(scene, skin) {
        this.skin = skin;
        this.scene = scene;
        if (cellImgSkins.includes(skin)) {
            this.textureCellWidth = IMG_SKIN_DATA_INDEX[skin].cellWidth;
        }
        if (cellImgSkins_fromSheet.includes(skin)) {
            this.extend = IMG_SKIN_DATA_INDEX[skin].extend;
        }
        this.#init();
    }

    #init() {
        const skin = this.skin;
        const scene = this.scene;
        const cellWidth = this.textureCellWidth;
        const key = generateCellSheetTextureKey(skin);
        const cellViewParamsList = calcSkinCellViewParams(this.skin);

        // if it's skin of imgs
        if (cellImgSkins_fromImgs.includes(skin)) {
            this.texture = scene.textures.createCanvas(key, getRequiredTextureWidth(cellWidth), getRequiredTextureHeight(cellWidth));
            if (this.texture === null) throw "wtf";
            cellViewParamsList.forEach(cellViewParams => {
                this.drawFrame(cellViewParams);
                this.createFrame(cellViewParams);
            });
            this.texture.refresh();
        }
        // if it's skin of sheet
        else if (cellImgSkins_fromSheet.includes(skin)) {
            const textureKey = generateCellSheetTextureKey(skin);
            this.texture = scene.textures.get(textureKey);
            cellViewParamsList.forEach(cellViewParams => {
                this.createFrame(cellViewParams);
            });
            //add frames for extended skin
            if (IMG_SKIN_DATA_INDEX[skin].extend) {
                const extendTexture = this.scene.textures.get(generateCellSheetTextureKey(skin, true));
                this.texture.source.push(extendTexture.source[0]);
                const extendCellViewParamsList = calcExtendSkinCellViewParams(skin);
                extendCellViewParamsList.forEach(cellViewParams => {
                    switch (skin) {
                        case "choco":
                            this.createExtFrame_Choco(cellViewParams);
                            break;
                    }
                });

            }
        }
        else {
            throw "no such skin";
        }
    }

    drawFrame(cellViewParams) {
        const cellWidth = this.textureCellWidth;
        const ctx = this.texture.canvas.getContext("2d");
        const framePos = getFrameXY(cellWidth, cellViewParams);
        const textureKey = generateCellTextureKey(cellViewParams);
        const frameImg = this.scene.textures.get(textureKey).getSourceImage();
        ctx.drawImage(frameImg, framePos.x, framePos.y, cellWidth, cellWidth);
    }

    createFrame(cellViewParams) {
        const cellWidth = this.textureCellWidth;
        const framePos = getFrameXY(cellWidth, cellViewParams);
        const frameKey = generateCellSheetTextureFrameKey(cellViewParams);
        this.texture.add(frameKey, 0, framePos.x, framePos.y, cellWidth, cellWidth);
    }

    // Note: extend frame functions are not ought to add frames to the texture for every cellViewParams but for those expected to called (inclueded in IMG_SKIN_DATA_INDEX extend)
    /** @param {import("./celltexturecore").CellViewParams} cellViewParams */
    createExtFrame_Choco(cellViewParams) {
        if(!(["sky", "yellow"].includes(cellViewParams.color))) return;

        const cellWidth = this.textureCellWidth;

        const frameX = getFrameXY(cellWidth, cellViewParams).x;
        const frameKey = generateCellSheetTextureFrameKey(cellViewParams, true);
        let frameY;
        switch (cellViewParams.color) {
            case "sky":
                frameY = getFrameXY(cellWidth, cellViewParams).y; //gobi
                if(cellViewParams.rotation === 90 || cellViewParams.rotation === 270) frameY += cellWidth * 2; //rotation
                break;
            case "yellow":
                frameY = getFrameXY(cellWidth, cellViewParams).y;
                break;
        }
        this.texture.add(frameKey, 1, frameX, frameY, cellWidth, cellWidth);
    }
}

/** @param {Phaser.Scene} scene */
export function loadCellSkinTextures(scene) {
    cellImgSkins_fromImgs.forEach(skin => {
        const cellViewParamsList = calcSkinCellViewParams(skin);
        cellViewParamsList.forEach(cellViewParams => {
            const key = generateCellTextureKey(cellViewParams);
            const url = generateCellTextureUrl(cellViewParams);
            scene.load.image(key, viteURLify(url));
        })
    });
    cellImgSkins_fromSheet.forEach(skin => {
        const key = generateCellSheetTextureKey(skin);
        const url = generateCellSheetTextureUrl(skin);
        scene.load.image(key, viteURLify(url));
        if (IMG_SKIN_DATA_INDEX[skin].extend) {
            const key = generateCellSheetTextureKey(skin, true);
            const url = generateCellSheetTextureUrl(skin, true);
            scene.load.image(key, viteURLify(url));
        }
    });
}