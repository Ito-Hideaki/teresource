import Phaser from "phaser";
import { Board, BoardSize } from "../core/mechanics";
import {  generateCellSheetTextureFrameKey, GOBI } from "./celltexturecore";
import { CellSheetParent } from "./customtexture";

export class CellImage extends Phaser.GameObjects.Image {

    #displayWidth
    #cellSheetParent

    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {CellSheetParent} cellSheetParent
     * @param {number} displayWidth
     */
    constructor(scene, x, y, cellSheetParent, displayWidth) {
        super(scene, x, y, cellSheetParent.texture);
        this.setOrigin(0, 0);
        this.#displayWidth = displayWidth;
        this.#cellSheetParent = cellSheetParent;

        this.setView({ color: "black", gobi: GOBI.invisible });
    }

    /** @param {import("./celltexturecore").CellViewParams} cellViewParams */
    setView(cellViewParams) {
        if(cellViewParams.gobi === GOBI.invisible) {
            this.setVisible(false);
        } else {
            this.setVisible(true);

            const extend = this.#cellSheetParent.extend && this.#cellSheetParent.extend.includes(cellViewParams.color);
            const frame = generateCellSheetTextureFrameKey(cellViewParams, extend);
            this.setFrame(frame);
            this.setDisplaySize(this.#displayWidth, this.#displayWidth);
        }
    }
}

export class ImageBoard extends Board {
    /** @param {BoardSize} boardSize */
    constructor(boardSize) {
        super(boardSize, () => undefined);
    }

    /** @return {CellImage[][]} */
    getTable() {
        return this.table;
    }
}