import Phaser from "phaser";
import { Board, BoardSize } from "../core/mechanics";
import {  generateCellSheetTextureFrameKey, GOBI } from "./viewmechanics";
import { CellSheetParent } from "./customtexture";

export class CellImage extends Phaser.GameObjects.Image {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {CellSheetParent} cellSheetParent
     */
    constructor(scene, x, y, cellSheetParent) {
        super(scene, x, y, cellSheetParent.texture);
        this.setOrigin(0, 0);

        this.setView({ color: "black", gobi: GOBI.invisible });
    }

    /** @param {import("./viewmechanics").CellViewParams} cellViewParams */
    setView(cellViewParams) {
        if(cellViewParams.gobi === GOBI.invisible) {
            this.setVisible(false);
        } else {
            this.setVisible(true);
            const frame = generateCellSheetTextureFrameKey(cellViewParams);
            this.setFrame(frame);
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